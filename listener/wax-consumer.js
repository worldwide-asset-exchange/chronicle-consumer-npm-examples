'use strict';

const config          = require('config');
const { Client }      = require('pg');
const consumerFactory = require('./lib/consumer');
const dbWriterFactory = require('./lib/dbWriter');
const statsd_client   = require('./lib/metrics');


// connect to DB...
const client = new Client(config.get(`dbConfig`))

const dbConnect = async () => { 
    try {
        await client.connect()
        console.log("DB Connection Established")
        statsd_client.gauge('db_connection',1)
    } catch(err) {
        console.error(err);
        throw new Error(`Unable to connect to DB`);
        statsd_client.gauge('db_connection',0);
    }
};

function work() {
    const dbWriter = dbWriterFactory(client, statsd_client.gauge);
    const consumer = consumerFactory(config.get(`consumer`), ["bcbrawlers"], dbWriter.write, statsd_client.gauge);
    consumer.init();
}

dbConnect().then(work)