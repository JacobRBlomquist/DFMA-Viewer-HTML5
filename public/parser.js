"use strict";

function mapData() {
    this.loaded = false;
    this.version = 0;
    this.numTiles = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
    this.numLayers = 0;
    this.tiles = [];
    this.mapData = [];
    this.ptr = 0;
    this.data = undefined;

    this.loadLayer = function (idx) {
        console.log("loading " + idx);
        loading = true;



        if (this.mapData[idx].loaded)
            return;

        this.mapData[idx].loading = true;
        let curMapData = this.mapData[idx];
        let imgTWidth = curMapData.width;
        let imgTHeight = curMapData.height;

        let imgWidth = imgTWidth * this.tileWidth;
        let imgHeight = imgTHeight * this.tileHeight;

        let curLayer = createImage(imgWidth, imgHeight);
        curLayer.loadPixels();


        for (let y = 0; y < imgTHeight; y++) {
            let yTileIndex = y * this.tileHeight;
            for (let x = 0; x < imgTWidth; x++) {
                let xTileIndex = x * this.tileWidth;
                let curIndex;
                if (this.numTiles <= 127) {
                    curIndex = this.data.getUint8(this.ptr++, true);
                } else if (this.numTiles <= 32767) {
                    curIndex = this.data.getUint16(this.ptr, true);
                    this.ptr += 2;
                } else {
                    curIndex = this.data.getUint32(this.ptr, true);
                    this.ptr += 4;
                }

                let curTile = this.tiles[curIndex];

                //blit
                for (let ty = 0; ty < this.tileHeight; ty++) {
                    for (let tx = 0; tx < this.tileWidth; tx++) {
                        let srcIdx = ty * 4 + tx * 4 * this.tileWidth;
                        curLayer.set(yTileIndex + ty, xTileIndex + tx, color(curTile[srcIdx], curTile[srcIdx + 1], curTile[srcIdx + 2]))
                    }
                }

            }
        }

        curLayer.updatePixels();



        this.mapData[idx].loaded = true;
        this.mapData[idx].img = curLayer;
        loading = false;
        this.mapData[idx].loading = false;
        console.log("done loading " + idx);
    }

    this.parse = function (data) {
        if (this.loaded) {
            return;
        }
        this.data = data;

        this.version = data.getInt32(this.ptr, true);
        this.ptr += 4;
        this.numTiles = data.getInt32(this.ptr, true);
        this.ptr += 4;
        this.tileWidth = data.getInt32(this.ptr, true);
        this.ptr += 4;
        this.tileHeight = data.getInt32(this.ptr, true);
        this.ptr += 4;
        this.numLayers = data.getInt32(this.ptr, true);
        this.ptr += 4;

        if (this.version < -3) {
            console.log("UNSUPPORTED FDF-MAP FILE FORMAT - Version: " + this.version + " IS INVALID OR NOT IMPLEMENTED YET");
            return;
        }

        let flags = -1 - this.version;
        let RLE = false;
        let TID = false;

        if (flags & 1)
            TID = true;
        if (flags & 2)
            RLE = true;

        //get map data
        for (let i = 0; i < this.numLayers; i++) {
            let curDepth = data.getInt32(this.ptr, true);
            this.ptr += 4;
            let curWidth = data.getInt32(this.ptr, true);
            this.ptr += 4;
            let curHeight = data.getInt32(this.ptr, true);
            this.ptr += 4;
            this.mapData.push({ depth: curDepth, width: curWidth, height: curHeight, index: i, loaded: false, loading: false });
        }



        for (let curTileIdx = 0; curTileIdx < this.numTiles; curTileIdx++) {
            let numPixels = this.tileWidth * this.tileHeight;
            let processed = 0;
            let pixelData = [];

            //throw away tile information for nowp5.BandPass()
            if (TID)
                this.ptr += 3;

            while (processed < numPixels)//P5 needs RGBA
            {
                let num = data.getUint8(this.ptr++, true);
                let b = data.getUint8(this.ptr++, true);
                let g = data.getUint8(this.ptr++, true);
                let r = data.getUint8(this.ptr++, true);
                for (let i = num; i > 0; i--) {

                    pixelData.push(r);//RED
                    pixelData.push(g);//GREEN
                    pixelData.push(b);//BLUE
                    pixelData.push(255);//ALPHA
                    processed++;
                }
            }
            this.tiles.push(pixelData);

        }






        this.loadLayer(0);

        // let size = 30;
        // let h = ceil(this.numTiles / size);
        // console.log("H: "+h)
        // let layer = createImage(this.tileWidth*size,this.tileHeight*h);

        // layer.loadPixels();


        // let xTile = 0,yTile = 0;
        // for(let i = 0;i<this.numTiles;i++)
        // {
        //     let curTile = this.tiles[i];



        //     for(let y = 0;y<this.tileHeight;y++)
        //     {
        //         for(let x = 0;x<this.tileWidth;x++)
        //         {
        //             let srcIdx = x * 4 + y * 4 * this.tileWidth;
        //             layer.set(xTile * this.tileWidth+x,yTile * this.tileHeight+y,color(curTile[srcIdx],curTile[srcIdx+1],curTile[srcIdx+2]));
        //         }
        //     }

        //     xTile++;
        //     if(xTile>=layer.width/this.tileWidth)
        //     {
        //         xTile = 0;
        //         yTile++;
        //         if(yTile>=layer.height/this.tileHeight)
        //             break;
        //     }
        // }

        // layer.updatePixels();

        // this.layers.push(layer);

        console.log("Parsed")
        this.loaded = true;
    }
}
