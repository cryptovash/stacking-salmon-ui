import { CHAIN_IDS } from '../../../config/web3/chains';

const MULTICALL_ADDRESSES: {
  [chainId: number]: string;
} = {
  [CHAIN_IDS.FANTOM]: '0x9903f30c1469d8A2f415D4E8184C93BD26992573',
  [CHAIN_IDS.OPTIMISM]: '0xFbdd194376de19a88118e84E279b977f165d01b8',
  [CHAIN_IDS.ARBITRUM]: '0x842eC2c7D803033Edf55E478F461FC547Bc54EB2',
  [CHAIN_IDS.ETHEREUM_MAIN_NET]: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696'
};

export { MULTICALL_ADDRESSES };
