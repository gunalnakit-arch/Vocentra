const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

  console.log('Navigating to dashboard...');
  try {
    const response = await page.goto('http://localhost:3000/dashboard?assistantId=df3bc456-5798-4d52-8fd0-56f5fbc4f7b3', { waitUntil: 'networkidle0' });
    console.log('Status:', response.status());
  } catch (e) {
    console.error('Failed to navigate:', e.message);
  }
  
  await browser.close();
})();
