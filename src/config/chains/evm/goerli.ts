import { lookupArchive } from '@subsquid/archive-registry';
import { ProcessorConfig } from '../../processorConfig';

const config: ProcessorConfig = {
    chainName: 'goerli',
    prefix: 'goerli',
    dataSource: {
        archive: lookupArchive('eth-mainnet'),
    },
    blockRange: undefined
    // {
    // from: 2704621,
    // to: 2709567
    // }
};

export default config;