import { hexToU8a } from "@polkadot/util"
import { lookupArchive } from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import { BatchBlock, BatchContext, BatchProcessorItem, SubstrateBatchProcessor } from "@subsquid/substrate-processor"
import { Store, TypeormDatabase } from "@subsquid/typeorm-store"
import { In } from "typeorm"
import { SystemAccountStorage } from "./types/storage"
import { Transaction } from './model/generated/transaction.model';
import { getChainConfig, WHITELIST_CONFIG } from './config/index';
import { string } from './model/generated/marshal';
import { Account } from './model/generated/account.model';

const CHAIN_CONFIGS = getChainConfig();

const processor = new SubstrateBatchProcessor()
    .setBlockRange(CHAIN_CONFIGS.blockRange)
    .setDataSource(CHAIN_CONFIGS.dataSource)
    .addCall('*')
    .includeAllBlocks()

type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchContext<Store, Item>
type Block = BatchBlock<Item>;

processor.run(new TypeormDatabase(), async ctx => {
    let knownAccounts = await ctx.store.find(Account).then(accounts => {
        return new Map(accounts.map(a => [a.id, a]))
    })
    let txs = getTransactions(ctx, knownAccounts);
    console.log(txs);
})

function getTransactions(ctx: Ctx, knownAccounts: Map<string, Account>): Transaction[] {
    let txs: Transaction[] = [];

    for (const block of ctx.blocks) {
        let blockNumber = block.header.height;
        let timestamp = block.header.timestamp;
        for (let item of block.items) {
            if (item.kind === "call") {
                const extrinsic = item.extrinsic;
                const signature = extrinsic.signature;
                // we only want signed extrinsics
                if (signature) {
                    // only handler addresses in the whitelist
                    let addrAsHex = signature.address.value as string;
                    if (WHITELIST_CONFIG.whitelistItems.includes(addrAsHex)) {
                        let nonce = signature.signedExtensions.CheckNonce.nonce;
                        let result = extrinsic.success;
                        ctx.log.info(`${timestamp}|${blockNumber}: ${addrAsHex}'s nonce at block ${block.header.height}: ${nonce.toString()}: ${result}`)


                        let account = knownAccounts.get(addrAsHex);
                        if (account === undefined) {
                            account = new Account({
                                id: addrAsHex,
                                txCount: 0
                            });
                        }

                        txs.push({
                            id: item.extrinsic.id,
                            account,
                            nonce,
                            result,
                            blockNumber,
                            timestamp
                        })
                    }

                }
            }
        }
    }
    return txs;
}

function getAccount(m: Map<string, Account>, id: string): Account {
    let acc = m.get(id)
    if (acc == null) {
        acc = new Account()
        acc.id = id
        m.set(id, acc)
    }
    return acc
}
