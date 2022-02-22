const ConsumerServer  = require('chronicle-consumer');

class WaxConsumer {
    constructor(config, contracts, onReadCallback) {
        this.config = config;
        this.onReadCallback = onReadCallback;
        this.server = new ConsumerServer(config);
        this.contracts = contracts;
    }

    init = () => {
        this.server.on('connected', function() {
            console.log('WAX-Listener CONNECTED');
        });
        
        this.server.on('disconnected', function() {
            console.log('WAX-Listener DISCONNECTED');
        });
        
        this.server.on('tx', (data) => {
            let trace = data.trace;
            if(trace.status == 'executed') {
                for(let i=0; i< trace.action_traces.length; i++) {
           
                    let atrace = trace.action_traces[i];
           
                    is_atrace_of_interest(
                        {
                            blocknumber: data.block_num,
                            executiontime: data.block_timestamp,
                            txn_id: data.trace.id,
                            ...atrace 
                        },
                        this.contracts,
                        this.onReadCallback
                    )
                }
            }
        });

        this.server.start();
    }
}

function is_atrace_of_interest(atrace, contracts, callback) {
    if(atrace.receipt.receiver == atrace.act.account &&
       contracts.includes(atrace.act.account) &&
       typeof atrace.act.data === 'object') {
        callback(atrace)
    }
}

module.exports = (...args) => {
    const Instance = new WaxConsumer(...args);

    return {
        init: Instance.init
    }
}