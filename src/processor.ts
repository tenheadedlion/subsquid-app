import { hexToU8a } from "@polkadot/util"
import { lookupArchive } from "@subsquid/archive-registry"
import * as ss58 from "@subsquid/ss58"
import { BatchBlock, BatchContext, BatchProcessorItem, SubstrateBatchProcessor } from "@subsquid/substrate-processor"
import { Store, TypeormDatabase } from "@subsquid/typeorm-store"
import { In } from "typeorm"
import { Account } from "./model"
import { SystemAccountStorage } from "./types/storage"

const processor = new SubstrateBatchProcessor()
    .setBlockRange({
        from: 2_858_000
        //, to: 2_858_700 
    })
    .setDataSource({
        archive: lookupArchive("acala", { release: "FireSquid" }),
        chain: 'wss://acala-rpc-0.aca-api.network'
    })
    .addCall('*')
    .includeAllBlocks({
        from: 2_858_000
        //, to: 2_858_700 
    })


type Item = BatchProcessorItem<typeof processor>
type Ctx = BatchContext<Store, Item>
type Block = BatchBlock<Item>;

processor.run(new TypeormDatabase(), async ctx => {
    for (const block of ctx.blocks) {
        for (let item of block.items) {
            if (item.kind === "call") {
                const extrinsic = item.extrinsic;
                const signature = extrinsic.signature;
                if (signature) {
                    let addrAsHex = signature.address.value;
                    let addrAsBytes = hexToU8a(addrAsHex);
                    let nonce = await getNonce(ctx, block, addrAsBytes);
                    ctx.log.info(`${addrAsHex}'s nonce at block ${block.header.height}: ${nonce.toString()}`)
                }
            }
        }
    }
})

async function getNonce(ctx: Ctx, block: Block, publicKey: Uint8Array): Promise<any> {
    let storage = new SystemAccountStorage(ctx, block.header)
    let nonce = (await storage.asV2000.get(publicKey)).nonce
    return nonce
}
