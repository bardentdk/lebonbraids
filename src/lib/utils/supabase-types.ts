/**
 * Helper : transforme une relation Supabase qui peut être renvoyée
 * sous forme d'array (parfois) ou d'objet (parfois) en objet propre.
 *
 * Supabase retourne :
 * - { ...row, category: [...] } quand le typage générique est array
 * - { ...row, category: {...} } en réalité quand la FK est unique
 *
 * Ce helper normalise toujours en objet unique.
 */
export function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}