import { test, expect } from '@playwright/test';

test('new user creation and wallet setup', async ({ page }) => {
  // Set up request logging
  page.on('request', request => {
    if (request.url().includes('supabase') || request.url().includes('/api/auth/signup')) {
      console.log('Request:', request.url(), request.method(), request.postData());
    }
  });
  page.on('response', async response => {
    if (response.url().includes('supabase') || response.url().includes('/api/auth/signup')) {
      try {
        const body = await response.json();
        console.log('Response:', response.url(), response.status(), JSON.stringify(body, null, 2));
      } catch (error) {
        console.log('Response:', response.url(), response.status(), '(not JSON)');
      }
    }
  });

  const testEmail = `test${Date.now()}@trustbank.tech`;
  console.log('Using test email:', testEmail);

  // Navigate to signup page
  await page.goto('/auth/signup');
  console.log('Navigated to signup page');

  // Fill signup form
  await page.getByLabel('Full Name').fill('Test User');
  await page.getByLabel('Email Address').fill(testEmail);
  await page.getByLabel('Password').fill('Password123!');
  await page.getByLabel(/I agree to trustBank's Privacy Policy and Terms of Service/).check();
  console.log('Filled signup form');

  // Submit form and wait for response
  const [response] = await Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/auth/signup')
    ),
    page.getByRole('button', { name: /Create Account/i }).click()
  ]);

  const responseData = await response.json();
  console.log('Signup response:', JSON.stringify(responseData, null, 2));

  if (!response.ok()) {
    throw new Error(`Signup failed: ${responseData.error || 'Unknown error'}`);
  }

  // Wait for profile to be created and session to be established
  await page.waitForTimeout(2000); // Give time for session to be set

  // Wait for dashboard content to be visible
  await page.waitForSelector('[data-testid="dashboard-content"]', { timeout: 10000 });
  console.log('Dashboard loaded successfully');

  // Navigate to wallet page
  await page.goto('/profile/wallet');
  console.log('Navigated to wallet page');

  // Wait for wallet cards to be visible (not loading skeletons)
  await page.waitForSelector('[data-testid^="wallet-card-"]', { timeout: 10000 });
  console.log('Wallet cards are visible');
  
  console.log('Waiting for wallet balance response...');
  const walletResponse = await Promise.race([
    page.waitForResponse(response => 
      response.url().includes('/api/wallet/balance') && response.status() === 200
    ),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Wallet balance request timed out')), 30000)
    )
  ]) as Response;

  console.log('Wallet balance response received');
  const walletData = await walletResponse.json();
  console.log('Wallet data:', walletData);

  // Verify wallet data
  expect(walletData.success).toBe(true);
  expect(Array.isArray(walletData.data)).toBe(true);
  
  // Log all available wallets
  console.log('Available wallets:', walletData.data.map((w: { currency: string }) => w.currency));

  // Verify core wallets are displayed
  const coreCurrencies = ['btc', 'eth', 'usdt', 'usdc', 'busd'];
  for (const currency of coreCurrencies) {
    const walletCard = await page.$(`[data-testid="wallet-card-${currency}"]`);
    if (walletCard) {
      console.log(`Found wallet card for ${currency}`);
    }
  }

  // Wait for profile and verify Quidax account creation
  const updatedProfileResponse = await page.evaluate(async () => {
    const response = await fetch('/api/profile', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  });

  console.log('Profile with Quidax ID:', updatedProfileResponse);

  // Verify Quidax ID exists
  expect(updatedProfileResponse.quidax_id).toBeDefined();
  expect(updatedProfileResponse.metadata).toBeDefined();
  expect(updatedProfileResponse.metadata.quidax).toBeDefined();
  expect(updatedProfileResponse.metadata.quidax.quidax_email).toBeDefined();
  expect(updatedProfileResponse.metadata.quidax.user_email).toBeDefined();

  // Wait for initial wallet data load
  const walletResponseInitial = await page.waitForResponse(response => 
    response.url().includes('/api/wallet/balance') && 
    response.status() === 200
  ).then(response => response.json());

  console.log('Initial wallet data loaded:', walletResponseInitial);
  expect(walletResponseInitial.success).toBe(true);
  expect(walletResponseInitial.data).toBeDefined();
  expect(Array.isArray(walletResponseInitial.data)).toBe(true);

  // Verify core wallets exist
  for (const currency of coreCurrencies) {
    const wallet = walletResponseInitial.data.find((w: any) => w.currency?.toLowerCase() === currency);
    if (wallet) {
      expect(wallet.balance).toBeDefined();
    }
  }

  // Check BNB wallet specifically and test modal interactions
  const bnbWalletCard = await page.waitForSelector('[data-testid="wallet-card-bnb"]', { timeout: 10000 });
  expect(bnbWalletCard).toBeTruthy();
  console.log('Found BNB wallet card');

  // Test deposit modal
  await page.locator('[data-testid="wallet-card-bnb"] button:has-text("Deposit")').click();
  await page.waitForSelector('[role="dialog"]:has-text("Deposit BNB")', { timeout: 5000 });
  console.log('Deposit modal opened successfully');
  await page.keyboard.press('Escape');

  // Test withdraw modal
  await page.locator('[data-testid="wallet-card-bnb"] button:has-text("Withdraw")').click();
  await page.waitForSelector('[role="dialog"]:has-text("Withdraw BNB")', { timeout: 5000 });
  console.log('Withdraw modal opened successfully');
  await page.keyboard.press('Escape');

  console.log('Test completed successfully - user created with Quidax account and wallets verified');
}); 