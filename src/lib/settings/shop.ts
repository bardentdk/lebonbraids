import { getSetting } from './service';

export async function isShopEnabled(): Promise<boolean> {
  const value = await getSetting<boolean>('shop.enabled');
  return value ?? false; // Désactivé par défaut
}