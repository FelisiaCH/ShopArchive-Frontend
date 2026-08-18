import { expect, test } from '@playwright/test';

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]']);

test('loads without asking anything off the machine', async ({ page }) => {
  // The shop's machine has no internet access. A stylesheet or a font pointing at a CDN would
  // work on a developer's laptop and fail silently in the shop, so the check is on every request
  // the page makes rather than on what the source appears to reference.
  const offMachine: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol === 'data:' || url.protocol === 'blob:') return;
    if (!LOCAL_HOSTS.has(url.hostname)) offMachine.push(request.url());
  });

  await page.goto('/');
  // "Today" is the default route's own heading — the shell replaced the scaffold's placeholder
  // route in F2, so the page's identity is now its title bar ("ShopArchive", index.html) plus a
  // real screen heading rather than a top-level "ShopArchive" <h1>.
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  expect(offMachine).toEqual([]);
});

test('renders text in the vendored fonts', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready.then(() => undefined));

  const loaded = await page.evaluate(() =>
    [...document.fonts].filter((face) => face.status === 'loaded').map((face) => face.family),
  );

  expect(new Set(loaded)).toEqual(
    new Set(['Geist', 'Google Sans', 'Google Sans Code', 'Material Symbols Rounded']),
  );
});
