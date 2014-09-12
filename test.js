/**
 * XadillaX created at 2014-09-12 13:24
 *
 * Copyright (c) 2014 Huaban.com, all rights
 * reserved.
 */
var run = require("sync-runner");

var ver = [
    "version1/magicnumber.js",
    "version2/mindiff.js",
    "version3/octree.js"
];

for(var i = 0; i < ver.length; i++) {
    console.log(run("node " + ver[i]));
}
