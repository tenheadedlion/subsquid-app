import { Store, TypeormDatabase } from "@subsquid/typeorm-store"
import { Transaction } from './model/generated/transaction.model';
import { getChainConfig, WHITELIST_CONFIG } from './config/index';
import { Account } from './model/generated/account.model';
import {
    EvmBatchProcessor, BatchProcessorItem
} from "@subsquid/evm-processor";

const CHAIN_CONFIGS = getChainConfig();

const processor = new EvmBatchProcessor()
    .setBlockRange(CHAIN_CONFIGS.blockRange)
    .setDataSource(CHAIN_CONFIGS.dataSource)
    .addTransaction('*', {
        data: {
            transaction: {
                nonce: true,
                from: true 
            }
        }
    })

type Item = BatchProcessorItem<typeof processor>

processor.run(new TypeormDatabase(), async ctx => {
    for (const block of ctx.blocks) {
        let blockNumber = block.header.height;
        let timestamp = block.header.timestamp;
        for (let item of block.items) {
            if (item.kind === "transaction") {
                console.log(`${item.transaction.from}: ${item.transaction.nonce}`);       
            }
        }
    }
})
