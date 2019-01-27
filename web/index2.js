// import '@tensorflow/tfjs'
// import * as posenet from '@tensorflow-models/posenet'


const w = 480 // video width & height
const h = w * 9 / 16

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed

const minPoseConfidence = 0.1
const minPartConfidence = 0.5

const state = {
  color: '#2ECC40', // green 
  stopped: false,
}

const video = document.getElementById('video')
video.width = w
video.height = h
// video.srcObject = stream
// video.onloadedmetadata = () => { video.play() } // set up canvas
  

const canvas = document.getElementById('canvas')
canvas.width = w
canvas.height = h

// context for the canvas
const ctx = canvas.getContext('2d')

// load the model
posenet.load().then(async net => {
  console.log('posenet loaded')
  
  detectPose(net, video, ctx)
  video.play()

  const controller = document.getElementById('control')
  controller.textContent = 'STOP'
  controller.addEventListener('click', function (e) {
    const nextState = !state.stopped
    e.currentTarget.textContent = nextState ? 'START' : 'STOP'
    state.stopped = nextState
  })
})

// })

async function detectPose(net, imageSrc, ctx) {  
  if (!state.stopped) {
    const poses = await net.estimateSinglePose(imageSrc, imageScaleFactor, flipHorizontal, outputStride)
    ctx.clearRect(0, 0, w, h)
    ctx.save()
    ctx.scale(-1, 1)
    ctx.translate(-w, 0)
    ctx.drawImage(imageSrc, 0, 0, w, h)
    ctx.restore()

    drawKeypoints(poses.keypoints, minPartConfidence, ctx)
    predict(poses.keypoints)
    
  }

  requestAnimationFrame(() => { detectPose(net, imageSrc, ctx) })
}


function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i]

    if (keypoint.score < minConfidence) continue
    const { y, x } = keypoint.position

    ctx.beginPath()
    ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI)
    ctx.fillStyle = state.color
    ctx.fill()
    // ctx.fillText(keypoint.part, x * scale, y * scale)
  }
}

function predict(keypoints) {
  // intercept and coef trained from python
  const intercept = 17.24016087
  const coef = [-11.59297432, -10.48313072, -11.24994747, -11.06962914, -8.26816833, -6.85886515, -4.83989711, -0.72550568, -2.80627788, -1.84612645, -4.40763068, 9.69464209, 4.04290725, 6.51791598, 5.20727441, 1.36463445, 2.36079032, 8.79429058, 7.34754462, 7.04710324, 6.00282833, 4.35750347, 3.0650297, 3.49635641, 2.20437731, 1.81695029, 1.90782238, 2.83214111, 0.07692417, -0.96839343, -3.14235201, -3.8216309, -0.91195957, -1.31549044]

  let r = intercept
  for (let i = 0; i < keypoints.length; i++) {
    const { x, y } = keypoints[i].position
    r += x * coef[i] / 480 + y * coef[i + 17] / 480 // because there are 17 points
  }

  r = 1 / (1 + Math.exp(-r))
  return r
}