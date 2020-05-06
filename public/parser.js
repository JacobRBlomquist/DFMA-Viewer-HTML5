"use strict";

/**
 * Object which stores all data for a specific map
 */
function mapData() {
    this.loaded = false;
    this.version = 0;
    this.numTiles = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
    this.numLayers = 0;
    this.tiles = [];
    this.mapData = [];
    this.horizontals = [];
    this.verticals = [];
    this.ptr = 0;
    this.data = undefined;

    /**
     * Get a specific layer's image (P5.image)
     */
    this.getLayer = function (idx) {


        let mData = this.mapData[idx];
        if (mData.loaded) {
            return mData.img;
        } else {
            this.loadLayer(this, idx);
            return this.mapData[idx].img;
        }
    }

    /**
     * **Internal Function***
     * Loads a layer if it is not already cached
     * 
     * <rant> Why does javascript not have namespaces / private scope?
     * I know closures exist but they're like building a rocket to launch a
     * paper airplane. </rant>
     * 
     * idx - Index of layer to load (not layer number)
     */
    this.loadLayer = function (idx) {

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


        //blit whole pix
        for (let x = 0; x < imgTWidth; x++) {
            for (let y = 0; y < imgTHeight; y++) {
                let yTileIndex = y * this.tileHeight;
                let xTileIndex = x * this.tileWidth;
                let curIndex = y + x * imgTHeight;

                let curTile = curMapData.blocks[curIndex];

                for (let ty = 0; ty < this.tileHeight; ty++) {
                    for (let tx = 0; tx < this.tileWidth; tx++) {
                        let srcIdx = tx * 4 + ty * 4 * this.tileWidth;
                        let destIdx = ((xTileIndex + tx) * 4) + ((yTileIndex + ty) * 4 * imgWidth);
                        curLayer.pixels[destIdx] = curTile[srcIdx];
                        curLayer.pixels[destIdx + 1] = curTile[srcIdx + 1];
                        curLayer.pixels[destIdx + 2] = curTile[srcIdx + 2];
                        curLayer.pixels[destIdx + 3] = curTile[srcIdx + 3];

                        // curLayer.set(xTileIndex + tx, yTileIndex + ty, color(curTile[srcIdx], curTile[srcIdx + 1], curTile[srcIdx + 2]))
                    }
                }
            }
        }

        curLayer.updatePixels();

        this.mapData[idx].loaded = true;
        this.mapData[idx].img = curLayer;
        this.mapData[idx].loading = false;
    }

    /**
     * Parse a dataview object built on a UInt8Array.
     * 
     * Populates this object
     * data - Dataview object
     */
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

        //get layer metadata
        for (let i = 0; i < this.numLayers; i++) {
            let curDepth = data.getInt32(this.ptr, true);
            this.ptr += 4;
            let curWidth = data.getInt32(this.ptr, true);
            this.ptr += 4;
            let curHeight = data.getInt32(this.ptr, true);
            this.ptr += 4;
            this.mapData.push({ depth: curDepth, width: curWidth, height: curHeight, index: i, loaded: false, blocks: [] });
        }



        for (let curTileIdx = 0; curTileIdx < this.numTiles; curTileIdx++) {
            let numPixels = this.tileWidth * this.tileHeight;
            let processed = 0;
            let pixelData = [];

            //throw away tile information for now
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

        for (let i = 0; i < this.numLayers; i++) {

            let curMapData = this.mapData[i];
            let imgTWidth = curMapData.width;
            let imgTHeight = curMapData.height;


            for (let j = 0; j < imgTWidth * imgTHeight; j++) {
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
                curMapData.blocks.push(this.tiles[curIndex]);
            }
        }

        this.mapData.sort((a, b) => {//sort by layer
            return a.depth - b.depth;
        });

        console.log("Parsed")
        this.loaded = true;
    }
}
