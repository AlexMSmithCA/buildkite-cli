const fetch = require('node-fetch');
const querystring = require('querystring');

module.exports = class Buildkite {
  constructor(config) {
    this.config = config;
    this.fetch = config.fetch || fetch;
  }

  parameterizeEndpoint(endpoint, params) {
    return params ? `${endpoint}?${querystring.stringify(params)}` : endpoint;
  }

  async getBuild(org, pipeline, buildNumber) {
    return this.request(
      `organizations/${org}/pipelines/${pipeline}/builds/${buildNumber}`,
      'GET',
      ''
    );
  }
    
    async retryJob(org, pipeline, buildNumber, jobId) {
        return this.request(
            `organizations/${org}/pipelines/${pipeline}/builds/${buildNumber}/jobs/${jobId}/retry`,
            'PUT',
            ''
          );
    }

  async request(endpoint, method, paramsOrData) {
    const url = `${this.config.address}/${
      method === 'GET'
        ? this.parameterizeEndpoint(endpoint, paramsOrData)
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