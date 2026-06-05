/**
 * La API de Rick and Morty referencia recursos como URLs (ej:
 * "https://rickandmortyapi.com/api/character/42"). Esta utilidad extrae los
 * IDs numericos del final de cada URL, descartando los invalidos.
 */
export function idsFromUrls(urls: readonly string[] | undefined | null): number[] {
  return (urls ?? [])
    .map((url) => Number(url.split('/').pop()))
    .filter((id) => !Number.isNaN(id));
}
