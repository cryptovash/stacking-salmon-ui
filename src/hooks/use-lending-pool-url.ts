import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import usePairAddress from '../hooks/usePairAddress';
import {
  PAGES,
  PARAMETERS
} from '../utils/constants/links';
import { useDefaultChainId } from './useTarotRouter';

const useLendingPoolURL = () : string => {
  const uniswapV2PairAddress = usePairAddress();
  const { chainId: web3ChainId } = useWeb3React<Web3Provider>();
  const defaultChainId = useDefaultChainId();
  const chainId = web3ChainId || defaultChainId;

  const lendingPoolURL =
    chainId ?
      PAGES.LENDING_POOL
        .replace(`:${PARAMETERS.CHAIN_ID}`, chainId.toString())
        .replace(`:${PARAMETERS.UNISWAP_V2_PAIR_ADDRESS}`, uniswapV2PairAddress) :
      '';

  return lendingPoolURL;
};

export default useLendingPoolURL;
