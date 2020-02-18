require('./newrelic');
const { service } = require('@base-cms/micro');
const newrelic = require('./newrelic');
const { INTERNAL_PORT, EXTERNAL_PORT } = require('./env');
const pkg = require('../package.json');
const actions = require('./actions');

const { log } = console;

process.on('unhandledRejection', (e) => {
  newrelic.noticeError(e);
  throw e;
});

service.jsonServer({
  actions,
  onStart: async () => {
    log(`> Booting ${pkg.name} v${pkg.version}...`);
  },
  onError: (e) => {
    const status = e.statusCode || e.status || 500;
    if (status >= 500) {
      newrelic.noticeError(e);
    } else {
      log('Error not sent to New Relic.');
    }
  },
  port: INTERNAL_PORT,
  exposedPort: EXTERNAL_PORT,
}).catch(e => setImmediate(() => {
  newrelic.noticeError(e);
  throw e;
}));