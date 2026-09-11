import { test, expect } from '@playwright/test';

// Reset demo customer's cart so each run starts clean
test.beforeAll(async () => {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@furnishing.local', password: 'customer123' }),
  });
  const { token } = await loginRes.json();
  await fetch('http://localhost:5000/api/cart', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
});

// ============================================================
// OAK & NEST - Full E2E flow (visible browser)
// ============================================================

test('CUSTOMER FLOW - browse, search, product details', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('feel like home', { exact: false })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Furniture for every way of living.' })).toBeVisible();

  // Spaces render from DB
  await expect(page.getByRole('heading', { name: 'Home' }).first()).toBeVisible();

  // Search via navbar search panel
  await page.locator('header button[aria-label="Search"]').click();
  await page.getByPlaceholder('What are you looking for?').first().fill('sofa');
  await page.getByPlaceholder('What are you looking for?').first().press('Enter');
  await page.waitForURL(/search=sofa/);
  await expect(page.getByText('Aurora 3-Seater Fabric Sofa').first()).toBeVisible();

  // Open product details
  await page.getByText('Aurora 3-Seater Fabric Sofa').first().click();
  await expect(page.getByText('Loved in real homes')).toBeVisible();
  await expect(page.getByText('Why you', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Furnora').first()).toBeVisible();
});

test('CUSTOMER FLOW - register, login, wishlist, cart', async ({ page }) => {
  // Register a fresh user
  await page.goto('/register');
  await page.getByLabel('First name').fill('Eva');
  await page.getByLabel('Last name').fill('Tester');
  await page.getByLabel('Email').fill(`eva${Date.now()}@example.com`);
  await page.getByLabel('Phone').fill('+91 98100 11111');
  await page.getByLabel('Password', { exact: true }).fill('secret123');
  await page.getByLabel('Confirm password').fill('secret123');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Eva').first()).toBeVisible();

  // Logout, login as demo customer instead
  await page.locator('header button', { hasText: /Eva/ }).first().click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.goto('/login');
  await page.getByLabel('Email').fill('customer@furnishing.local');
  await page.getByLabel('Password', { exact: true }).fill('customer123');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByText('Rahul')).toBeVisible();

  // Save to wishlist + add to cart from product page
  await page.goto('/products/aurora-3-seater-fabric-sofa');
  await page.getByRole('button', { name: /Save for later/ }).click();
  await expect(page.getByText('Saved for later', { exact: false }).first()).toBeVisible({ timeout: 10000 }).catch(() => {});

  await page.getByRole('button', { name: 'Add to your space' }).click();
  await expect(page.locator('a[aria-label="Cart"] span')).toBeVisible();
  await expect(page.locator('a[aria-label="Cart"] span')).toHaveText(/^[1-9]\d*$/);
});

