/**
 * Validates if a name contains only allowed characters:
 * - Latin letters (including diacritics like á, ü, ğ, ő, č, ž, ñ)
 * - Cyrillic letters
 * - Hyphens (-)
 * - Apostrophes (')
 * - Spaces
 */
export const nameRegex = /^[\p{Script=Latin}\p{Script=Cyrillic}\s'\-]+$/u

export const isValidName = (name: string | undefined | null): boolean => {
  if (!name) return false

  const trimmedName = name.trim()
  if (trimmedName.length === 0 || trimmedName.length > 50) return false

  return nameRegex.test(trimmedName)
}
