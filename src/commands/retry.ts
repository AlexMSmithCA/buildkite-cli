import Buildkite from '../apis/buildkite';
import config from '../config';

const WEB_BUILD_REGEX = new RegExp(
    `https://buildkite.com/(\\w+)/([\\w-]+)/builds/(\\d+)`
);
const API_BUILD_REGEX = new RegExp(
    `${config.buildkite.address}/organizations/(\\w+)/pipelines/([\\w-]+)/builds/(\\d+)`
);

type APIs = {
    buildkite: Buildkite
};

async function initAPIs(): Promise<APIs> {
    return {
        buildkite: new Buildkite(config.buildkite)
    };
}

async function forEachAsync<T>(arr: Array<T>, fn: (elem: T) => Promise<void>): Promise<void> {
    await mapAsync(arr, fn);
}

async function mapAsync<TIn, TOut>(arr: Array<TIn>, fn: (elem: TIn) => Promise<TOut>): Promise<Array<TOut>> {
    const result = [];
    for (const elem of arr) {
        result.push(await fn(elem));
    }
    return result;      
}

type Build = any;
type Job = any;

async function getFailedTriggeredBuilds(api: Buildkite, build: Build) {
    const failed = build.jobs.filter((j: Job) =>
        j.type === 'trigger' &&
        j.state === 'failed' &&
        j.triggered_build
    );
    return await mapAsync(failed, async (b: Build) => {
        const [,org, pipeline, buildNumber] = b.triggered_build.url.match(API_BUILD_REGEX);
        return await api.getBuild(org, pipeline, buildNumber);
    });
}

async function retryFailedJobs(api: Buildkite, build: Build) {
    const [,org, pipeline, buildNumber] = build.url.match(API_BUILD_REGEX);
    const pckg = build.env.PACKAGE || '';
    forEachAsync(
        build.jobs.filter((j: Job) => j.state === 'failed'),
        async (j: Job) => {
            console.log(`  - Retrying ${pckg ? `(${pckg}) ` : ''}${j.web_url}`);
            await api.retryJob(org, pipeline, buildNumber, j.id);
        }
    );
}

export default async function retry({url}: {url: string}) {
    if (!url) return;

    const match = url.match(WEB_BUILD_REGEX);
    if (!match || match.length < 4) throw new Error(`Invalid url provided: ${url}`);
    const [, org, pipeline, buildNumber] = match;

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