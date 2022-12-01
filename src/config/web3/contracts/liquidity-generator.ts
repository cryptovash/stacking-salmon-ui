import { CHAIN_IDS } from '../../../config/web3/chains';

const LIQUIDITY_GENERATOR_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x1f7A54dF8B04cA31Ac875Cef5Acaa247c87420ED'
};

export {
  LIQUIDITY_GENERATOR_ADDRESSES
};
