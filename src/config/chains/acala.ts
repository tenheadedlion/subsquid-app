import { ProcessorConfig } from '../processorConfig';

const config: ProcessorConfig = {
    chainName: 'acala',
    prefix: 'acala',
    dataSource: {
        archive: 'https://acala.archive.subsquid.io/graphql',
        chain: 'wss://acala-rpc-2.aca-api.network/ws'
    },
    blockRange: undefined
    // {
    // from: 2704621,
    // to: 2709567
    // }
};

export default config;