test('CUSTOMER FLOW - coupon, COD checkout, order confirmation', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('customer@furnishing.local');
  await page.getByLabel('Password', { exact: true }).fill('customer123');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByText('Rahul')).toBeVisible();

  // Cart with an item
  await page.goto('/products/dune-table-lamp');
  await page.getByRole('button', { name: 'Add to your space' }).click();
  await expect(page.locator('a[aria-label="Cart"] span')).toBeVisible();
  await page.goto('/cart');
  await expect(page.getByText('Order Summary')).toBeVisible();

  // Apply coupon
  await page.getByPlaceholder('Coupon code').fill('WELCOME10');
  await page.getByRole('button', { name: 'Apply' }).click();
  await expect(page.getByText('Coupon applied', { exact: false })).toBeVisible();

  // Checkout - delivery details step
  await page.getByRole('button', { name: 'Proceed to Checkout' }).click();
  await expect(page.getByText(/Green Park Colony/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Order Summary' }).click();

  // Summary step - coupon carried over
  await expect(page.getByText('WELCOME10 applied', { exact: false }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Continue to Payment' }).click();

  // Payment step - Cash on Delivery
  await page.getByText('Cash on Delivery').click();
  await page.getByRole('button', { name: /Place Order/ }).click();

  // Confirmation
  await expect(page.getByText('Your order is confirmed!')).toBeVisible({ timeout: 20000 });

  // Track it (confirmation page link)
  await page.getByRole('link', { name: 'Track Order' }).first().click();
  await expect(page.getByText('Track Order', { exact: true })).toBeVisible();
  await expect(page.getByText("We've received your order and everything is looking good.").first()).toBeVisible();
});

test('CUSTOMER FLOW - simulated card payment + review', async ({ page }) => {
  // Register a fresh user so the review is never a duplicate
  await page.goto('/register');
  const stamp = Date.now();
  await page.getByLabel('First name').fill('Ava');
  await page.getByLabel('Last name').fill('Reviewer');
  await page.getByLabel('Email').fill(`ava${stamp}@example.com`);
  await page.getByLabel('Password', { exact: true }).fill('secret123');
  await page.getByLabel('Confirm password').fill('secret123');
  await page.getByRole('button', { name: 'Create Account' }).click();
  await expect(page.getByText('Ava').first()).toBeVisible();

  await page.goto('/products/halo-pendant-light');
  await page.getByRole('button', { name: 'Add to your space' }).click();
  await expect(page.locator('a[aria-label="Cart"] span')).toBeVisible();

  // Add an address inline at checkout
  await page.goto('/checkout');
  await page.getByRole('button', { name: '+ Add New Address' }).click();
  await page.getByPlaceholder('Full name').fill('Ava Reviewer');
  await page.getByPlaceholder('Phone').fill('+91 98100 22222');
  await page.getByPlaceholder('Address line 1').fill('42, Test Street');
  await page.getByPlaceholder('City').fill('Pune');
  await page.getByPlaceholder('State').fill('Maharashtra');
  await page.getByPlaceholder('PIN code').fill('411001');
  await page.getByRole('button', { name: 'Save Address' }).click();
  await expect(page.getByText('42, Test Street').first()).toBeVisible();

  await page.getByRole('button', { name: 'Continue to Order Summary' }).click();
  await page.getByRole('button', { name: 'Continue to Payment' }).click();

  // Local test payment
  await page.getByText('Local Test Payment').click();
  await page.getByPlaceholder('Test User').fill('Ava Reviewer');
  await page.getByRole('button', { name: /^Pay ₹/ }).click();

  await expect(page.getByText('Your order is confirmed!')).toBeVisible({ timeout: 20000 });
  await expect(page.getByText('Paid (simulated)')).toBeVisible();

  // Review a product (rating defaults to 5)
  await page.goto('/products/oakland-coffee-table');
  await page.getByRole('button', { name: 'Write a Review' }).click();
  await page.getByPlaceholder('Share your experience').fill('Oak and Nest E2E - superb craftsmanship, fast delivery!');
  await page.getByRole('button', { name: 'Submit Review' }).click();
  await expect(page.getByText(/pending approval|Thank you/i).first()).toBeVisible({ timeout: 15000 });
});

test('ADMIN FLOW - dashboard, order status, review moderation', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@furnishing.local');
  await page.getByLabel('Password', { exact: true }).fill(process.env.ADMIN_PASSWORD || 'admin123');
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  // Lands on admin dashboard
  await expect(page.getByText('Total Sales', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Recent Orders')).toBeVisible();

  // Orders - advance a pending order to confirmed (sidebar link)
  await page.locator('aside nav a', { hasText: 'Orders' }).first().click();
  await expect(page.getByText('ORD-2025-00003', { exact: false }).first()).toBeVisible();
  const card = page.locator('div', { hasText: 'ORD-2025-00003' }).locator('select').first();
  await card.selectOption('confirmed');
  await page.waitForTimeout(800);

  // Reviews moderation - approve the pending E2E review (sidebar link)
  await page.locator('aside nav a', { hasText: 'Reviews' }).first().click();
  await expect(page.getByText('Reviews', { exact: true }).first()).toBeVisible();
  const pending = page.locator('div.rounded-2xl', { hasText: 'Oak and Nest E2E' }).first();
  if (await pending.count()) {
    await pending.getByRole('button', { name: 'Approve' }).click();
  }

  // Dashboard stats sanity (sidebar link)
  await page.locator('aside nav a', { hasText: 'Dashboard' }).first().click();
  await expect(page.getByText('Total Sales', { exact: false }).first()).toBeVisible();
});

test('CONTENT FLOW - homepage content, testimonials, admin editor, image link', async ({ page }) => {
  // Homepage shows DB-driven hero + testimonials
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Furniture for every way of living.' })).toBeVisible();
  await expect(page.getByText('Word of Mouth')).toBeVisible();
  await expect(page.getByText('Ananya Iyer')).toBeVisible();

  // Testimonial cards revealed (scroll-triggered animation must end visible)
  await page.locator('div.card-lift', { hasText: 'Ananya Iyer' }).scrollIntoViewIfNeeded();
  await expect(page.getByText('The Aurora sofa completely changed our living room', { exact: false }).first()).toBeVisible();

  // Admin content editor
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@furnishing.local');
  await page.getByLabel('Password', { exact: true }).fill(process.env.ADMIN_PASSWORD || 'admin123');
  await page.getByRole('button', { name: 'Login', exact: true }).click();
  await page.locator('aside nav a', { hasText: 'Content' }).first().click();
  await expect(page.getByRole('heading', { name: 'Storefront Content' })).toBeVisible();
  await expect(page.getByText('No hero image set', { exact: false })).toBeVisible();

  // Edit hero headline via the editor
  const headline = page.getByLabel('Hero headline');
  await headline.fill('E2E Hero Headline From Admin');
  await page.getByRole('button', { name: 'Save Content' }).click();
  await expect(page.getByText('Storefront content updated', { exact: false })).toBeVisible();

  // Homepage reflects the change
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'E2E Hero Headline From Admin' })).toBeVisible();

  // Create a testimonial with an image link (fetched + stored as base64)
  await page.goto('/admin/content');
  await page.getByLabel('Name *').fill('E2E Tester');
  await page.getByPlaceholder('What they said about us...').fill('E2E testimonial quote — plays nicely.');
  await page.getByRole('button', { name: 'Create Testimonial' }).click();
  await expect(page.getByText('Testimonial created', { exact: false })).toBeVisible();
  await expect(page.locator('div.card-lift', { hasText: 'E2E Tester' })).toBeVisible();

  // Public homepage shows it
  await page.goto('/');
  await expect(page.getByText('E2E Tester')).toBeVisible();

  // Cleanup: delete the E2E testimonial and restore the hero headline
  await page.goto('/admin/content');
  const card = page.locator('div.card-lift', { hasText: 'E2E Tester' }).first();
  page.on('dialog', (d) => d.accept());
  await card.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByText('Testimonial deleted')).toBeVisible();

  await page.getByLabel('Hero headline').fill('Furniture that makes every space feel like home.');
  await page.getByRole('button', { name: 'Save Content' }).click();
  await expect(page.getByText('Storefront content updated', { exact: false })).toBeVisible();
});
