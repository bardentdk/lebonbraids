import puppeteer, { type Browser } from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

/**
 * Retourne une instance Puppeteer compatible dev / Laravel Forge / serverless.
 */
export async function getBrowser(): Promise<Browser> {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && process.env.PUPPETEER_EXECUTABLE_PATH) {
    // Laravel Forge : utilise chromium système installé via apt
    return puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      headless: true,
    });
  }

  if (isProduction) {
    // Fallback serverless (Vercel etc.)
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Dev local
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}