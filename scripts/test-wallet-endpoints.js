"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const dotenv = __importStar(require("dotenv"));
const debug = require('debug');
dotenv.config({ path: '.env.local' });
const log = debug('test:wallet');
(0, test_1.test)('test wallet endpoints', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3001/login');
    // Fill in login form
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test1736964390420@trustbank.tech');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'Test123!@#');
    // Click login button and wait for navigation
    await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]')
    ]);
    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard"]');
    // Test /api/wallet/balances endpoint
    const balancesResponse = await page.evaluate(async () => {
        const res = await fetch('/api/wallet/balances');
        return res.json();
    });
    log('Balances response:', balancesResponse);
    (0, test_1.expect)(balancesResponse).toBeDefined();
    (0, test_1.expect)(balancesResponse.error).toBeUndefined();
    // Test /api/wallet/balance endpoint
    const balanceResponse = await page.evaluate(async () => {
        const res = await fetch('/api/wallet/balance');
        return res.json();
    });
    log('Balance response:', balanceResponse);
    (0, test_1.expect)(balanceResponse).toBeDefined();
    (0, test_1.expect)(balanceResponse.error).toBeUndefined();
});
