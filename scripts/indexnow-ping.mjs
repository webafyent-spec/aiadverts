// Pings IndexNow (Bing, Yandex, Seznam, Naver etc.) after every production build
// so new/changed pages get crawled without waiting for the next organic crawl.
// Runs as a postbuild step — fails silently so a network hiccup never breaks a deploy.

const KEY = '0c4236ff38a9413191d55cf5a5baf16f'
const HOST = 'aiadverts.co.za'

const urlList = [
  'https://aiadverts.co.za/',
  'https://aiadverts.co.za/blog',
  'https://aiadverts.co.za/blog/ai-advertising-agency-durban',
  'https://aiadverts.co.za/blog/ai-video-ads-cost-south-africa',
  'https://aiadverts.co.za/blog/ai-vs-traditional-video-production',
  'https://aiadverts.co.za/blog/ai-adverts-skincare-beauty-brands-south-africa',
  'https://aiadverts.co.za/blog/ai-video-ads-restaurants-south-africa',
  'https://aiadverts.co.za/blog/ai-product-photography-jewellery-south-africa',
  'https://aiadverts.co.za/blog/ai-video-ads-gaming-tech-brands-south-africa',
  'https://aiadverts.co.za/blog/ai-video-ads-coffee-cafe-brands-south-africa',
  'https://aiadverts.co.za/blog/ai-adverts-fragrance-perfume-brands-south-africa',
  'https://aiadverts.co.za/blog/ai-social-media-management-small-business-south-africa',
  'https://aiadverts.co.za/blog/ai-adverts-fashion-clothing-brands-south-africa'
]

// Only run in Vercel's production build, not local dev builds
if (process.env.VERCEL_ENV !== 'production') {
  console.log('[indexnow] Skipping — not a production build')
  process.exit(0)
}

try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList
    })
  })
  console.log(`[indexnow] Submitted ${urlList.length} URLs — status ${res.status}`)
} catch (err) {
  console.log('[indexnow] Ping failed (non-fatal):', err.message)
}
