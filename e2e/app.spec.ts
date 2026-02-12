import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
    test('should load dashboard page', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.dashboard-container')).toBeVisible();
        await expect(page.locator('.dashboard-logo')).toContainText('CanvasPro');
    });

    test('should show category tabs', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.tabs')).toBeVisible();
        await expect(page.locator('.tab').first()).toContainText('All');
    });

    test('should have Create Blank button', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('.btn-create')).toBeVisible();
        await expect(page.locator('.btn-create')).toContainText('Create Blank');
    });
});

test.describe('Navigation', () => {
    test('should navigate from Dashboard to Editor via Create Blank', async ({ page }) => {
        await page.goto('/');
        await page.locator('.btn-create').click();
        // HashRouter: URL becomes /#/editor
        await page.waitForURL('**/#/editor');
        // Editor should render the navbar
        await expect(page.locator('.navbar')).toBeVisible({ timeout: 10000 });
    });

    test('should navigate back to Dashboard from Editor', async ({ page }) => {
        await page.goto('/#/editor');
        await page.waitForSelector('.navbar', { timeout: 10000 });
        // Click the logo/back link
        await page.locator('.nav-brand').click();
        await page.waitForURL('**/#/');
        await expect(page.locator('.dashboard-container')).toBeVisible({ timeout: 10000 });
    });
});

test.describe('Editor', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/#/editor');
        await page.waitForSelector('.navbar', { timeout: 10000 });
    });

    test('should render canvas', async ({ page }) => {
        await expect(page.locator('#canvas-wrapper')).toBeVisible();
        await expect(page.locator('canvas#c')).toBeVisible();
    });

    test('should render left sidebar with Elements tab', async ({ page }) => {
        await expect(page.locator('.sidebar')).toBeVisible();
        await expect(page.locator('.panel-tab-btn').first()).toContainText('Elements');
    });

    test('should render right sidebar with Properties and Layers', async ({ page }) => {
        await expect(page.locator('.sidebar-right')).toBeVisible();
        await expect(page.locator('.sidebar-right .section-title').first()).toContainText('Properties');
    });

    test('should switch between Elements and Templates tabs', async ({ page }) => {
        const tabs = page.locator('.panel-tab-btn');
        await tabs.nth(1).click(); // Templates
        await expect(tabs.nth(1)).toHaveClass(/active/);
        await tabs.nth(0).click(); // Elements
        await expect(tabs.nth(0)).toHaveClass(/active/);
    });

    test('should have zoom controls in navbar', async ({ page }) => {
        await expect(page.locator('.navbar')).toBeVisible();
        // Zoom controls should exist
        await expect(page.locator('[title="Zoom In"]')).toBeVisible();
        await expect(page.locator('[title="Zoom Out"]')).toBeVisible();
    });
});
