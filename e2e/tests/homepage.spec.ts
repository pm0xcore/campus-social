import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('displays the app title and main elements', async ({ page }) => {
    await page.goto('/');

    // Check header has app title
    await expect(page.getByRole('banner').getByRole('heading', { name: 'Campus Social' })).toBeVisible();
    
    // Check discover banner
    await expect(page.getByText('Discover Classmates')).toBeVisible();
    await expect(page.getByText('Find and connect with people at your university')).toBeVisible();
    
    // Check feed card
    await expect(page.getByText('Campus Feed')).toBeVisible();
    await expect(page.getByRole('link', { name: /View Feed/i })).toBeVisible();
  });

  test('displays quick links section', async ({ page }) => {
    await page.goto('/');

    // Check quick links - use first() since there may be multiple (nav bar)
    await expect(page.getByRole('link', { name: /Groups/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Friends/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Messages/i }).first()).toBeVisible();
  });

  test('displays community stats section', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Community' })).toBeVisible();
  });

  test('displays login button when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Header should show login button (use exact match)
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
  });

  test('does not show SOS button when not authenticated', async ({ page }) => {
    await page.goto('/');

    // SOS button should not be visible
    await expect(page.getByRole('button', { name: 'SOS' })).not.toBeVisible();
  });

  test('discover banner links to discover page', async ({ page }) => {
    await page.goto('/');

    await page.getByText('Discover Classmates').click();
    await expect(page).toHaveURL('/discover');
  });
});
