const w = 480 // video width & height
const h = w * 9 / 16

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed

const minPoseConfidence = 0.1
const minPartConfidence = 0.5

const state = {
  color: '#2ECC40', // green 
  showDot: true, // show the dots on image
  showCanvas: true,


}

async function setupCamera() {
  return navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: 'user',
      width: w,
      height: h,
    }
  }).then(stream => {
    const video = document.getElementById('video')
    video.width = w
    video.height = h
    video.srcObject = stream
    return new Promise(res => {
      video.onloadedmetadata = () => {
        video.play()
        res(video)
      }
    })
  })
} 

// navigator.mediaDevices.getUserMedia({
//   audio: false,
//   video: {
//     facingMode: 'user',
//     width: w,
//     height: h,
//   },
// }).then(async function (stream) {

//   // set up video

//   const canvas = document.getElementById('canvas')
//   canvas.width = w
//   canvas.height = h

//   // context for the canvas
//   const ctx = canvas.getContext('2d')

//   // load the model
//   posenet.load().then(net => {
//     console.log('posenet loaded')
    
//     detectPose(net, video, ctx)

//     const controller = document.getElementById('control')
//     controller.textContent = 'STOP'
//     controller.addEventListener('click', function (e) {
//       const nextState = !state.stopped
//       e.currentTarget.textContent = nextState ? 'START' : 'STOP'
//       state.stopped = nextState
//     })
//   })

// })

// async function detectPose(net, imageSrc, ctx) {  
//   if (!state.stopped) {
//     const poses = await net.estimateSinglePose(imageSrc, imageScaleFactor, flipHorizontal, outputStride)
//     ctx.clearRect(0, 0, w, h)
//     ctx.save()
//     ctx.scale(-1, 1)
//     ctx.translate(-w, 0)
//     ctx.drawImage(imageSrc, 0, 0, w, h)
//     ctx.restore()

//     drawKeypoints(poses.keypoints, minPartConfidence, ctx)
    
//   }

//   requestAnimationFrame(() => { detectPose(net, imageSrc, ctx) })
// }


// function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
//   for (let i = 0; i < keypoints.length; i++) {
//     const keypoint = keypoints[i]

//     if (keypoint.score < minConfidence) continue
//     const { y, x } = keypoint.position

//     ctx.beginPath()
//     ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI)
//     ctx.fillStyle = state.color
//     ctx.fill()
//   }
// }