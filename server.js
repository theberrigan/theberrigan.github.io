'use strict';

const browserSync = require('browser-sync').create();

browserSync.init({
    injectChanges: false,
    server: "./projects/",
    files: './projects/**',
    notify: false,
    port: 9137,
    open: true,
    startPath: '/knowledge-base'
});