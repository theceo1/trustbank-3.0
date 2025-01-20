import { test, expect } from '@playwright/test';

test.describe('Wallet Functionality', () => {
  test('wallet setup and verification', async ({ page }) => {
    // 1. Sign up a new user
    await page.goto('/auth/signup');
    const testEmail = `test${Date.now()}@trustbank.tech`;
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button[role="checkbox"][id="terms"]');
    await page.click('button[type="submit"]');

    // Wait for signup to complete
    await page.waitForURL('/dashboard');

    // 2. Navigate to wallet page
    await page.goto('/profile/wallet');

    // 3. Wait for profile to be created with Quidax ID
    const profileResponse = await page.waitForResponse(response => 
      response.url().includes('/api/profile') && 
      response.status() === 200
    );

    const profileData = await profileResponse.json();
    expect(profileData.quidax_id).toBeDefined();

    // 4. Wait for wallet setup
    const setupResponse = await page.waitForResponse(response => 
      response.url().includes('/api/wallet/setup') && 
      response.status() === 200
    );

    const setupData = await setupResponse.json();
    expect(setupData.success).toBe(true);

    // 5. Verify wallet balance
    const balanceResponse = await page.waitForResponse(response => 
      response.url().includes('/api/wallet/balance') && 
      response.status() === 200
    );

    const balanceData = await balanceResponse.json();
    expect(balanceData.error).toBeUndefined();
  });
}); 