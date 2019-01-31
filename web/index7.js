const w = 240 // img width & height
const h = w * 9 / 16

navigator.mediaDevices.getUserMedia({
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
}).then(async video => {
  const model = await tf.loadModel('http://localhost:3000/trained_models/model_cnn_2/model.json')
  console.log('Model Ready')

  predict(model, video)

})

const output = document.getElementById('output')

async function predict(model, imgSrc) {
  const img = tf.fromPixels(imgSrc).mean(2).div(255).expandDims(2)
  // console.log(img)
  model.predict(img.expandDims(0)).data().then(prediction => {
    output.textContent = prediction[0].toFixed(3)
    window.requestAnimationFrame(() => {
      predict(model, imgSrc)
    })
  })
  

}

// ;(async function () {

//   const net = await posenet.load()
//   console.log('Net Ready')


//   // console.time(0)
//   const poses = await net.estimateSinglePose(document.getElementById('img'), imageScaleFactor, flipHorizontal, outputStride)
//   // console.timeEnd(0)

//   // console.time(1)
//   const result = await predict(model, poses.keypoints)
//   // console.timeEnd(1)
//   console.log(result[0])

//   // test for more images

// }())

