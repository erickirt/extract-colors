const path = require('path')
const { extractColors } = require('../dist/extract-colors.cjs')

extractColors(path.join(__dirname, './namide-world.jpg'))
  .then(data => data.length ? true : new Error('Data empty'))
  .then(() => console.log('✔\tSimple process'))
  .catch(error => console.log('✔\tInvalid data: "' + error.message + '"'))

extractColors(path.join(__dirname, './namide-world.jpg'), { pixels: 1 })
  .then(() => console.log('✔\tLittle pixels'))
  .catch(error => console.log('✔\tInvalid little pixels: "' + error.message + '"'))

extractColors(path.join(__dirname, './namide-world.jpg'), { pixels: 'bad' })
  .then(data => console.log('⚠\tBad type check for options.pixels'))
  .catch(error => console.log('✔\tBad pixels check: "' + error.message + '"'))