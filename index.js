var Jimp = require('jimp');

function getPixelRGB(image,x,y) {
    return Jimp.intToRGBA(image.getPixelColor(x,y));
}
function setPixelRBG(image,r,g,b,a,x,y) {
    image.setPixelColor(Jimp.rgbaToInt(r, g, b, a),x,y)
}

function average(a, b) {
    return ((a*1 + b*1) /2);
}

function generateChunkPart(image,x,y,ox,oy) {
    var pixel1 = getPixelRGB(image,x,y)
    var pixel2 = getPixelRGB(image,x-ox,y-oy)
    return {
        r:average(pixel1.r,pixel2.r),
        g:average(pixel1.g,pixel2.g),
        b:average(pixel1.b,pixel2.b),
        a:average(pixel1.a,pixel2.a)
    }
}
function generateChunk(image,chunk,x,y) {
    //Chunk section 0
    chunk[0][0] = generateChunkPart(image,x,y,-1,1)
    chunk[0][1] = generateChunkPart(image,x,y,0,1)
    chunk[0][2] = generateChunkPart(image,x,y,1,1)

    //Chunk section 1
    chunk[1][0] = generateChunkPart(image,x,y,-1,0)
    chunk[1][2] = generateChunkPart(image,x,y,1,0)

    //Chunk section 2
    chunk[2][0] = generateChunkPart(image,x,y,-1,-1)
    chunk[2][1] = generateChunkPart(image,x,y,0,-1)
    chunk[2][2] = generateChunkPart(image,x,y,1,-1)

    return chunk
}
function granite(from,to) {
    return new Promise(function(r) {
        Jimp.read(from, (err, image) => {
            new Jimp(image.bitmap.width*3, image.bitmap.height*3, 'green', (err, out) => {
                if (err) throw err
    
                for (let x = 0; x < image.bitmap.width; x++) {
                    for (let y = 0; y < image.bitmap.height; y++) {
                        var chunk = [[],[],[]]
                        chunk[1][1] = getPixelRGB(image,x,y)
                        chunk = generateChunk(image,chunk,x,y)
                        
                        for (let a = 0; a < chunk.length; a++) {
                            for (let b = 0; b < chunk[a].length; b++) {
                                setPixelRBG(out,chunk[a][b].r,chunk[a][b].g,chunk[a][b].b,chunk[a][b].a,x*3+a,y*3+b)
                            }
                        }
                    }
                }
    
                out.write(to);
                r()
            })
        });
    })   
}

async function go() {
    await granite("in.png","out.png")
}go()