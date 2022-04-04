#!/usr/bin/env node
/* eslint-env node */

process.on("unhandledRejection", (e) => {
  console.error(e.stack);
  process.exit(1);
});

require("tsm");
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("../src/index").run(process.argv.slice(2));
