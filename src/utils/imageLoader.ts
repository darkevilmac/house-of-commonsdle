// Image cache - stores promises for each URL so we can await them
const imageCache = new Map<string, Promise<void>>()

/**
 * Preload an image and return a promise that resolves when loaded.
 * Uses a cache to avoid duplicate loads and enable awaiting.
 */
export function preloadImage(url: string): Promise<void> {
  // Return existing promise if already loading/loaded
  if (imageCache.has(url)) {
    return imageCache.get(url)!
  }

  const promise = new Promise<void>((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve() // Resolve even on error to not block the game
    img.src = url
  })

  imageCache.set(url, promise)
  return promise
}
