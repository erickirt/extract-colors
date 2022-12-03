import Color from "./color/Color"
import { createFinalColor } from "./color/FinalColor"
import Extractor from "./extract/Extractor"
import sortColors from "./sort/sortColors"
import { FinalColor } from "./types/Color"
import type { BrowserOptions, NodeOptions, SorterOptions } from "./types/Options"

/**
 * Extract ImageData from image.
 * Reduce image to a pixel count.
 */
const getImageData = (image: HTMLImageElement, pixels: number) => {
  const currentPixels = image.width * image.height
  const width = currentPixels < pixels ? image.width : Math.round(image.width * Math.sqrt(pixels / currentPixels))
  const height = currentPixels < pixels ? image.height : Math.round(image.height * Math.sqrt(pixels / currentPixels))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height)

  return context.getImageData(0, 0, width, height)
}

const sortFinalColors = (colors: Color[], pixels: number, options?: SorterOptions) => {
  const list = sortColors(colors, pixels, options)
  return list.map(color => createFinalColor(color, pixels))
}

/**
 * Extract colors from an ImageData object.
 */
const extractColorsFromImageData = (imageData: ImageData | { data: Uint8ClampedArray | number[], width?: number, height?: number }, options?: NodeOptions) => {
  const extractor = new Extractor(options)
  const colors = extractor.process(imageData)
  return sortFinalColors(colors, extractor.pixels, options)
}

/**
 * Extract colors from an HTMLImageElement.
 */
const extractColorsFromImage = (image: HTMLImageElement, options?: BrowserOptions) => {
  image.crossOrigin = options?.crossOrigin || null
  return new Promise((resolve: (value: FinalColor[]) => void) => {
    const extract = (image: HTMLImageElement, options?: BrowserOptions) => {
      const extractor = new Extractor(options)
      const imageData = getImageData(image, extractor.pixels)
      const colors = extractor.process(imageData)
      resolve(sortFinalColors(colors, extractor.pixels, options))
    }

    if (image.complete) {
      extract(image, options)
    } else {
      const imageLoaded = () => {
        image.removeEventListener('load', imageLoaded)
        extract(image, options)
      }
      image.addEventListener('load', imageLoaded)
    }
  })
}

/**
 * Extract colors from a path.
 * The image will be downloaded.
 */
const extractColorsFromSrc = (src: string, options?: BrowserOptions) => {
  const image = new Image()
  image.src = src
  return extractColorsFromImage(image, options)
}

/**
 * Extract colors from a picture.
 */
const extractColors = (picture: string | HTMLImageElement | ImageData | { data: Uint8ClampedArray | number[], width?: number, height?: number }, options?: BrowserOptions) => {

  if (picture instanceof Image) {
    return extractColorsFromImage(picture, options)
  }

  if (picture instanceof ImageData || (picture instanceof Object && picture.data)) {
    return new Promise((resolve: (value: FinalColor[]) => void) => {
      resolve(extractColorsFromImageData(picture, options))
    })
  }

  if (typeof picture === "string") {
    return extractColorsFromSrc(picture, options)
  }

  throw new Error(`Can not analyse picture`)
}

export {
  extractColorsFromImageData,
  extractColorsFromImage,
  extractColorsFromSrc,
  extractColors
}

export default extractColors
