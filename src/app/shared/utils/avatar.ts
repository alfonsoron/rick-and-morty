/**
 * Genera una URL de avatar por defecto (placeholder) de forma deterministica
 * a partir de una semilla (id o nombre del usuario). Asi cada usuario sin foto
 * obtiene una imagen "random" pero estable entre recargas.
 */
export function defaultAvatarUrl(seed: string | number | null | undefined): string {
  const safeSeed = encodeURIComponent(String(seed ?? 'rick-and-morty'));
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${safeSeed}`;
}
