const ConsumerServer  = require('chronicle-consumer');
const { JsonRpc } = require('eosjs');
const fetch = require('node-fetch');


class WaxConsumer {
    constructor(config, contracts, onReadCallback, reportMetricsFn = () => {}) {
        this.config = config;
        this.onReadCallback = onReadCallback;
        this.server = new ConsumerServer(config);
        this.contracts = contracts;

        const bcConnectionUrl = `http://${config.host}:${config.rpcPort}`;
        this.rpc = new JsonRpc(bcConnectionUrl, { fetch });
        this.last_irreversible_block_from_receiver = 0;
        this.last_irreversible_block_from_blockchain = 0;
        this.rpcBlockIntervalId = setInterval(() => {
            this.fetchBlockData();
            const blockGap = this.last_irreversible_block_from_blockchain - this.last_irreversible_block_from_receiver;
            reportMetricsFn('consumer-block-gap', blockGap);
        }, 1000);
    }

    fetchBlockData = async () => {
        try {
            const { last_irreversible_block_num } = await this.rpc.get_info();
            this.last_irreversible_block_from_blockchain = last_irreversible_block_num;
        } catch(err) {
            this.last_irreversible_block_from_blockchain = 0;
        }
    }
 
    init = () => {
        this.server.on('blockCompleted', function(data) {
            this.last_irreversible_block_receiver = data['last_irreversible'];
        });

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

destroy = () => {
    this.rpcBlockIntervalId && clearInterval(this.rpcBlockIntervalId);
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
        init: Instance.init,
        destroy: Instance.destroy
    }
}