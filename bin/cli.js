#!/usr/bin/env node

process.on('unhandledRejection', e => {
    console.error(e.stack);
    process.exit(1);
});

require('../index.js').run(process.argv.slice(2));