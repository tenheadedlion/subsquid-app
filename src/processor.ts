import { lookupArchive } from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import { BatchContext, BatchProcessorItem, SubstrateBatchProcessor } from "@subsquid/substrate-processor"
import { Store, TypeormDatabase } from "@subsquid/typeorm-store"
import { In } from "typeorm"
import { Account } from "./model"
import { SystemAccountStorage } from "./types/storage"


const processor = new SubstrateBatchProcessor()
    .setBlockRange({ from: 2_858_000, to: 2_858_700 })
    .setDataSource({
        archive: lookupArchive("acala", { release: "FireSquid" }),
        chain: 'wss://acala-rpc-0.aca-api.network'
    })
    .includeAllBlocks({ from: 2_858_000, to: 2_858_700 })
//.addCall('*', {
//    range: {
//        from: 1000000
//    }
//} as const)


type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchContext<Store, Item>


let lastNounce = 0;
processor.run(new TypeormDatabase(), async ctx => {
    for (const block of ctx.blocks) {
        // block.header is of type { hash: string }
        let storage = new SystemAccountStorage(ctx, block.header)
        let address = ss58.decode('25Ysz77gGHBVDwzdG8menWgLtkJt5JJtYbkXicm744KS8Xid').bytes
        let nonce = (await storage.asV2000.get(address)).nonce
        if (nonce > lastNounce) {
            ctx.log.info(`nonce at block ${block.header.height}: ${nonce.toString()}`)
        }
        lastNounce = nonce;
    }
})

