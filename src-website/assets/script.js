import extractColors from '../../src/extractColorsBrowser'

const IMG_THEME = ['moon', 'water', 'sea', 'colors', 'sky']
const process = []

const getRandImg = (id) => {
  const index = Math.round(Math.random() * 20) + 5
  const seed = IMG_THEME[id % IMG_THEME.length]
  return `https://loremflickr.com/320/240/${seed}/?lock=${index}`
}

const getRandImgs = count => Array(count).fill().map((_, i) => getRandImg(i))

function Input () {
  return {
    pixels: 10000,
    distance: 0.2,
    saturationImportance: 0.2,
    splitPower: 10,
    srcs: getRandImgs(5),

    get list () {
      return this.srcs.map(src => ({
        src,
        id: src + this.pixels + this.distance + this.saturationImportance + this.splitPower
      }))
    },

    randomFiles () {
      this.srcs = getRandImgs(5)
    },

    uploadFile (event) {
      this.srcs = [...event.target.files].map(file => URL.createObjectURL(file))
    }
  }
}

function ImgBlock (props) {
  return {
    $template: '#img-block',
    colors: [],
    px: '-',
    time: '-',

    mounted () {
      const image = new Image()

      image.crossOrigin = 'anonymous'
      image.src = this.src
      image.onload = () => {
        this.px = Math.min(props.pixels, image.naturalWidth * image.naturalHeight)
      }

      const execProcess = () => {
        const initTime = Date.now()
        extractColors(this.src, {
          pixels: props.pixels,
          distance: props.distance,
          saturationImportance: props.saturationImportance,
          splitPower: props.splitPower,
          crossOrigin: 'anonymous'
        })
          .then(colors => {
            this.colors = colors.map(color => color.hex)
            this.time = (Date.now() - initTime)
          })
          .finally(() => {
            process.shift()
            if (process.length > 0) {
              process[0]()
            }
          })
      }

      process.push(execProcess)
      if (process.length < 2) {
        process[0]()
      }
    }
  }
}

window.PetiteVue.createApp({ ImgBlock, Input }).mount()
