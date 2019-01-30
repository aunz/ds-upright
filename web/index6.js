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

async function predict(model, keypoints) {
  const h = 135 // h & width of images
  const w = 240

  // const img = new Array(h).fill(0).map(() => new Array(w).fill(0).map(() => [0]))
  const img = [] // img pixels based on keypoints
  for (let i = -1; ++i < h;) {
    img[i] = []
    for (let j = -1; ++j < w;) img[i][j] = [0]
  }
  
  keypoints.forEach(p => {
    let { x, y } = p.position
    x = Math.min(Math.round(x / 2), w - 1)
    y = Math.min(Math.round(y / 2), h - 1)
    img[y][x] = [1]
  })

  const ts = tf.tensor3d(img).expandDims(0) // turn img pixels into tf array and extend 1 more dim
  return model.predict(ts).data()

}

;(async function () {

  const net = await posenet.load()
  console.log('Net Ready')

  const model = await tf.loadModel('http://localhost:3000/trained_models/model_cnn_2/model.json')
  console.log('Model Ready')

  // console.time(0)
  const poses = await net.estimateSinglePose(document.getElementById('img'), imageScaleFactor, flipHorizontal, outputStride)
  // console.timeEnd(0)

  // console.time(1)
  const result = await predict(model, poses.keypoints)
  // console.timeEnd(1)
  console.log(result[0])

  // test for more images

}())

