import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
const debug = require('debug');

dotenv.config({ path: '.env.local' });
const log = debug('test:wallet');

test('test wallet endpoints', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:3000/auth/login', { waitUntil: 'networkidle' });
  
  // Wait for animations to complete
  await page.waitForTimeout(1000); // Wait for 1 second for animations
  
  // Log page content for debugging
  console.log('test:wallet', 'Page URL:', page.url());
  console.log('test:wallet', 'Page content:', await page.content());
  
  // Wait for email input to be visible and interactable
  await page.waitForSelector('input.flex.w-full.rounded-md.border[type="email"]', { state: 'visible', timeout: 60000 });
  
  // Wait for the form to be ready
  await page.waitForSelector('form', { timeout: 60000 });
  
  // Fill in login form
  await page.fill('input.flex.w-full.rounded-md.border[type="email"]', 'test1736964390420@trustbank.tech');
  await page.fill('#password', 'Test123!@#');
  
  // Click login button and wait for navigation
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click('button[type="submit"]')
  ]);

  // Wait for dashboard to load
  await page.waitForURL('http://localhost:3000/dashboard', { timeout: 60000 });
  await page.waitForSelector('main', { timeout: 60000 });

  // Test wallet endpoints
  console.log('Testing wallet endpoints...');

  // Test /api/wallet/balances
  const balancesResponse = await page.evaluate(async () => {
    const response = await fetch('/api/wallet/balances');
    return response.json();
  });
  console.log('Wallet balances response:', balancesResponse);

  // Test /api/wallet/balance
  const balanceResponse = await page.evaluate(async () => {
    const response = await fetch('/api/wallet/balance');
    return response.json();
  });
  console.log('Wallet balance response:', balanceResponse);
});