import Parser from 'rss-parser';
import { AtpAgent } from '@atproto/api'
import ogs from 'open-graph-scraper';
import sharp from 'sharp';

const HISTORY_SIZE = 200;
const HISTORY_DIR = 'history/';

const parser = new Parser({});
let history = {};

async function uploadImageFromUrl(agent, url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch image: ${response.statusText}`);
	}
	const imageData = await response.arrayBuffer();
	const compressed = await sharp(imageData).resize(800, 418).jpeg().toBuffer();
	const uint8Array = new Uint8Array(compressed);

	const { data } = await agent.uploadBlob(uint8Array, { encoding: 'image/jpeg' });
	return data.blob;
}

async function postItem(agent, item) {
	const res = await ogs({ url: item.link });
	if (res.error) return;
	const imageUrl = res.result.twitterImage?.[0]?.url ?? res.result.ogImage?.[0]?.url;
	if (!imageUrl) return;
	const imageData = await uploadImageFromUrl(agent, imageUrl);
	
	await agent.post({
		text: item.content,
		createdAt: new Date().toISOString(),
		embed: {
		  $type: 'app.bsky.embed.external',
		  external: {
			uri: item.link,
			title: item.title,
			description: '',
			thumb: imageData
		  }
		},
	});
}

async function refreshFeed(feed) {
	console.log(`Fetching ${feed.id}`);
	const feedData = await parser.parseURL(feed.url);

	const newPosts = feedData.items.filter(item => !history[feed.id].includes(item.guid));

	if (newPosts.length) {
		const agent = new AtpAgent({ service: 'https://bsky.social' });
		await agent.login({ identifier: feed.identifier, password: feed.password });
		
		for (const item of newPosts) {
			try {
				await postItem(agent, item);
			} catch {
				console.log(`Failed to create post for ${item.guid}`);
			}
		}

		await agent.logout();
	}
	console.log(`Created ${newPosts.length} new post(s) from ${feed.id}`);
	
	history[feed.id].splice(0, Math.max(0, newPosts.length + history[feed.id].length - HISTORY_SIZE), ...newPosts.map(item => item.guid));
	Bun.write(HISTORY_DIR + feed.id + ".json", JSON.stringify(history[feed.id]));
}

const config = await Bun.file('config.json').json();

for (const feed of config) {
	try { // Load history if it exists
		history[feed.id] = await Bun.file(HISTORY_DIR + feed.id + '.json').json();
	} catch {
		history[feed.id] = [];
	}
	await refreshFeed(feed);
	setInterval(() => refreshFeed(feed), feed.interval * 1000);
}