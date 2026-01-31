async function canvasToFile(canvas: HTMLCanvasElement, opts: { type: string; quality?: number; name: string }) {
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error('Failed to encode image'))
        else resolve(b)
      },
      opts.type,
      opts.quality,
    )
  })

  return new File([blob], opts.name, { type: blob.type })
}

export async function prepareImageForUpload(file: File, params?: { maxSizePx?: number }): Promise<File> {
  const maxSizePx = params?.maxSizePx ?? 1600

  // Only process images; keep everything else as-is.
  if (!file.type.startsWith('image/')) return file

  // If it's already small, skip processing.
  // (This is a fast heuristic to avoid re-encoding.)
  if (file.size <= 900_000) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSizePx / Math.max(bitmap.width, bitmap.height))
  if (scale >= 1) return file

  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return file

  ctx.drawImage(bitmap, 0, 0, w, h)

  // Prefer webp for size; fallback to jpeg.
  try {
    return await canvasToFile(canvas, {
      type: 'image/webp',
      quality: 0.82,
      name: file.name.replace(/\.[^.]+$/, '') + '.webp',
    })
  } catch {
    return await canvasToFile(canvas, {
      type: 'image/jpeg',
      quality: 0.82,
      name: file.name.replace(/\.[^.]+$/, '') + '.jpg',
    })
  }
}
