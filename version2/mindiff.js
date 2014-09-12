/**
 * XadillaX created at 2014-09-12 13:21
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var _pal = require("../common/pal");
var fs = require("fs");

var getPixels = require("get-pixels");
require("sugar");
require("algorithmjs");

const PAL_SIZE = 256;
var pal = [];
var palHtml = "";
for(var i = 0; i < PAL_SIZE; i ++) {
    pal.push({ r: _pal[i][0], g: _pal[i][1], b: _pal[i][2] });

    palHtml += "<div style=\"width: 20px; height: 15px; float: left; margin-right: 5px; margin-bottom: 5px; background: rgba(" + _pal[i][0] + ", " + _pal[i][1] + ", " + _pal[i][2] + ", 1);\"></div>";
}
fs.writeFileSync("pal.html", palHtml, "utf8");

getPixels("pic.jpg", function(err, pixels) {
    var colors = {};
    var data = pixels.data;
    for(var i = 0; i < data.length; i += 4) {
        var r = data.readUInt8(i);
        var g = data.readUInt8(i + 1);
        var b = data.readUInt8(i + 2);

        var best = 0;
        var bestv = pal[0];
        var bestr = Math.abs(r - bestv.r) + Math.abs(g - bestv.g) + Math.abs(b - bestv.b);

        for(var j = 1; j < pal.length; j++) {
            var p = pal[j];
            var res = Math.abs(r - p.r) + Math.abs(g - p.g) + Math.abs(b - p.b);
            if(res < bestr) {
                best = j;
                bestv = pal[j];
                bestr = res;
            }
        }

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

    fs.writeFileSync("test2.html", string, "utf8");
    console.log("done");
});
