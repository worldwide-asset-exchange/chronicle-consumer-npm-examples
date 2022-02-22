'use strict';

const program         = require('commander');
const ConsumerServer  = require('chronicle-consumer');
const config          = require('config');
const { Client }      = require('pg');
const consumerFactory = require('./lib/consumer');
const dbWriterFactory = require('./lib/dbWriter');

// connect to DB...
const client = new Client(config.get(`dbConfig`))

const dbConnect = async () => { 
    try {
        await client.connect()
        console.log("DB Connection Established")
    } catch(err) {
        console.error(err);
        throw new Error(`Unable to connect to DB`);
    }
};

function work() {
    const dbWriter = dbWriterFactory(client);
    const consumer = consumerFactory(config.get(`consumer`), ["bcbrawlers"], dbWriter.write);
    consumer.init();
}

dbConnect().then(work)

// program
//     .requiredOption('--contracts [value]', 'Comma-separated list of contracts whose actions are monitored')
//     .parse(process.argv);


// var accountsMap = new Map();
// program.contracts.split(',').forEach(function(c) {
//     accountsMap.set(c, true);
// });