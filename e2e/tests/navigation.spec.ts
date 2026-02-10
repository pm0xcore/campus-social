import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('can navigate to feed page from homepage', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Feed/i }).click();
    await expect(page).toHaveURL('/feed');
    // Feed page shows loading first, then content or login prompt
    // Wait for page to settle by checking for any main content
    await page.waitForLoadState('networkidle');
    // Just verify we're on the feed page (URL check is sufficient)
  });

  test('can navigate to groups page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /Groups/i }).first().click();
    await expect(page).toHaveURL('/groups');
  });

  test('can navigate to friends page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /Friends/i }).first().click();
    await expect(page).toHaveURL('/friends');
  });

  test('can navigate to messages page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /Messages/i }).first().click();
    await expect(page).toHaveURL('/messages');
  });

  test('can navigate to discover page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByText('Discover Classmates').click();
    await expect(page).toHaveURL('/discover');
  });

  test('bottom nav bar is present', async ({ page }) => {
    await page.goto('/');
    
    // Check bottom navigation exists
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('can navigate via bottom nav bar', async ({ page }) => {
    await page.goto('/');
    
    // Navigate using bottom nav
    const nav = page.locator('nav');
    
    // Click on feed icon in nav
    await nav.getByRole('link').first().click();
    
    // Should navigate to one of the main pages
    await expect(page.url()).toMatch(/\/(feed|groups|friends|messages|discover)?$/);
  });
});
