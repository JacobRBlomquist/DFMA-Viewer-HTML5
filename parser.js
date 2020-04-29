
function mapData() {
    this.loaded = false;
    this.version = 0;
    this.numTiles = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
    this.numLayers = 0;
    this.tiles = [];
    this.mapData = [];

    this.parse = function (data) {
        if (this.loaded) {
            return;
        }

        let ptr = 0;

        this.version = data.getInt32(ptr, true);
        ptr += 4;
        this.numTiles = data.getInt32(ptr, true);
        ptr += 4;
        this.tileWidth = data.getInt32(ptr, true);
        ptr += 4;
        this.tileHeight = data.getInt32(ptr, true);
        ptr += 4;
        this.numLayers = data.getInt32(ptr, true);
        ptr += 4;

        if (this.version != -1) {
            console.log("UNSUPPORTED FDF-MAP FILE FORMAT - Version: " + this.version + " IS INVALID OR NOT IMPLEMENTED YET");
            return;
        }

        //get map data
        for (let i = 0; i < this.numLayers; i++) {
            let curDepth = data.getInt32(ptr, true);
            ptr += 4;
            let curWidth = data.getInt32(ptr, true);
            ptr += 4;
            let curHeight = data.getInt32(ptr, true);
            ptr += 4;
            this.mapData.push({ depth: curDepth, width: curWidth, height: curHeight, index: i });
        }

        for (let curTileIdx = 0; curTileIdx < this.numTiles; curTileIdx++) {
            let numPixels = this.tileWidth * this.tileHeight;
            let processed = 0;
            let pixelData = [];
            while (processed < numPixels)//P5 needs RGBA
            {
                let num = data.getUint8(ptr++, true);
                let b = data.getUint8(ptr++, true);
                let g = data.getUint8(ptr++, true);
                let r = data.getUint8(ptr++, true);
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


        console.log("Parsed")
        this.loaded = true;
    }
}
