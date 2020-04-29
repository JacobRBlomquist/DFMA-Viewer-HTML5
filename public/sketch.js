
let dfMapData = new mapData();
let origPixDensity = 1;


function preload() {
    let fName = "file.fdf-map";
    document.getElementById('fileName').innerText = fName;

    fetchAndDecompressMapData(fName).then((e) => {

        dfMapData.parse(e)
    });

}

function setup() {

    let canvas = createCanvas(800, 600);
    canvas.parent('canvas_container')
    canvas.dragOver(fileHoverCB);
    canvas.dragLeave(fileHoverLeaveCB);
    canvas.drop(fileDropCB);
    background(0);
    textFont('Helvetica', 15);
    textAlign(CENTER, CENTER);
    origPixDensity = pixelDensity();
    pixelDensity(1);
}

//GLOBALS
let dragged = false;
let imageX = 0;
let imageY = 0;
let clickX = 0;
let clickY = 0;
let selectedX = 10;
let selectedY = 10;
let scale = 2;
let jump = 1.1;

function mouseWheel(evt) {
    if (event.delta > 0) {
        scale /=jump;
        if (scale < 0.25)
            scale = 0.25;
    } else {
        scale *=jump;
        if (scale > 5)
            scale = 5;
    }
}

function mousePressed() {
    clickX = mouseX;
    clickY = mouseY;
}

function mouseDragged() {
    let xDif = (mouseX - clickX);
    let yDif = (mouseY - clickY);
    clickX = mouseX;
    clickY = mouseY;
    imageX += xDif;
    imageY += yDif;
}


function draw() {
    if (dfMapData.loaded) {
        // background(255, 0, 0);
        // return;


        background(0);
        let img = dfMapData.layers[0];
        image(img, imageX, imageY, img.width * scale, img.height * scale);

        let selectorWidth = dfMapData.tileWidth * scale;
        let selectorHeight = dfMapData.tileHeight * scale;

        stroke(255, 255, 0);
        strokeWeight(3)
        noFill();
        rect(imageX + selectorWidth * selectedX, imageY + selectorHeight * selectedY, selectorWidth, selectorHeight);

        /* loadPixels();
 
 
       let xT = 0, yT = 0;
         let wPixels = dfMapData.tileWidth;
         let hPixels = dfMapData.tileHeight;
         for (let i = 0; i < dfMapData.numTiles; i++) {
 
             let cols = dfMapData.tiles[i];
             for (let y = 0; y < hPixels; y++) {
                 for (let x = 0; x < wPixels; x++) {
                     let idx = x * 4 + y * 4 * wPixels;
                     pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4] = cols[idx];
                     pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4 + 1] = cols[idx + 1];
                     pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4 + 2] = cols[idx + 2];
                     pixels[(xT * wPixels * 4) + x * 4 + (y + yT * hPixels) * width * 4 + 3] = cols[idx + 3];
                 }
             }
             xT++;
             if (xT >= width / wPixels) {
                 xT = 0;
                 yT++;
                 if (yT >= height / hPixels)
                     break;
             }
         }
         updatePixels();*/

    } else {
        textFont('Helvetica', 20);
        text("Loading...", width / 2, height / 2);
    }
    if (dragged) {
        fill(0, 0, 0, 200);
        textFont('Helvetica', 30);
        textAlign(CENTER, CENTER);
        rect(0, 0, width, height);
        fill(255);
        text("DROP FDF-MAP FILE HERE", width / 2, height / 2);
    }

}


function fetchAndDecompressMapData(path) {

    return fetch(path)
        .then((res) => {
            return res.arrayBuffer()
        })
        .then((a) => {
            let arr = new Uint8Array(a);
            //inflate data
            let data = pako.inflate(arr);
            let res = new DataView(data.buffer);
            // bytes = new DataView(data.buffer);
            return res;
        });


}


function fileHoverCB() {

    dragged = true;
}

function fileHoverLeaveCB() {

    dragged = false;
}

function fileDropCB(file) {

    if (!file.name.endsWith("fdf-map")) {
        alert("Invalid File Format! You must submit an 'fdf-map' file!");
    }

    const reader = new FileReader();
    reader.onload = function () {
        let arr = new Uint8Array(reader.result);
        //inflate data
        let data = pako.inflate(arr);
        let res = new DataView(data.buffer);
        // bytes = new DataView(data.buffer);
        dfMapData = new mapData();
        dfMapData.parse(res);
    }

    reader.readAsArrayBuffer(file.file);
    fileHoverLeaveCB();
    document.getElementById('fileName').innerText = file.name;
}

