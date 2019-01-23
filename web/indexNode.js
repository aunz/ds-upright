// import '@tensorflow/tfjs'
// import posenet from '@tensorflow-models/posenet'

const fs = require('fs')

global.XMLHttpRequest = require('xhr2') // a hack to use posenet in nodejs env


const sharp = require('sharp')
const tf = require('@tensorflow/tfjs')
require('@tensorflow/tfjs-node')
const posenet = require('@tensorflow-models/posenet')
// const posenet = require('./tmp/posenet.js')


// const pic = fs.readFileSync('../../data/2f451ae2666ab2ca29d9f6374f84354e.png')
pic = '../../data/2f451ae2666ab2ca29d9f6374f84354e.png'
posenet.load().then(async net => {
  // console.log(net)
  // net.estimateSinglePose(pic)
      let inputImg = sharp(pic, {failOnError: true})
    let imageFormat = await inputImg.metadata().then((m) => [m.width, m.height])
    let imageSize = Math.max(...imageFormat)

    // extend image so it's a square, so posenet is happy
    var sharpImage = inputImg.resize(imageSize, imageSize, {fit: 'contain', position: 'top'})

    // convert to pixel buffer and info, and make a 3D tensor out of it
    let imageTensor = await sharpImage.raw().toBuffer({resolveWithObject:true}).then((raw) =>
      tf.tensor3d(raw.data, [raw.info.width, raw.info.height, raw.info.channels]))

          let pose = await net.estimateSinglePose(imageTensor);

          console.log(pose)

})

// const pic = require('../../data/2f451ae2666ab2ca29d9f6374f84354e.png')
// console.log(pic)

