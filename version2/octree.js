/**
 * XadillaX created at 2014-09-12 10:20:54
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved
 */
var fs = require("fs");
var getPixels = require("get-pixels");
var sugar = require("sugar");
var algorithm = require("algorithmjs");

var reducible = [];
var leafNum = 0;

// refer to http://www.twinklingstar.cn/2013/491/octree-quantization/

// 八叉树节点
var OctreeNode = function() {
    this.isLeaf = false;
    this.pixelCount = 0;
    this.red = 0;
    this.green = 0;
    this.blue = 0;

    this.children = new Array(8);
    for(var i = 0; i < this.children.length; i++) this.children[i] = null;

    // 这里的 next 不是指兄弟链中的 next 指针
    // 而是在 reducible 链表中的下一个节点
    this.next = null;
};

for(var i = 0; i < 7; i++) reducible.push(null);

var root = new OctreeNode();

/**
 * createNode
 *
 * @param {OctreeNode} parent the parent node of the new node
 * @param {Number} idx child index in parent of this node
 * @param {Number} level node level
 * @return {OctreeNode} the new node
 */
function createNode(parent, idx, level) {
    var node = new OctreeNode();
    if(level === 7) {
        node.isLeaf = true;
        leafNum++;
    } else {
        node.next = reducible[level];
        reducible[level] = node;
    }

    return node;
}

/**
 * addColor
 *
 * @param {OctreeNode} node the octree node
 * @param {Object} color color object
 * @param {Number} level node level
 * @return {undefined}
 */
function addColor(node, color, level) {
    if(node.isLeaf) {
        node.pixelCount++;
        node.red += color.r;
        node.green += color.g;
        node.blue += color.b;
    } else {
        // 由于 js 内部都是以浮点型存储数值，所以位运算并没有那么高效
        // 在此使用直接转换字符串的方式提取某一位的值
        var str = "";
        var r = color.r.toString(2);
        var g = color.g.toString(2);
        var b = color.b.toString(2);
        while(r.length < 8) r = '0' + r;
        while(g.length < 8) g = '0' + g;
        while(b.length < 8) b = '0' + b;

        str += r[level];
        str += g[level];
        str += b[level];
        var idx = parseInt(str, 2);

        if(null === node.children[idx]) {
            node.children[idx] = createNode(node, idx, level + 1);
        }

        if(undefined === node.children[idx]) {
            console.log(color.r.toString(2));
        }

        addColor(node.children[idx], color, level + 1);
    }
}

/**
 * reduceTree
 *
 * @return {undefined}
 */
function reduceTree() {
    // find the deepest level of node
    var lv = 6;
    while(null === reducible[lv]) lv--;

    // get the node and remove it from reducible link
    var node = reducible[lv];
    reducible[lv] = node.next;

    // merge children
    var r = 0;
    var g = 0;
    var b = 0;
    var count = 0;
    for(var i = 0; i < 8; i++) {
        if(null === node.children[i]) continue;
        r += node.children[i].red;
        g += node.children[i].green;
        b += node.children[i].blue;
        count += node.children[i].pixelCount;
        leafNum--;
    }

    node.isLeaf = true;
    node.red = r;
    node.green = g;
    node.blue = b;
    node.pixelCount = count;
    leafNum++;
}

/**
 * buildOctree
 *
 * @param {Array} pixels The pixels array
 * @param {Number} maxColors The max count for colors
 * @return {undefined}
 */
function buildOctree(pixels, maxColors) {
    for(var i = 0; i < pixels.length; i++) {
        // 添加颜色
        addColor(root, pixels[i], 0);

        // 合并叶子节点
        while(leafNum > maxColors) reduceTree();
    }
}

/**
 * colorsStats
 *
 * @param {OctreeNode} node the node will be stats
 * @param {Object} object color stats
 * @return {undefined}
 */
function colorsStats(node, object) {
    if(node.isLeaf) {
        var r = parseInt(node.red / node.pixelCount).toString(16);
        var g = parseInt(node.green / node.pixelCount).toString(16);
        var b = parseInt(node.blue / node.pixelCount).toString(16);
        if(r.length === 1) r = '0' + r;
        if(g.length === 1) g = '0' + g;
        if(b.length === 1) b = '0' + b;

        var color = r + g + b;
        if(object[color]) object[color] += node.pixelCount;
        else object[color] = node.pixelCount;
        
        return;
    }

    for(var i = 0; i < 8; i++) {
        if(null !== node.children[i]) {
            colorsStats(node.children[i], object);
        }
    }
}

getPixels("pic.jpg", function(err, pixels) {
    var data = pixels.data;
    var array = [];
    for(var i = 0; i < data.length; i += 4) {
        var r = data.readUInt8(i);
        var g = data.readUInt8(i + 1);
        var b = data.readUInt8(i + 2);
        array.push({ r: r, g: g, b: b });
    }

    buildOctree(array, 256);

    var colors = {};
    colorsStats(root, colors);
    console.log(colors);
    console.log(Object.size(colors));

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

    fs.writeFileSync("test3.html", string, "utf8");
    console.log("done");
});

