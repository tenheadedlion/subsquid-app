import type { ProcessorConfig } from './processorConfig'
import fs from 'fs'
import { assertNotNull } from '@subsquid/substrate-processor'

export const WHITELIST_CONFIG: IWhiteListConfing = getJSON(
    'assets/whitelist-config.json'
)

interface IWhiteListConfing {
    whitelistItems: string[]
}

function getJSON(filename: string) {
    const data = fs.readFileSync(filename).toString()
    return JSON.parse(data)
}

export function getChainConfig(): ProcessorConfig {
    switch (process.env.CHAIN) {
        case 'acala':
            return require('./chains/acala').default
        case 'goerli':
            return require('./chains/evm/goerli').default
        default:
            throw new Error(`Unsupported chain ${process.env.CHAIN}`)
    }
}
