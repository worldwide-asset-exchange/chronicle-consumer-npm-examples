const config = require('config');
const SDC = require('statsd-client');

const statsd_client = new SDC({
  host: config.get('statsd.host'),
  port: config.get('statsd.port'),
  prefix: `${config.get('statsd.prefix')}.${process.env.ENVIRONMENT || 'dev' }.`
});

module.exports = statsd_client;