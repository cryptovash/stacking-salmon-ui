import * as React from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import Subgraph from '../subgraph';
import { CHAIN_IDS } from '../config/web3/chains';

const cache: {[chainId: number]: Subgraph} = {};
const getOrCreateSubgraph = (chainId: number) => {
  let value = cache[chainId];
  if (!value) {
    value = new Subgraph({
      chainId
    });
    cache[chainId] = value;
  }
  return value;
};

const SubgraphContext = React.createContext<SubgraphContextInterface | undefined>(undefined);

interface SubgraphProviderProps {
  children: React.ReactNode;
}

const SubgraphProvider = ({
  children
}: SubgraphProviderProps): JSX.Element => {
  const { chainId } = useWeb3React<Web3Provider>();

  const subgraph = getOrCreateSubgraph(chainId || CHAIN_IDS.FANTOM);

  return (
    <SubgraphContext.Provider value={{ subgraph }}>
      {children}
    </SubgraphContext.Provider>
  );
};

export interface SubgraphContextInterface {
  subgraph: Subgraph;
}

export {
  SubgraphContext
};

export default SubgraphProvider;