import { test, expect } from '@playwright/test';

test('wallet fetch flow', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('input[type="email"]', 'tony@trustbank.tech');
  await page.fill('input[type="password"]', 'trustbanktech!');
  await page.click('button[type="submit"]');

  // Wait for navigation to dashboard
  await page.waitForURL('**/dashboard');
  console.log('Successfully logged in and reached dashboard');

  // 2. Wait for wallet overview to load
  const walletOverview = await page.waitForSelector('[data-testid="wallet-overview"]', { timeout: 10000 });
  console.log('Found wallet overview section');

  // 3. Check for USDT wallet card
  const usdtCard = await page.waitForSelector('[data-testid="wallet-card-usdt"]', { timeout: 10000 });
  console.log('Found USDT wallet card');

  // 4. Get wallet address
  const walletAddress = await usdtCard.getAttribute('data-wallet-address');
  console.log('USDT Wallet Address:', walletAddress);

  // 5. Check network requests
  const walletRequests = [];
  page.on('request', request => {
    if (request.url().includes('/api/wallet')) {
      walletRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/wallet')) {
      try {
        const body = await response.json();
        console.log('Wallet API Response:', {
          url: response.url(),
          status: response.status(),
          body
        });
      } catch (e) {
        console.log('Failed to parse response:', e);
      }
    }
  });

  // 6. Check console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser Error:', msg.text());
    }
  });

  // Wait for any potential errors
  await page.waitForTimeout(5000);
}); 