// How hard to compress, per photo slot.
//
// The old single setting was 720px at q0.6 for everything, which quietly capped
// how good the analysis could ever be: pores, blackheads, fine stretch marks,
// split ends and a scalp at the parting are simply not present in a 720px JPEG
// at q0.6, so the scan would answer "texture: good" when the honest answer was
// that it could not see the texture at all.
//
// Body shots are an outline read and genuinely do not need the detail. Face and
// hair do. The cost of the split is real but small: roughly 250 KB per detail
// photo against 90 KB before, so a full set of 12 goes from ~1 MB to ~2.4 MB.
// On the 1 GB free bucket that is still room for around 400 users.
export const COMPRESS = {
  detail: { maxSide: 1280, quality: 0.72 },
  shape: { maxSide: 900, quality: 0.65 },
  // Decoration, not data. These are never analysed, so they are sized for how
  // they look rather than for what a model could read out of them.
  cover: { maxSide: 1200, quality: 0.7 },   // the Dashboard hero, full width
  avatar: { maxSide: 400, quality: 0.75 },  // shown at ~56px, so this is plenty
}

const DETAIL_SLOT = /^(face|hair)_/

export const compressFor = (slot) => (DETAIL_SLOT.test(String(slot)) ? COMPRESS.detail : COMPRESS.shape)

// Compress a photo on-device before saving/uploading.
export function compressImage(file, maxSide = 720, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      } catch (e) {
        reject(e)
      } finally {
        URL.revokeObjectURL(url)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image.'))
    }
    img.src = url
  })
}
