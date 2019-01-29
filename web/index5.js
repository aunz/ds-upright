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

const output = document.getElementById('output')

navigator.mediaDevices.getUserMedia({
  audio: false,
  video: {
    facingMode: 'user',
    width: w,
    height: h,
  },
}).then(async function (stream) {

  // set up video
  const video = document.getElementById('video')
  video.width = w
  video.height = h
  video.srcObject = stream
  video.onloadedmetadata = () => { video.play() } // set up canvas

  const canvas = document.getElementById('canvas')
  canvas.width = w
  canvas.height = h

  // context for the canvas
  const ctx = canvas.getContext('2d')

  // load the model
  posenet.load().then(net => {
    console.log('posenet loaded')
    
    detectPose(net, video, ctx)
  })

})

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

    const r = predict(poses.keypoints)
    output.textContent = r.toFixed(3)
    
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
  }
}

function predict(keypoints) {
  // intercept and coef trained from python
  const intercept = 3.007059017224048
  const coef = [0.32904886814967865, 1.2814287234396815, -0.09117472935583026, 0.3272185765034993, 0.8956722596551653, -2.5384046011587618, -0.11589101517245484, -0.2731650266838722, -0.35421760092147647, -0.1637309080311392, 0.1378462573606469, 1.0891292876321441, 0.358490368197577, 0.4536820811527689, -0.0017866367633638219, -0.3168463548687366, -0.23370030943375938, 24.393581738117813, 20.167105705341005, 19.191300875967737, 22.313117623044235, 8.38295185014727, -8.004481082150798, -6.7105437628576015, -8.68249393477084, -3.7261454652851365, 2.427107763819151, 9.117970043395967, -18.770471741809626, -17.279943850263106, -9.017455690687868, -11.434196447981673, 2.585849971647688, 1.2452259674024655]

  let r = intercept
  for (let i = 0; i < keypoints.length; i++) {
    const { x, y } = keypoints[i].position
    r += x * coef[i] / w + y * coef[i + 17] / w // because there are 17 points
  }

  r = 1 / (1 + Math.exp(-r))
  return r
}