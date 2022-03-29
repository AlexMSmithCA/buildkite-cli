async function cli(command, args, options) {
    if (!options[command]) {
        throw new Error(`Unknown command: ${command}`);
    }
    const [docs, fn] = options[command];
    if (args.includes('help')) console.log(docs);
    else await fn(args);
}

module.exports = cli;