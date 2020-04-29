
let dfMapData = new mapData();



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
    pixelDensity(1);
}

let dragged = false;


function draw() {
    if (dfMapData.loaded) {
        // background(255, 0, 0);
        // return;

        textFont('Helvetica', 15);
        background(0);

        loadPixels();


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
        updatePixels();

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

