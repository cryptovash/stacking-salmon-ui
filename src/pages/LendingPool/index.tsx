
import { useParams } from 'react-router-dom';

import PairAddressContext from '../../contexts/PairAddress';
import LendingPoolContent from '../../../public';
import { PARAMETERS } from '../../utils/constants/links';
import { useDefaultChainId } from '../../hooks/useTarotRouter';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { CHAIN_DETAILS } from '../../config/web3/chains';
import clsx from 'clsx';
import React from 'react';

const LendingPool = (): JSX.Element => {
  const { [PARAMETERS.UNISWAP_V2_PAIR_ADDRESS]: uniswapV2PairAddress, [PARAMETERS.CHAIN_ID]: poolChainIdString } = useParams<Record<string, string>>();
  const poolChainId = Number(poolChainIdString);
  const defaultChainId = useDefaultChainId();
  const { chainId } = useWeb3React<Web3Provider>();
  const currChainId = chainId || defaultChainId;
  if (poolChainId !== currChainId) {
    return (
      <>
        <div
          className={clsx(
            'p-7',
            'flex',
            'justify-center'
          )}>Please switch network to {CHAIN_DETAILS[poolChainId].chainName} to view this lending pool.
        </div>
      </>
    );
  }

  return (
    <div>
      <PairAddressContext.Provider value={uniswapV2PairAddress}>
        <LendingPoolContent />
      </PairAddressContext.Provider>
    </div>
  );
};

export default LendingPool;
