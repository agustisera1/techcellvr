/**
 * Generates a URL-safe slug from a product name.
 * Removes accents, lowercases, replaces spaces with dashes.
 *
 * Examples:
 *   generateSlug('iPhone 15 Case')   → 'iphone-15-case'
 *   generateSlug('Funda Silicona')   → 'funda-silicona'
 *   generateSlug('Auriculares BT 5.0') → 'auriculares-bt-50'
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics (accents)
    .replace(/[^a-z0-9\s-]/g, '')   // keep only alphanumeric, spaces, dashes
    .trim()
    .replace(/\s+/g, '-')           // spaces → dashes
    .replace(/-+/g, '-')            // collapse multiple dashes
}

/**
 * Appends a numeric suffix to make a slug unique when duplicates exist.
 *
 * Example: makeUniqueSlug('iphone-case', ['iphone-case', 'iphone-case-1'])
 *   → 'iphone-case-2'
 */
export function makeUniqueSlug(base: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(base)) return base

  let i = 1
  while (existingSlugs.includes(`${base}-${i}`)) {
    i++
  }
  return `${base}-${i}`
}
