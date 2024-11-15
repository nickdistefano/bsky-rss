# bsky-rss

This is a simple script to automatically pull posts from an RSS feed and post them to Bluesky.

## Installation
1. Clone this repo or download as a zip file
2. Install bun
3. Run `bun install`

## Getting Started
All required config is done in `config.json`.
Here is an example of a basic config:
```json
[
    {
        "id" : "NYT Home Page",
        "url" : "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        "identifier" : "example.bsky.social",
        "password" : "abcd-efgh-ijkl-mnop",
        "interval" : 300
    }
]
```
Here is an explanation of each property:
- `id` : The filename used to store metadata and feed history (to avoid duplicate posts). This needs to be unique per entry.
- `url` : The url of the RSS feed to pull from
- `identifier` : Bluesky account identifier to post from
- `password` : App password from Settings > Advanced > App Passwords
- `interval` : Number of seconds to wait between checking this feed for changes

Once you have set your config, use `bun run main.js` to run the program.
It should have no issues restarting where it left off without duplicating posts.

Here is a more complex example that handles multiple feeds and multiple accounts. This shows the config for 2 accounts - one for NYT and one for reddit.
```json
[
    {
        "id" : "NYT Home Page",
        "url" : "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
        "identifier" : "nytexample.bsky.social",
        "password" : "abcd-efgh-ijkl-mnop",
        "interval" : 300
    },
    {
        "id" : "NYT Politics",
        "url" : "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
        "identifier" : "nytexample.bsky.social",
        "password" : "abcd-efgh-ijkl-mnop",
        "interval" : 300
    },
    {
        "id" : "NYT Business",
        "url" : "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
        "identifier" : "nytexample.bsky.social",
        "password" : "abcd-efgh-ijkl-mnop",
        "interval" : 300
    },
    {
        "id" : "Reddit",
        "url" : "https://www.reddit.com/.rss",
        "identifier" : "redditexample.bsky.social",
        "password" : "1234-5678-1234-5678",
        "interval" : 1000
    }
]
```
