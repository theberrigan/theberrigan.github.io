"use strict";

const browserSync = require('browser-sync').create();

browserSync.init({
    server: "./",
    files: './**',
    notify: false
});