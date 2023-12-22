
const settings = {
  height: 750,
  width: 750,
  simulationRate: 1,
  boidDetectionDistance: 50
}

const context = {
  followDistance: 50,
  buffer: 0,
  fallbackSpeed: 0.2,
  cruiseSpeed: 0.5,
  attackSpeed: 0.8,
  turnSpeed: 0.1,
  boidDetectionDistance: 100
}

const boidDrawSize = 15
const boidVelocityLineSize = 30

const basicSet = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19]

const drawRange = false

var frameNum = 0;

let encoder
const frate = 30
const numFrames = 5000
let recording = false
let recordedFrames = 0
let paused = true
let showConnections = true

let n = 20

let pauseButton, recordButton, resetButton
let drawConnectionsCheckbox
let numBoidsInput
let toolbar

function preload() {
  HME.createH264MP4Encoder().then(enc => {
    encoder = enc
    encoder.outputFilename = 'boidSort'
    encoder.width = settings.width * 2
    encoder.height = settings.height * 2
    encoder.frameRate = frate
    encoder.kbps = 50000 // video quality
    encoder.groupOfPictures = 10 // lower if you have fast actions.
    encoder.initialize()
  })
}

function loadSet(set, environment) {
  set.forEach(
    (num) => {
      const boid = new SortBoid(num, environment.getRandomInBoundsPos(), context)
      environment.addBoid(boid)
    }
  )
}

let env

function drawBoid(boid) {

  fill(255, 255, 255)
  noStroke()
  circle(boid.pos.x, boid.pos.y, boidDrawSize)

  const velocityCopy = boid.velocity.copy()
  let lineTo = p5.Vector.add(velocityCopy.mult(boidVelocityLineSize), boid.pos)
  stroke(255)
  line(boid.pos.x, boid.pos.y, lineTo.x, lineTo.y)

  if (boid.following) {
    stroke(255, 0, 0)
    line(boid.pos.x, boid.pos.y, boid.following.pos.x, boid.following.pos.y)
  }

  stroke(0)
  fill(0)
  textSize(10)
  text(boid.num, boid.pos.x - boidDrawSize / 4, boid.pos.y + boidDrawSize / 4)

  if (drawRange) {
    stroke(255)
    noFill()
    circle(boid.pos.x, boid.pos.y, context.boidDetectionDistance)
  }

}

function drawEnvironment(environment) {
  environment.boids.forEach(boid => {
    drawBoid(boid)
  });
}

function setup() {
  createCanvas(settings.width, settings.height)

  toolbar = select("#toolbar")

  // buttons
  pauseButton = createButton("PLAY")
  pauseButton.mousePressed(pause)
  pauseButton.id("pauseButton")
  pauseButton.parent(toolbar)
  recordButton = createButton("RECORD")
  recordButton.mousePressed(startRecording)
  recordButton.id("recordButton")
  recordButton.parent(toolbar)
  resetButton = createButton("RESET")
  resetButton.mousePressed(reset)
  resetButton.parent(toolbar)

  //input
  numBoidsInput = createInput(n)
  numBoidsInput.parent(toolbar)

  env = new Environment(settings)
  loadSet(basicSet, env)
}

function draw() {
  if (!paused) {
    frameNum += 1

    clear()
    stroke(255, 255, 255)
    noFill()
    rect(0, 0, settings.width, settings.height)
    env.advance(1)

    drawEnvironment(env)

    // keep adding new frame
    if (recording) {
      console.log('recording')
      encoder.addFrameRgba(drawingContext.getImageData(0, 0, encoder.width, encoder.height).data);
      recordedFrames++
    }
    // finalize encoding and export as mp4
    if (recordedFrames === numFrames) {
      recording = false
      recordedFrames = 0
      console.log('recording stopped')

      encoder.finalize()
      const uint8Array = encoder.FS.readFile(encoder.outputFilename);
      const anchor = document.createElement('a')
      anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }))
      anchor.download = encoder.outputFilename
      anchor.click()
      encoder.delete()

      preload() // reinitialize encoder
    }
  }
}

function startRecording() {
  recording = true
  recordButton.html("STOP RECORDING")
  recordButton.mousePressed(stopRecording)
}
function stopRecording() {
  recordButton.html("RECORD")
  recordButton.mousePressed(startRecording)

  recording = false
  recording = false
  recordedFrames = 0
  console.log('recording stopped')

  encoder.finalize()
  const uint8Array = encoder.FS.readFile(encoder.outputFilename);
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }))
  anchor.download = encoder.outputFilename
  anchor.click()
  encoder.delete()

  preload() // reinitialize encoder
}

function generateBoids(n) {
  const mySet = []
  for (let i = 0; i < n; i++) {
    mySet.push(i)
  }
  loadSet(mySet, env)
}

function pause() {
  paused = !paused
  if (paused) {
    pauseButton.html("PLAY")
  }
  else {
    pauseButton.html("PAUSE")
  }
}

function reset() {
  env.clear()
  try {
    generateBoids(int(numBoidsInput.value()))
  }
  catch {
    generateBoids(n)
  }
  drawConnectionsCheckbox.value(false)
  debugCheckbox.value(false)
}

function toggleShowConnections() {
  showConnections = !showConnections
}