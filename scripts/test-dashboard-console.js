const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR CONSOLE:', msg.text());
  });
  page.on('pageerror', error => console.error('BROWSER PAGE ERROR:', error.message));

  console.log('Navigating to dashboard...');
  try {
    await page.goto('http://localhost:3000/dashboard?assistantId=df3bc456-5798-4d52-8fd0-56f5fbc4f7b3', { waitUntil: 'networkidle2' });
    console.log('Finished navigating.');
  } catch (e) {
    console.error('Failed to navigate:', e.message);
  }
  
  await browser.close();
})();
