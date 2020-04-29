
function mapData() {
    this.loaded = false;
    this.version = 0;
    this.numTiles = 0;
    this.tileWidth = 0;
    this.tileHeight = 0;
    this.numLayers = 0;
    this.tiles = [];
    this.mapData = [];
    this.layers = [];

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

            //throw away tile information for nowp5.BandPass()
            if (TID)
                ptr += 3;

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

        let size = 30;
        let h = ceil(this.numTiles / size);
        console.log("H: "+h)
        let layer = createImage(this.tileWidth*size,this.tileHeight*h);
        
        layer.loadPixels();
  

        let xTile = 0,yTile = 0;
        for(let i = 0;i<this.numTiles;i++)
        {
            let curTile = this.tiles[i];



            for(let y = 0;y<this.tileHeight;y++)
            {
                for(let x = 0;x<this.tileWidth;x++)
                {
                    let srcIdx = x * 4 + y * 4 * this.tileWidth;
                    layer.set(xTile * this.tileWidth+x,yTile * this.tileHeight+y,color(curTile[srcIdx],curTile[srcIdx+1],curTile[srcIdx+2]));
                }
            }

            xTile++;
            if(xTile>=layer.width/this.tileWidth)
            {
                xTile = 0;
                yTile++;
                if(yTile>=layer.height/this.tileHeight)
                    break;
            }
        }

        layer.updatePixels();

        this.layers.push(layer);

        console.log("Parsed")
        this.loaded = true;
    }
}
