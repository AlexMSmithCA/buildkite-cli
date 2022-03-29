# Buildkite CLI for Node.js

**Work in progress!**

Access the [Buildkite](https://buildkite.com) API commands from Node.js.

This project will expose the publically available Buildkite APIs ([REST API](https://buildkite.com/docs/apis/rest-api) and [GraphQL API](https://buildkite.com/docs/apis/graphql-api)) as well as provides additional helpful utility commands for common use cases (e.g. retrying failing jobs).

These can be consumed programmatically via module imports, or from the command line (via `npx`).

## Examples

Retry all failed jobs for a build:

```
$ npx buildkite-cli retry <BUILDKITE_URL>
```
