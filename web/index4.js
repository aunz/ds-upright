// import '@tensorflow/tfjs'
// import * as posenet from '@tensorflow-models/posenet'


const w = 480 // img width & height
const h = w * 9 / 16
const url = 'http://localhost:3000/'

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed


function detectPose(net, imageSrc) {  
  return net.estimateSinglePose(imageSrc, imageScaleFactor, flipHorizontal, outputStride)
}

function processFile(net, url) {
  const img = new Image()
  img.crossOrigin = 'anonymous'

  img.onload = () => {
    detectPose(net, img).then(pose => {
      pose.name = url
      pose.keypoints.forEach(part => {
        part.position.x = Math.round(part.position.x)
        part.position.y = Math.round(part.position.y)
      })

      const r = predict(pose.keypoints)
      console.log(r)

      console.log(pose.keypoints.map(e => e.position.x), pose.keypoints.map(e => e.position.y))
    })
  }
  
  img.src = url
  

}

function predict(keypoints) {
  // intercept and coef trained from python
  const intercept = 17.24016087
  const coef = [-11.59297432, -10.48313072, -11.24994747, -11.06962914, -8.26816833, -6.85886515, -4.83989711, -0.72550568, -2.80627788, -1.84612645, -4.40763068, 9.69464209, 4.04290725, 6.51791598, 5.20727441, 1.36463445, 2.36079032, 8.79429058, 7.34754462, 7.04710324, 6.00282833, 4.35750347, 3.0650297, 3.49635641, 2.20437731, 1.81695029, 1.90782238, 2.83214111, 0.07692417, -0.96839343, -3.14235201, -3.8216309, -0.91195957, -1.31549044]

  let r = intercept
  for (let i = 0; i < keypoints.length; i++) {
    const { x, y } = keypoints[i].position
    r += x * coef[i] / w + y * coef[i + 17] / w // because there are 17 points
  }

  r = 1 / (1 + Math.exp(-r))
  return r
}

;(async function () {

  const net = await posenet.load()

  console.log('Ready')

  document.getElementById('submit').addEventListener('click', () => {
    const input = document.getElementById('input').value.trim()
    const file_path = url + (input.includes('a') ? 'a' : 'b') + '/' + input + '.jpg'
    processFile(net, file_path)


  })





}())

