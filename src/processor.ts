import { BatchBlock, BatchContext, BatchProcessorItem, SubstrateBatchProcessor } from "@subsquid/substrate-processor"
import { Store, TypeormDatabase } from "@subsquid/typeorm-store"
import { Transaction } from './model/generated/transaction.model';
import { getChainConfig, WHITELIST_CONFIG } from './config/index';
import { Account } from './model/generated/account.model';

const CHAIN_CONFIGS = getChainConfig();

const processor = new SubstrateBatchProcessor()
    .setBlockRange(CHAIN_CONFIGS.blockRange)
    .setDataSource(CHAIN_CONFIGS.dataSource)
    .addCall('*')
    .includeAllBlocks()

type Item = BatchProcessorItem<typeof processor>

processor.run(new TypeormDatabase(), async ctx => {
    let knownAccounts = await ctx.store.find(Account).then(accounts => {
        return new Map(accounts.map(a => [a.id, a]))
    })
    console.log(`knownAccounts:`);
    console.log(knownAccounts);

    let transactions: Transaction[] = [];
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
                            account = new Account();
                            account.id = addrAsHex;
                        }

                        knownAccounts.set(account.id, account);

                        let id = item.extrinsic.id;
                        transactions.push(new Transaction({
                            id,
                            account,
                            nonce,
                            result,
                            blockNumber,
                            timestamp
                        }));
                    }

                }
            }
        }
    }

    console.log(knownAccounts);
    console.log(transactions);

    await ctx.store.save([...knownAccounts.values()]);
    await ctx.store.insert(transactions);
})
