class DBWriter {
    constructor(client, reportMetricsFn = () => {}) {
        this.client = client;
        this.dbConnectionIntervalId = setInterval(async () => {
            try {
                await this.checkConnection();
                reportMetricsFn('db-connection', 1);
            } catch(err) {
                reportMetricsFn('db-connection', 0)
            }
        }, 1000);
    }

    checkConnection = async() => {
        const queryText = 'SELECT 1';
        return this.client.query(queryText, [])
    }

    write = async (data) => {
        const {
            act: {
                name: action,
                data: {
                    brawler_id,  
                    gear_id,
                    slot_id,
                    ring_id,
                    owner = '',
                    ...extraData
                }
            },
            executiontime,
            blocknumber,
            txn_id,
        } = data;
       
        const queryText = `INSERT INTO bcbrawlers(
            action, 
            brawler_id, 
            gear_id, 
            slot_id, 
            ring_id, 
            owner, 
            extradata, 
            executiontime,
            blocknumber,
            txn_id
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        
        return this.client.query(
                queryText, 
                [
                    action, 
                    brawler_id, 
                    gear_id, 
                    slot_id, 
                    ring_id, 
                    owner, 
                    extraData, 
                    executiontime, 
                    blocknumber, 
                    txn_id
                ]
            ).catch(e => console.error(e.stack))
    }

    destroy = () => {
        this.dbConnectionIntervalId && clearInterval(this.dbConnectionIntervalId);
    }
    
}

module.exports = (client) => {
    const Instance = new DBWriter(client);

    return {
        write: Instance.write,
        destroy: Instance.destroy
    }
}