#!/usr/bin/env node

process.on('unhandledRejection', e => {
    console.error(e.stack);
    process.exit(1);
});

require('tsm');
require('../src/index').run(process.argv.slice(2));