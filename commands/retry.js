const Buildkite = require('../apis/buildkite');
const config = require('../config.js');

const WEB_BUILD_REGEX = new RegExp(
    `https:\/\/buildkite.com\/(\\w+)\/([\\w-]+)\/builds\/(\\d+)`
);
const API_BUILD_REGEX = new RegExp(
    `${config.buildkite.address}/organizations\/(\\w+)\/pipelines\/([\\w-]+)\/builds\/(\\d+)`
);

async function initAPIs() {
    return {
        buildkite: new Buildkite(config.buildkite)
    }
}

async function forEachAsync(arr, fn) {
    await mapAsync(arr, fn);
}

async function mapAsync(arr, fn) {
    const result = [];
    for (let elem of arr) {
        result.push(await fn(elem));
    }
    return result;
}

async function getFailedTriggeredBuilds(api, build) {
    const failed = build.jobs.filter(j =>
        j.type === 'trigger' &&
        j.state === 'failed' &&
        j.triggered_build
    );
    return await mapAsync(failed, async b => {
        const [,org, pipeline, buildNumber] = b.triggered_build.url.match(API_BUILD_REGEX);
        return await api.getBuild(org, pipeline, buildNumber);
    });
}

async function retryFailedJobs(api, build) {
    const [,org, pipeline, buildNumber] = build.url.match(API_BUILD_REGEX);
    const package = build.env.PACKAGE || '';
    forEachAsync(
        build.jobs.filter(j => j.state === 'failed'),
        async j => {
            console.log(`  - Retrying ${package ? `(${package}) ` : ''}${j.web_url}`);
            await api.retryJob(org, pipeline, buildNumber, j.id);
        }
    );
}

async function retry({url}) {
    if (!url) return;
    const [,org, pipeline, buildNumber] = url.match(WEB_BUILD_REGEX);

    console.log("Initializing APIs...");
    const { buildkite } = await initAPIs();

    console.log("Fetching build...");
    const build = await buildkite.getBuild(org, pipeline, buildNumber);
    
    console.log("Resolving failed trigger builds...");
    const failed = await getFailedTriggeredBuilds(buildkite, build);
    console.log(`  - Identified ${failed.length} build failures`);
    
    console.log("Retrying failed jobs...");
    await forEachAsync(failed, async (b) => {
        await retryFailedJobs(buildkite, b);
    });
}

module.exports = { retry };