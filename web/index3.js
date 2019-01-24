// import '@tensorflow/tfjs'
// import * as posenet from '@tensorflow-models/posenet'


const w = 480 // img width & height
const h = w * 9 / 16

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed

const img = document.getElementById('img')
img.width = w
img.height = h
  
// load the model
posenet.load().then(async net => {
  console.log('posenet loaded')
  
  img.src = 'http://localhost:3000/a/a1 001.jpg'
  img.addEventListener('load', () => {
    detectPose(net, img)
    
  })
})

// })

async function detectPose(net, imageSrc) {  
  const poses = await net.estimateSinglePose(imageSrc, imageScaleFactor, flipHorizontal, outputStride)
  console.log(poses)
}
