const w = 480 // video width & height
const h = w * 9 / 16

const rootUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000/' : '/'

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed

const minPoseConfidence = 0.5
const minPartConfidence = 0.5

// app state
const state = {
  color: '#2ECC40', // green 
  showDot: true, // show the dots on image
  play: 0, // video playing
  predictMode: 'lr', // [lr, cnn]: logistic regression, CNN  
}

// dom elements
const output = document.getElementById('output')
const message = document.getElementById('message')

// dom eventListeners
function listenerButtonPlay(video) {
  return function (e) {
    if (state.play) { video.pause() } else video.play()
    state.play = !state.play

    ;['icon-play', 'icon-pause'].forEach(i => {
      e.currentTarget.classList.toggle(i)
    })    
  }
}


function setupCamera() {
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
        res(video)
      }
    })
  })
} 



function drawToCanvas(ctx, imgSrc) {
  ctx.clearRect(0, 0, w, h)
  ctx.save()
  ctx.scale(-1, 1)
  ctx.translate(-w, 0)
  ctx.drawImage(imgSrc, 0, 0, w, h)
  ctx.restore()
}

function getPoses(net, imgSrc) {
  return net.estimateSinglePose(imgSrc, imageScaleFactor, flipHorizontal, outputStride)
}

function isPoseScoreLow(poses) {
  return poses.score < minPoseConfidence || poses.keypoints.some(e => e.score < minPartConfidence)
}

// predict poses using logistic regression
function predictLR({ int, coefs }, keypoints) {
  let r = int
  for (let i = 0; i < keypoints.length; i++) {
    const { x, y } = keypoints[i].position
    r += x * coefs[i] / w + y * coefs[i + 17] / w // because there are 17 points
  }

  r = 1 / (1 + Math.exp(-r))
  return r
}

function predictNN(model, keypoints) {
  const x = []
  const y = []
  for (const i of keypoints) {

    x.push(i.position.x)
    y.push(i.position.y)
  }

  const ts = tf.tensor1d([].concat(x, y)).div(w).expandDims(0)
  return model.predict(ts).dataSync()[0]
}

function predictCNN(model, keypoints) {
  const rh = 135 // reduce the dimension
  const rw = 240

  // const img = new Array(h).fill(0).map(() => new Array(w).fill(0).map(() => [0]))
  const img = [] // img pixels based on keypoints
  for (let i = -1; ++i < rh;) {
    img[i] = []
    for (let j = -1; ++j < rw;) img[i][j] = [0]
  }
  
  keypoints.forEach(p => {
    let { x, y } = p.position
    x = Math.max(Math.min(Math.round(x / 2), rw - 1), 0)
    y = Math.max(Math.min(Math.round(y / 2), rh - 1), 0)
    img[y][x] = [1]
    console.log(x, y)
  })

  const ts = tf.tensor3d(img).expandDims(0) // turn img pixels into tf array and extend 1 more dim
  return 1 - model.predict(ts).dataSync()[0]
}

// a requestAnimationFrame to loop thru stuff
async function loop(net, model, intCoefs, imgSrc, ctx) {
  if (state.play) {
    const poses = await getPoses(net, imgSrc)
    const poseIsConfident = poses.score > minPoseConfidence &&
      (poses.keypoints[15].score > 0.5 || poses.keypoints[16].score > 0.5)
    // {
    //   const p0 = poses.keypoints[0] // nose
    //   const p15 = poses.keypoints[15] // leftAnkle
    //   const p16 = poses.keypoints[16] // rightAnkle
    //   console.log(
    //     p0.score.toFixed(3), ~~p0.position.x, ~~p0.position.y, '\n', 
    //     p15.score.toFixed(3), ~~p15.position.x, ~~p15.position.y, '\n',
    //     p16.score.toFixed(3), ~~p16.position.x, ~~p16.position.y, 
    //   )      
    // }
    drawToCanvas(ctx, imgSrc)
    if (!poseIsConfident) {
      message.textContent = 'Detecting posture…'
      output.textContent = 'Move away'
      message.classList.add('blink')
    } else {
      message.classList.remove('blink')
      message.textContent = ''
      if (state.showDot) drawKeypoints(poses.keypoints, minPartConfidence, ctx)
      // const score = state.predictMode === 'lr' ? predictLR(intCoefs, poses.keypoints) : predictCNN(model, poses.keypoints)
      const score = predictLR(intCoefs, poses.keypoints)
      // const score = predictNN(model, poses.keypoints)
      // const score = predictCNN(model, poses.keypoints)
      output.textContent = score.toFixed(3) + '\n' + poses.score.toFixed(3)
      
    }
  } else {
    message.classList.remove('blink')
    message.textContent = ''
    output.textContent = ''
  }

  requestAnimationFrame(() => {
    loop(net, model, intCoefs, imgSrc, ctx)
  })
}

// ready & initate the page with video, model, coef etc
(async function () {
  const [net, model, intCoefs, video] = await Promise.all([
    posenet.load(),
    tf.loadModel(rootUrl + 'trained_models/model_cnn_5/model.json'),
    // tf.loadModel(rootUrl + 'trained_models/model_cnn_2/model.json'),
    fetch(rootUrl + 'trained_models/intercept_coefs.json').then(r => r.json()), // intercepts and coefs for logistic regression
    setupCamera(),
  ])

  // remove the spinning loader and register event for the play stop button
  document.getElementById('initial-loader').remove()
  document.getElementById('play-stop').classList.toggle('display-none')
  document.getElementById('play-stop').addEventListener('click', listenerButtonPlay(video))

  // set up canvas
  const canvas = document.getElementById('canvas')
  canvas.classList.remove('display-none')
  canvas.width = w
  canvas.height = h
  
  const ctx = canvas.getContext('2d')

  loop(net, model, intCoefs, video, ctx)

}())


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