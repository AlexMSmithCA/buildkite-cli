const cli = require('./utils/cli.js');

const {retry} = require('./commands/retry.js');

async function run(argv) {
    const [command, ...rest] = argv;

    await cli(command, rest, {
        retry: [
            'Retry all failed jobs for a build.\n' +
            'Usage: buildkite-api retry <BUILDKITE_URL>',
            async () => retry({ url: rest[0] })
        ]
    });
}

module.exports = { run };