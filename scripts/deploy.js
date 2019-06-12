#!/usr/bin/env node
/**
 * Deployment tool for service containers
 * Requirements:
 * - Argument 1: the service key to deploy [graphql,...]
 * - ENV
 *   - DOCKERHUB_USERNAME
 *   - DOCKERHUB_PASSWORD
 *   - NR_APIKEY
 *   - RANCHER_URL
 *   - RANCHER_TOKEN
 *   - RANCHER_CLUSTERID
 *   - TRAVIS_TAG
 */

const { existsSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');
const https = require('https');
const lerna = require('../lerna.json');

const { log } = console;
const { TRAVIS_TAG, RANCHER_CLUSTERID } = process.env;
const environment = RANCHER_CLUSTERID === 'c-rc5kp' ? 'staging' : 'production';

const version = `v${lerna.version}`;
const service = process.argv[2];
const servicePath = join('services', service);
const image = `basecms/identity-x-${service}-service`;

const nrIds = {
  application: 238098240,
  graphql: 238106643,
  locale: 242186677,
  mailer: 238106582,
  membership: 238106610,
  organization: 238106397,
  token: 238106587,
  user: 238106594.
};

const error = (message) => {
  log(`ERROR: ${message}`);
  const text = `Deployment of \`${image}\` @ \`${version}\` to ${environment} FAILED!\n${message}`;
  const payload = JSON.stringify({ attachments: [{ color: 'danger', text }] });
  const req = https.request({
    hostname: 'hooks.slack.com',
    path: '/services/TDA6JTAKC/BGCT0SNGY/vJSPL4S2NQN8SDAjCPilP773',
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
    },
  }, (res) => {
    res.on('data', () => {
      log('Slack notified.');
      process.exit(1);
    });
  });

  req.on('error', e => log(e));
  req.write(payload);
  req.end();
};

if (TRAVIS_TAG !== version) error(`Tagged version ${TRAVIS_TAG} differs from lerna version ${version}, aborting!`);
if (!service) error('You must specify the service folder to deploy.');
if (!existsSync(servicePath)) error(`Could not read ${servicePath}!`);

const pkg = require(`../${servicePath}/package.json`); // eslint-disable-line import/no-dynamic-require

if (version !== `v${pkg.version}`) {
  log(`Service ${service} is at version ${pkg.version}. Skipping deployment.`);
  process.exit(0);
}

const getJson = (url, reqHeaders) => new Promise((resolve, reject) => {
  const headers = { ...reqHeaders, 'Content-Type': 'application/json; charset=utf-8' };
  https.get(url, { headers }, (resp) => {
    let data = '';
    const { statusCode, statusMessage } = resp;
    if (statusCode >= 500) return reject(statusMessage);
    resp.on('data', chunk => data += chunk); // eslint-disable-line no-return-assign
    resp.on('end', () => resolve(JSON.parse(data)));
    return resp;
  }).on('error', reject);
});

const getVersions = async () => {
  const authUrl = `https://auth.docker.io/token?service=registry.docker.io&scope=repository:${image}:pull`;
  const { token } = await getJson(authUrl);
  const url = `https://registry.hub.docker.com/v2/${image}/tags/list`;
  const list = await getJson(url, { Authorization: `Bearer ${token}` });
  return Array.isArray(list.tags) ? list.tags : [];
};

const shouldBuild = async () => {
  log(`\nChecking  ${image}:${version} on DockerHub`);
  const versions = await getVersions();
  return !versions.includes(version);
};

/**
 * Build docker image and push to docker hub
 */
const build = async () => {
  log(`Building  ${image}:${version}...\n`);
  const { status } = await spawnSync('bash', ['scripts/deploy-image.sh', service, version], { stdio: 'inherit' });
  if (status !== 0) error('Image build failed!');
};

const deploy = async () => {
  log(`Deploying ${image}:${version} on Kubernertes`);
  const nrid = nrIds[service];
  const { status } = await spawnSync('bash', ['scripts/deploy-k8s.sh', service, version, nrid], { stdio: 'inherit' });
  if (status !== 0) error('Image deploy failed!');
};

const main = async () => {
  if (await shouldBuild()) {
    log('  Image was not found, building.');
    await build();
    log('    Build complete.');
  } else {
    log('  Image found, skipping build.');
  }
  await deploy();
  log('  Deploy complete.\n');
};

main().catch(error);
