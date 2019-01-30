// import * as tf from '@tensorflow/tfjs'
// import * as posenet from '@tensorflow-models/posenet'


const w = 480 // img width & height
const h = w * 9 / 16
const url = 'http://localhost:3000/'

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed



function predict(keypoints) {

  return
}

;(async function () {

  const net = await posenet.load()

  console.log('Ready')

  const poses = await net.estimateSinglePose(document.getElementById('img'), imageScaleFactor, flipHorizontal, outputStride)
  window.poses = poses

  const model = await tf.loadModel('http://localhost:3000/trained_models/model_cnn_2/model.json')

  // console.log(model)

  const h = 135
  const w = 240
  // let img = new Array(h).fill(0).map(() => new Array(w).fill(0).map(() => [0]))
  let img = []
  for (let i = -1; ++i < h;) {
    img[i] = []
    for (let j = -1; ++j < w;) img[i][j] = [0]
  }
  poses.keypoints.forEach(p => {
    let { x, y } = p.position
    x = Math.min(Math.round(x / 2), w - 1)
    y = Math.min(Math.round(y / 2), h - 1)
    img[y][x] = [1]
  })

  img = tf.tensor3d(img)

  const result = model.predict(img.expandDims(0))
  console.log(result.dataSync())

}())

