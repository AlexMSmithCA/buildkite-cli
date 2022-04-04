import fetch from 'node-fetch';
import {stringify} from 'querystring';

type Params = { [key: string]: string };

export default class Buildkite {
  config: any;
  fetch: any;

  constructor(config: any) {
    this.config = config;
    this.fetch = config.fetch || fetch;
  }

  parameterizeEndpoint(endpoint: string, params: Params | undefined) {
    return params ? `${endpoint}?${stringify(params)}` : endpoint;
  }

  async getBuild(org: string, pipeline: string, buildNumber: string) {
    return this.request(
      `organizations/${org}/pipelines/${pipeline}/builds/${buildNumber}`,
      'GET',
      ''
    );
  }
    
    async retryJob(org: string, pipeline: string, buildNumber: string, jobId: string) {
        return this.request(
            `organizations/${org}/pipelines/${pipeline}/builds/${buildNumber}/jobs/${jobId}/retry`,
            'PUT',
            ''
          );
    }

  async request(endpoint: string, method: string, paramsOrData: Params | string) {
    const url = `${this.config.address}/${
      method === 'GET'
        ? this.parameterizeEndpoint(endpoint, typeof paramsOrData === 'string' ? undefined : paramsOrData)
        : endpoint
    }`;
    const res = await this.fetch(url, {
      method: method,
      body: method === 'POST' ? JSON.stringify(paramsOrData) : null,
      headers: {
        Authorization: `Bearer ${this.config.token}`,
      },
    });
    let err, body;
    try {
      body = await res.json();
      if (res.status >= 400) {
        err = new Error(`Error ${res.status} from Buildkite: ${body.message}`);
      }
    } catch (jsonParseError) {
      body = await res.text();
      err = new Error(`Error parsing JSON from Buildkite for "${url}" \
with statusCode "${res.status}" and responseBody "${body}"`);
    }
    if (err) {
      throw err;
    }
    return body;
  }
};