import { test, expect } from '@playwright/test';
import { QuidaxClient } from '@/lib/quidax';

interface QuidaxResponse<T> {
  status: string;
  message: string;
  data: T;
}

interface QuidaxUser {
  id: string;
  sn: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

test.describe('Crypto Transfer Flow', () => {
  let receiverEmail: string;
  let receiverPassword: string;
  let receiverWalletAddress: string;
  const TRANSFER_AMOUNT = '0.1'; // Transfer 0.1 USDT
  const TEST_CURRENCY = 'usdt';
  const SENDER_EMAIL = 'test1735848851306@trustbank.tech';
  const SENDER_PASSWORD = 'trustbank123';

  test.beforeEach(async ({ page }) => {
    console.log('Setting up test environment...');
    
    // Create receiver account
    receiverEmail = `receiver${Date.now()}@test.com`;
    receiverPassword = 'Test123!@#';
    
    // Create receiver account through signup page
    console.log('Creating receiver account...');
    await page.goto('/auth/signup');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', receiverEmail);
    await page.fill('input[type="password"]', receiverPassword);
    await page.fill('input[name="full_name"]', 'Test Receiver');
    await page.click('button[type="submit"]');
    
    // Wait for signup to complete and redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 60000 });
    console.log('Receiver account created successfully');
  });

  test('should withdraw crypto to external wallet', async ({ page }) => {
    // Set longer timeout for the entire test
    test.setTimeout(300000); // 5 minutes

    // First sign in as receiver to get wallet address
    console.log('Signing in as receiver to get wallet address...');
    await page.goto('/auth/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', receiverEmail);
    await page.fill('input[type="password"]', receiverPassword);
    await page.click('button[type="submit"]');

    // Wait for navigation and go to wallet page
    await page.waitForURL('/dashboard');
    console.log('Navigating to wallet page...');
    await page.goto('/profile/wallet');
    await page.waitForLoadState('networkidle');
    
    // Wait for loading spinner to disappear
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 60000 });
    
    // Wait for USDT wallet card and get deposit address
    console.log('Getting receiver wallet address...');
    const usdtCard = page.locator('[data-testid="wallet-card-usdt"]');
    await expect(usdtCard).toBeVisible({ timeout: 60000 });
    await usdtCard.getByText('Deposit').click();
    
    // Get the wallet address
    const addressInput = page.getByLabel('Wallet Address');
    await expect(addressInput).toBeVisible();
    receiverWalletAddress = await addressInput.inputValue();
    console.log('Receiver wallet address:', receiverWalletAddress);
    
    // Close deposit modal
    await page.keyboard.press('Escape');

    // Sign out
    console.log('Signing out receiver...');
    await page.getByRole('button', { name: /profile/i }).click();
    await page.getByRole('menuitem', { name: /sign out/i }).click();
    await page.waitForURL('/auth/login');
    
    // Now sign in as sender
    console.log('Signing in as sender...');
    await page.fill('input[type="email"]', SENDER_EMAIL);
    await page.fill('input[type="password"]', SENDER_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation and go to wallet page
    await page.waitForURL('/dashboard');
    await page.goto('/profile/wallet');
    await page.waitForLoadState('networkidle');
    
    // Wait for loading spinner to disappear
    await page.waitForSelector('.animate-spin', { state: 'detached', timeout: 60000 });

    console.log('Looking for USDT wallet card...');
    const senderUsdtCard = page.locator('[data-testid="wallet-card-usdt"]');
    await expect(senderUsdtCard).toBeVisible({ timeout: 60000 });
    
    // Get initial balance
    const balanceText = await senderUsdtCard.getByTestId('wallet-balance').textContent();
    const initialBalance = parseFloat(balanceText?.replace(/[^0-9.]/g, '') || '0');
    console.log('Initial balance:', initialBalance);

    // Click withdraw button
    await senderUsdtCard.getByText('Withdraw').click();

    // Fill withdrawal form
    console.log('Filling withdrawal form...');
    const amountInput = page.getByPlaceholder('Enter amount');
    await expect(amountInput).toBeVisible();
    await amountInput.fill(TRANSFER_AMOUNT);

    const withdrawalAddressInput = page.getByPlaceholder('Enter wallet address');
    await expect(withdrawalAddressInput).toBeVisible();
    await withdrawalAddressInput.fill(receiverWalletAddress);

    // Submit withdrawal
    console.log('Submitting withdrawal...');
    await page.getByRole('button', { name: /withdraw/i }).click();

    // Wait for success message
    await expect(page.getByText(/withdrawal successful/i)).toBeVisible({ timeout: 60000 });
    console.log('Withdrawal completed successfully');
  });
});