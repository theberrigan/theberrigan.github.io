"use strict";

const browserSync = require('browser-sync').create();

browserSync.init({
    server: "./projects/",
    files: './projects/**',
    notify: false,
    port: 9137
});