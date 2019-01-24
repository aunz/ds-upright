// import '@tensorflow/tfjs'
// import * as posenet from '@tensorflow-models/posenet'


const w = 480 // img width & height
const h = w * 9 / 16
const url = 'http://localhost:3000/'

const imageScaleFactor = 1 // 0 ~ 1, higher: better accuracy but lower speed
const flipHorizontal = true // because fed thru webcam
const outputStride = 16 // 8, 16, 32; higher: better accuracy & lower speed

const results = []
window.results = results

function detectPose(net, imageSrc) {  
  return net.estimateSinglePose(imageSrc, imageScaleFactor, flipHorizontal, outputStride)
}

function processFile(net, url) {
  const img = new Image()
  img.crossOrigin = 'anonymous'

  return new Promise(res => {
    img.onload = () => {
      detectPose(net, img).then(pose => {
        pose.name = url.match(/([^\/]*)(?:\.jpg$)/i)[1]
        pose.keypoints.forEach(part => {
          part.position.x = Math.round(part.position.x)
          part.position.y = Math.round(part.position.y)
        })
        results.push(pose)
        res(pose)
      })
    }
    
    img.src = url
  })

}


;(async function () {

  const [net, filesA, filesB] = await Promise.all([
    posenet.load(),
    fetch(url + 'a.json').then(r => r.json()),
    fetch(url + 'b.json').then(r => r.json()),
  ])

  console.log('Ready')

  document.getElementById('buttonA').addEventListener('click', async e => {
    e.currentTarget.disabled = true
    for (i of filesA) {
      console.log(i)
      await processFile(net, url + 'a/' + i)
    }
    console.log('DONE A')
  })

  document.getElementById('buttonB').addEventListener('click', async e => {
    e.currentTarget.disabled = true
    for (i of filesB) {
      console.log(i)
      await processFile(net, url + 'b/' + i)
    }
    console.log('DONE B')
  })




}())

