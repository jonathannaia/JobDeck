import puppeteer from 'puppeteer'

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
await page.setViewport({ width: 1280, height: 800 })

// Use the correct form parameters
const url = 'https://www.canada411.ca/search/?stype=ad&st=23+Marilyn+Cres&ci=Brampton&pv=ON&pc='
console.log('Searching:', url)

await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 })
await new Promise(r => setTimeout(r, 2000))

const result = await page.evaluate(() => {
  // Get page text
  const text = document.body.innerText

  // Look for phone numbers
  const phones = text.match(/\(\d{3}\)\s*\d{3}-\d{4}/g) || []

  // Get all unique class names
  const classes = [...new Set(
    [...document.querySelectorAll('[class]')].map(el => el.className).join(' ').split(/\s+/)
  )].filter(c => c.length > 3)

  return { 
    phones, 
    textPreview: text.slice(0, 1500),
    classes: classes.filter(c => 
      ['result', 'listing', 'card', 'vcard', 'contact', 'person', 'name', 'tel', 'phone']
        .some(k => c.toLowerCase().includes(k))
    ).slice(0, 20)
  }
})

console.log('Phone numbers:', result.phones)
console.log('Relevant classes:', result.classes)
console.log('\nPage text:\n', result.textPreview)

await browser.close()
