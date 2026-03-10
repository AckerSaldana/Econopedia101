# n8n Auto-Blog Setup Guide

## Quick Start

1. Open [n8n Cloud](https://app.n8n.cloud)
2. Go to **Workflows** → **Import from File**
3. Upload `econopedia-auto-blog.json`

## Credentials to Configure

### 1. Supabase API
- **Settings → Credentials → Add → Supabase API**
- Host URL: `https://xldmpzwqrqoirccvklcn.supabase.co`
- Service Role Key: Get from Supabase Dashboard → Settings → API → `service_role` key
- **Important:** Use the `service_role` key (NOT `anon` key) — it bypasses RLS for inserts

### 2. OpenAI API
- **Settings → Credentials → Add → OpenAI API**
- API Key: Your OpenAI API key with GPT-5 Nano access

### 3. NewsAPI Key
- Register at [newsapi.org/register](https://newsapi.org/register) (free: 100 req/day)
- In the **Fetch News** node, replace the header auth credential with your key
- Alternatively, set up an **HTTP Header Auth** credential:
  - Name: `X-Api-Key`
  - Value: Your NewsAPI key

## How It Works

```
Daily 8AM UTC
  → Fetch 20 recent articles from NewsAPI (economy, finance, markets, trade, etc.)
  → Extract top 10 into a prompt
  → Fetch recent posts (last 7 days) from Supabase
  → Merge headlines + recent post titles
  → GPT-5 Nano picks the best topic (avoiding recent duplicates)
  → Fetch & clean full article text
  → GPT-5 Nano writes article as structured JSON blocks
  → Validate blocks + build Supabase payload
  → Insert as draft post (draft=true, published_at=null)
  → If quiz included:
      → Insert quiz (published=false)
      → Append quiz block to post
      → Update post with quiz reference
```

## Testing

1. Open the workflow in n8n
2. Click **Test Workflow** (play button) to run it once manually
3. Check Supabase → `posts` table for a new draft row
4. Open `/admin` → the draft should appear in the post list under "Drafts" tab
5. Preview at `/blog/{slug}?preview` (preview mode bypasses draft filter)

## Human Review Flow

1. Draft appears in `/admin` post list (amber "Draft" status)
2. Editor reviews and edits blocks, adds cover image, tweaks title/description
3. If a quiz was created, review it in the Quizzes section of admin
4. Uncheck "Draft" and set publish date → post goes live

## Troubleshooting

- **Empty articles array:** NewsAPI free tier only returns headlines for the last 24h. If no business news, the array may be empty. The Extract Headlines node will produce an empty list, and the AI may generate a generic article.
- **JSON parse error in validation:** The OpenAI node has JSON mode enabled. If it still returns invalid JSON, check the model setting — ensure it's `gpt-5-nano` or another model that supports JSON mode.
- **Supabase insert fails:** Verify you're using the `service_role` key, not the `anon` key. The anon key requires authenticated admin access.
- **Duplicate slug error:** The `slug` column has a UNIQUE constraint. The workflow fetches recent posts (last 7 days) and tells the AI to avoid those topics, but if a slug collision still occurs the insert will fail. Check the "Fetch Recent Posts" node output to verify it's returning data.

## Alternative News Sources

If NewsAPI doesn't suit your needs, swap the Fetch News node:

**Google News RSS** (free, no key):
- URL: `https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx6TVdZU0FtVnVHZ0pIUWlnQVAB?hl=en-GB&gl=GB&ceid=GB:en`
- Add an XML node after to parse RSS → extract `item` array

**BBC Business RSS**:
- URL: `https://feeds.bbci.co.uk/news/business/rss.xml`
