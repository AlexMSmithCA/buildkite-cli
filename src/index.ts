import cli from "./utils/cli";
import retry from "./commands/retry";

export async function run(argv: Array<string>) {
  const [command, ...rest] = argv;

  await cli(command, rest, {
    retry: [
      "Retry all failed jobs for a build.\n" +
        "Usage: buildkite-api retry <BUILDKITE_URL>",
      async () => retry({ url: rest[0] }),
    ],
  });
}
