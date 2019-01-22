// import '@tensorflow/tfjs'
// import * as posenet from '@tensorflow-models/posenet'



const w = 320
const h = w * 3 / 4
let stop = false

const minPoseConfidence = 0.1
const minPartConfidence = 0.5

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed

navigator.mediaDevices.getUserMedia({
  audio: false,
  video: {
    facingMode: 'user',
    width: w,
    height: h,
  },
}).then(async function (stream) {

    const player = document.getElementById('player')
    player.width = w
    player.height = h

    player.srcObject = stream

    await new Promise(resolve => {
      player.onloadedmetadata = () => { resolve(player) }
    })
    player.play()
    // window.player = player

    const canvas = document.getElementById('myCanvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    const net = await posenet.load()
    console.log('posenet loaded')

    async function detectPose() {
      if (!stop) {
        const poses = await net.estimateSinglePose(player, imageScaleFactor, flipHorizontal, outputStride)
        ctx.clearRect(0, 0, w, h)
        ctx.save()
        ctx.scale(-1, 1)
        ctx.translate(-w, 0)
        ctx.drawImage(player, 0, 0, w, h)
        ctx.restore()

        drawKeypoints(poses.keypoints, minPartConfidence, ctx)
        
      }
      requestAnimationFrame(detectPose)
      
    }

    detectPose()


  })

document.getElementById('control').addEventListener('click', function () {
  stop = !stop
})

function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  for (let i = 0; i < keypoints.length; i++) {
    const keypoint = keypoints[i]

    if (keypoint.score < minConfidence) continue
    const { y, x } = keypoint.position
    drawPoint(ctx, y * scale, x * scale, 3, 'green')
  }
}


function drawPoint(ctx, y, x, r, color) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, 2 * Math.PI)
  ctx.fillStyle = color
  ctx.fill()
}