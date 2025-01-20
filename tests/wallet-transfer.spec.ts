import { test, expect } from '@playwright/test';

test('wallet transfer test', async ({ page }) => {
  // Login as User 1
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('[data-testid="email"]', 'tony@trustbank.tech');
  await page.fill('[data-testid="password"]', 'trustbanktech!');
  await page.click('[data-testid="login-button"]');
  console.log('Logged in as User 1');

  // Navigate to wallet page and wait for it to load
  await page.goto('http://localhost:3000/profile/wallet');
  await page.waitForURL('**/profile/wallet');
  await page.waitForLoadState('networkidle');

  // Wait for profile to be loaded with Quidax ID
  const profileResponse = await page.waitForResponse(response => 
    response.url().includes('/api/profile') && 
    response.status() === 200
  );
  const profileData = await profileResponse.json();
  expect(profileData.quidax_id).toBeDefined();
  console.log('Profile loaded with Quidax ID:', profileData.quidax_id);

  // Wait for wallet data to be loaded
  const walletResponse = await page.waitForResponse(response => 
    response.url().includes('/api/wallet') && 
    response.status() === 200
  );
  const walletData = await walletResponse.json();
  expect(walletData).toBeDefined();
  console.log('Wallet data loaded:', walletData);

  // Wait for USDT wallet card to be visible
  await page.waitForSelector('div[data-testid="wallet-card-usdt"]', { timeout: 10000 });
  console.log('Found USDT wallet card');

  // Click the deposit button within the USDT wallet card
  const usdtCard = await page.locator('div[data-testid="wallet-card-usdt"]');
  await usdtCard.locator('button:has-text("Deposit")').click();
  console.log('Clicked deposit button on USDT card');

  // Wait for deposit modal and get wallet address
  await page.waitForSelector('div[role="dialog"]', { timeout: 10000 });
  await page.waitForSelector('h2:has-text("Deposit USDT")', { timeout: 10000 });
  await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 10000 }); // Wait for loading spinner to disappear
  await page.waitForSelector('div.text-sm.break-all', { timeout: 10000 });
  const walletAddress = await page.locator('div.text-sm.break-all').textContent();
  if (!walletAddress) {
    throw new Error('Failed to get wallet address');
  }
  console.log('Got wallet address:', walletAddress);

  // Close deposit modal by clicking the X button in the top-right corner
  await page.click('button.absolute.right-4.top-4');
  console.log('Closed deposit modal');

  // Click profile button and sign out
  await page.click('button[variant="outline"][size="sm"]:has-text("Profile")');
  await page.waitForSelector('div[role="menuitem"]:has-text("Sign Out")');
  await page.click('div[role="menuitem"]:has-text("Sign Out")');
  console.log('Logged out User 1');

  // Login as User 2
  await page.goto('http://localhost:3000/auth/login');
  await page.fill('[data-testid="email"]', 'test1735848851306@trustbank.tech');
  await page.fill('[data-testid="password"]', 'trustbank123');
  await page.click('[data-testid="login-button"]');
  console.log('Logged in as User 2');

  // Navigate to wallet page and wait for it to load
  await page.goto('http://localhost:3000/profile/wallet');
  await page.waitForURL('**/profile/wallet');
  await page.waitForLoadState('networkidle');
  const usdtCard2 = await page.waitForSelector('div[data-testid="wallet-card-usdt"]', { timeout: 10000 });
  console.log('Navigated to wallet page');

  // Click withdraw on USDT wallet card
  const withdrawButton = await usdtCard2.waitForSelector('button:has-text("Withdraw")', { timeout: 10000 });
  await withdrawButton.click();
  console.log('Clicked withdraw button on USDT card');

  // Wait for withdraw modal and enter amount
  await page.waitForSelector('input[type="number"]', { timeout: 10000 });
  await page.waitForSelector('text=Amount (USDT)', { timeout: 10000 });
  await page.waitForTimeout(1000); // Wait for rate to load
  await page.fill('input[type="number"]', '0.10');
  console.log('Entered amount: 0.10 USDT');

  // Enter external wallet address
  await page.waitForSelector('text=External Wallet Address', { timeout: 10000 });
  await page.fill('input[type="text"]', walletAddress);
  console.log('Entered wallet address:', walletAddress);

  // Click proceed to withdraw
  await page.click('button:has-text("Proceed to Withdraw")');
  console.log('Clicked proceed to withdraw');

  // Wait for confirmation dialog and confirm
  await page.waitForSelector('text=Please review your withdrawal details', { timeout: 10000 });
  await page.click('button:has-text("Confirm Withdrawal")');
  console.log('Confirmed withdrawal');

  // Wait for success message
  await page.waitForSelector('text=Withdrawal initiated successfully', { timeout: 10000 });
  console.log('Withdrawal completed successfully');
}); 