'use strict'

let dfMapData
let idx = 0

/**
 * P5 Preload.
 *
 * Occurs once before setup.
 */
function preload () {
  const fName = 'file.fdf-map'
  document.getElementById('fileName').innerText = fName

  // fetch local file
  dfMapData = window.loadFromURL(fName).then(e => {
    dfMapData = e
  })
}

/**
 * P5 setup
 *
 * Occurs once before main loop
 */
function setup () {
  const canvas = window.createCanvas(800, 600)
  canvas.parent('canvas_container')
  canvas.dragOver(fileHoverCB)
  canvas.dragLeave(fileHoverLeaveCB)
  canvas.drop(fileDropCB)
  window.background(0)
  window.textFont('Helvetica', 15)
  window.textAlign(window.CENTER, window.CENTER)
  window.pixelDensity(1)
}

// GLOBALS
let dragged = false
let imageX = 0
let imageY = 0
let originalImgHeight = 0
let originalImgWidth = 0
let imgWidth = 0
let imgHeight = 0
let clickX = 0
let clickY = 0
const selectedX = 10
const selectedY = 10
let scale = 0.25
const jump = 1.05

/**
 * P5 Draw Function
 *
 * Occurs each frame
 */
function draw () {
  if (dfMapData.loaded) {
    if (window.keyIsPressed === true && (window.key === '=' || window.key === '+' || window.key === '-')) { zoom() }

    // setup zoom information
    if (originalImgWidth === 0) { // not loaded
      originalImgWidth = dfMapData.mapData[0].width * dfMapData.tileWidth
      originalImgHeight = dfMapData.mapData[0].height * dfMapData.tileHeight
      imgWidth = originalImgWidth * scale
      imgHeight = originalImgHeight * scale
      // return;
    }

    window.background(0)

    if (dfMapData.mapData[idx] !== undefined && dfMapData.mapData[idx].loaded === false && !dfMapData.mapData[idx].loading) {
      dfMapData.loadLayer(idx)
      return
    }
    if (dfMapData.mapData[idx] === undefined || dfMapData.mapData[idx].img === undefined) { return }
    const img = dfMapData.getLayer(idx)
    window.image(img, imageX, imageY, imgWidth, imgHeight)

    const selectorWidth = dfMapData.tileWidth * scale
    const selectorHeight = dfMapData.tileHeight * scale

    window.stroke(255, 255, 0)
    window.strokeWeight(3)
    window.noFill()
    window.rect(imageX + selectorWidth * selectedX, imageY + selectorHeight * selectedY, selectorWidth, selectorHeight)

    window.stroke(255)
    window.noFill()
    window.strokeWeight(1)
    window.textFont('Helvetica', 12)
    window.textAlign(window.LEFT)
    window.text('Layer: ' + dfMapData.mapData[idx].depth, 20, 20)

    // debug code for seeing all tiles
    //       loadPixels();
    //    let xT = 0, yT = 0;
    //      let wPixels = dfMapData.tileWidth;
    //      let hPixels = dfMapData.tileHeight;
    //      for (let i = 0; i < dfMapData.numTiles; i++) {

    //          let cols = dfMapData.tiles[i];
    //          for (let y = 0; y < hPixels; y++) {
    //              for (let x = 0; x < wPixels; x++) {
    //                  let idx = x * 4 + y * 4 * wPixels;
    //                  pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4] = cols[idx];
    //                  pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4 + 1] = cols[idx + 1];
    //                  pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4 + 2] = cols[idx + 2];
    //                  pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4 + 3] = cols[idx + 3];
    //              }
    //          }
    //          xT++;
    //          if (xT >= width / wPixels) {
    //              xT = 0;
    //              yT++;
    //              if (yT >= height / hPixels)
    //                  break;
    //          }
    //      }
    //      updatePixels();

    if (dragged) {
      window.fill(0, 0, 0, 200)
      window.textFont('Helvetica', 30)
      window.textAlign(window.CENTER, window.CENTER)
      window.rect(0, 0, window.width, window.height)
      window.fill(255)
      window.text('DROP FDF-MAP FILE HERE', window.width / 2, window.height / 2)
    }
  } else {
    window.background(0)
    window.textFont('Helvetica', 20)
    window.textAlign(window.CENTER, window.CENTER)
    window.stroke(255)
    window.fill(255)

    window.text('Loading...', window.width / 2, window.height / 2)
  }
}

/**
 * Called whenever a 'zoom' key is pressed.
 */
function zoom () {
  let zoomed = false
  // ZOOM

  if (window.key === '=' || window.key === '+') {
    scale *= jump
    if (scale > 20) { scale = 20 }

    zoomed = true
  }

  if (window.key === '-') {
    scale /= jump
    if (scale < 0.01) { scale = 0.01 }

    zoomed = true
  }

  // center zoom
  if (zoomed) {
    const curCenterX = window.width / 2 - imageX
    const curCenterY = window.height / 2 - imageY

    const ratioX = curCenterX / imgWidth
    const ratioY = curCenterY / imgHeight

    imgWidth = originalImgWidth * scale
    imgHeight = originalImgHeight * scale

    imageX = window.width / 2 - imgWidth * ratioX
    imageY = window.height / 2 - imgHeight * ratioY
    originalImgWidth = 0
  }
}

/**
 * P5 MousePressed
 *
 * Called whenever the mouse is pressed
 */
function mousePressed () {
  clickX = window.mouseX
  clickY = window.mouseY
}

/**
 * P5 MouseDragged
 *
 * Called whenever the mouse is dragged
 */
function mouseDragged () {
  const xDif = (window.mouseX - clickX)
  const yDif = (window.mouseY - clickY)
  clickX = window.mouseX
  clickY = window.mouseY
  imageX += xDif
  imageY += yDif
}

/**
 * P5 KeyPressed function
 *
 * called whenever a key is pressed
 */
function keyPressed () {
  if (window.key === ',' || window.key === '<') {
    idx++
    if (idx >= dfMapData.numLayers) { idx = dfMapData.numLayers - 1 }
  }
  if (window.key === '.' || window.key === '>') {
    idx--
    if (idx < 0) { idx = 0 }
  }
}

/**
 * Callback for when a hover event occurs
 */
function fileHoverCB () {
  dragged = true
}

/**
 * Call back for when a hover event leaves canvas
 */
function fileHoverLeaveCB () {
  dragged = false
}

/**
 * Callback for when a file drop event occurs
 */
function fileDropCB (file) {
  if (!file.name.endsWith('fdf-map')) {
    window.alert("Invalid File Format! You must submit an 'fdf-map' file!")
  }

  originalImgWidth = 0
  originalImgHeight = 0

  const reader = new window.FileReader()
  reader.onload = function () {
    const arr = new Uint8Array(reader.result)
    // inflate data
    const data = window.pako.inflate(arr)
    const res = new DataView(data.buffer)
    // bytes = new DataView(data.buffer);
    dfMapData = new window.MapData()
    dfMapData.parse(res)
  }

  reader.readAsArrayBuffer(file.file)
  fileHoverLeaveCB()
  document.getElementById('fileName').innerText = file.name
}

if (typeof module !== 'undefined') {
  module.exports = {
    fileDropCB,
    fileHoverLeaveCB,
    keyPressed,
    mouseDragged,
    mousePressed,
    zoom,
    draw,
    setup,
    preload
  }
}
