import { test, expect } from '@playwright/test';

test.describe('ProtoSigner Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the application successfully', async ({ page }) => {
    // Wait for the splash screen to disappear and app to load
    await page.waitForSelector('[data-element-id]', { timeout: 10000 });
    
    // Check if main elements are present
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.locator('[class*="Header"]')).toBeVisible();
  });

  test('should display the canvas with elements', async ({ page }) => {
    // Wait for canvas to load
    await page.waitForSelector('[data-testid="canvas"]', { timeout: 10000 });
    
    // Check if canvas container exists
    const canvas = page.locator('[data-testid="canvas"]');
    await expect(canvas).toBeVisible();
  });

  test('should show zoom controls in footer', async ({ page }) => {
    // Wait for footer to be visible
    await page.waitForSelector('footer', { timeout: 5000 });
    
    // Check zoom controls
    const zoomControls = page.locator('footer').getByText(/%\s*/);
    await expect(zoomControls).toBeVisible();
  });

  test('should handle window resize responsively', async ({ page }) => {
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('footer')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('footer')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('footer')).toBeVisible();
  });
});
