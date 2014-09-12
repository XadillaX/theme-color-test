// refer to http://dev.gameres.com/Program/Visual/Other/256color.htm
//          https://github.com/liballeg/allegro5/blob/4.3/src/color.c#L268-L328
var _pal = require("../common/pal");
var fs = require("fs");

var getPixels = require("get-pixels");
require("sugar");
require("algorithmjs");

/**
 * bestfitInit
 *   Color matching is done with weighted squares, which are much faster
 *   if we pregenerate a little lookup table...
 */
const MAX_INT = 2147483647;
const PAL_SIZE = 256;
var pal = [];
var palHtml = "";
for(var i = 0; i < PAL_SIZE; i ++) {
    pal.push({ r: _pal[i][0], g: _pal[i][1], b: _pal[i][2] });

    palHtml += "<div style=\"width: 20px; height: 15px; float: left; margin-right: 5px; margin-bottom: 5px; background: rgba(" + _pal[i][0] + ", " + _pal[i][1] + ", " + _pal[i][2] + ", 1);\"></div>";
}
fs.writeFileSync("pal.html", palHtml, "utf8");

var colDiff = new Array(3 * 128);
function bestfitInit() {
    for(var i = 0; i < colDiff.length; i++) colDiff[i] = 0;

    for(var i = 1; i < 64; i++) {
        var k = i * i;
        colDiff[0 + i] = colDiff[0 + 128 - i] = k * (59 * 59);
        colDiff[128 + i] = colDiff[128 + 128 - i] = k * (30 * 30);
        colDiff[256 + i] = colDiff[256 + 128 - i] = k * (11 * 11);
    }
}

function bestfitColor(pal, r, g, b) {
    var _colDiff;
    var bestfit = 0;
    var lowest = MAX_INT;

    if(colDiff[1] === undefined) bestfitInit();

    // no transparent (pink) color
    // because we're not making game.
    // if((r === 63) && (g === 0) && (b === 63)) i = 0;
    // else i = 1
    var i = 1;
    
    while(i < PAL_SIZE) {
        var rgb = pal[i];
        _colDiff = colDiff[0 + (Math.abs(rgb.g - g) & 0x7f)];
        if(_colDiff < lowest) {
            _colDiff += colDiff[128 + (Math.abs(rgb.r - r) & 0x7f)];
            if(_colDiff < lowest) {
                _colDiff += colDiff[256 + (Math.abs(rgb.b - b) & 0x7f)];
                if(_colDiff < lowest) {
                    bestfit = i;
                    if(0 === _colDiff) return bestfit;
                    lowest = _colDiff;
                }
            }
        }

        i++;
    }

    return bestfit;
}

getPixels("pic.jpg", function(err, pixels) {
    var colors = {};
    
    var data = pixels.data;
    for(var i = 0; i < data.length; i += 4) {
        var r = data.readUInt8(i);
        var g = data.readUInt8(i + 1);
        var b = data.readUInt8(i + 2);

        var best = bestfitColor(pal, r, g, b);
        r = pal[best].r.toString(16);
        g = pal[best].g.toString(16);
        b = pal[best].b.toString(16);

        if(r.length === 1) r = "0" + r;
        if(g.length === 1) g = "0" + g;
        if(b.length === 1) b = "0" + b;

        if(colors[r + g + b] === undefined) colors[r + g + b] = -1;
        colors[r + g + b]++;
    }

    console.log("bilibili~");

    var result = [];
    for(var key in colors) {
        result.push({ color: key, count: colors[key] });
    }

    result.qsort(function(a, b) {
        if(a.count > b.count) return true;
        if(a.count < b.count) return false;
        return a.color > b.color;
    });

    var string = "";
    for(var i = 0; i < result.length; i++) {
        string += "<div style=\"width: 50px; height: 21px; float: left; margin-right: 5px; margin-bottom: 5px; background: #" + result[i].color + "; color: #fff; font-size: 12px; text-align: center; padding-top: 9px;\">" + result[i].count + "</div>";
    }

    fs.writeFileSync("test1.html", string, "utf8");
    console.log("done");
});



