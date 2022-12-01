import * as React from 'react';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';

import TarotRouter from '../tarot-router';
import useSubgraph from '../hooks/useSubgraph';
import { TarotRouterConfigInterface } from '../types/interfaces';
import usePathAccount from '../hooks/usePathAccount';
import { useInterval } from 'react-use';
import { CHAIN_IDS } from '../config/web3/chains';
import useEagerConnect from '../utils/hooks/web3/use-eager-connect';
import { useHistory } from 'react-router-dom';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/local-storage';

let cache: {[key: string]: TarotRouter} = {};
const clearRouterCache = () : void => {
  cache = {};
};
const getOrCreateRouter = (key: string, account: string, config: TarotRouterConfigInterface) => {
  let value = cache[key];
  if (!value) {
    value = new TarotRouter(config);
    if (account !== '' && config.library) {
      value.unlockWallet(config.library, account);
    }
    cache[key] = value;
  }
  return value;
};

const TarotRouterContext = React.createContext<TarotRouterContextInterface | undefined>(undefined);

let triedEagerOnce = false;

const TarotRouterProvider: React.FC = ({ children }) => {
  const pathAccount = usePathAccount();
  const {
    account,
    chainId,
    library
  } = useWeb3React<Web3Provider>();
  const history = useHistory();
  const subgraph = useSubgraph();
  const triedEager = useEagerConnect();
  const dciFromStorage = getLocalStorageItem('dci');
  const [defaultChainId, setDefaultChainId] = React.useState(dciFromStorage || CHAIN_IDS.FANTOM);
  const [providerTriedEager, setProviderTriedEager] = React.useState<boolean>(false);
  const [routerUpdate, setRouterUpdate] = React.useState<number>(0);
  const [priceInverted, setPriceInverted] = React.useState<boolean>(false);
  const [priceProgress, setPriceProgress] = React.useState<number>(0);
  const doUpdate = () => {
    if (!tarotRouter) return;
    tarotRouter.cleanCache();
    tarotRouter.subgraph.cleanCache();
    setRouterUpdate(routerUpdate + 1);
  };
  React.useEffect(() => {
    if (triedEager || triedEagerOnce) {
      triedEagerOnce = true;
      setProviderTriedEager(true);
    }
  }, [triedEager]);
  React.useEffect(() => {
    if (!tarotRouter) {
      return;
    }
    if (priceProgress === 0) {
      setPriceProgress(tarotRouter.priceProgress);
    }
    tarotRouter.subscribeProgress(() => {
      setPriceProgress(tarotRouter.priceProgress);
    });
  });
  useInterval(() => {
    if (tarotRouter && tarotRouter.isWaitingForBlock) {
      return;
    }
    doUpdate();
  }, 60000);
  const togglePriceInverted = () => {
    if (!tarotRouter) return;
    tarotRouter.setPriceInverted(!priceInverted);
    setPriceInverted(!priceInverted);
  };
  const updateDefaultChainId = (chainId: number) => {
    setLocalStorageItem('dci', chainId, -1);
    clearRouterCache();
    setDefaultChainId(chainId);
    history.push('/');
  };

  const tarotRouter = getOrCreateRouter(`${chainId || defaultChainId}-${account || ''}-${pathAccount || ''}`, account || '', {
    subgraph,
    library: library || undefined,
    chainId: chainId || defaultChainId,
    priceInverted
  });

  return (
    <TarotRouterContext.Provider
      value={{
        tarotRouter,
        routerUpdate,
        doUpdate,
        priceInverted,
        togglePriceInverted,
        priceProgress,
        providerTriedEager,
        updateDefaultChainId,
        defaultChainId
      }}>
      {children}
    </TarotRouterContext.Provider>
  );
};

export interface TarotRouterContextInterface {
  tarotRouter: TarotRouter;
  routerUpdate: number;
  // eslint-disable-next-line @typescript-eslint/ban-types
  doUpdate: Function;
  priceInverted: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  togglePriceInverted: Function;
  priceProgress: number;
  providerTriedEager: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  updateDefaultChainId: Function;
  defaultChainId: number;
}

export {
  TarotRouterContext, clearRouterCache
};

export default TarotRouterProvider;