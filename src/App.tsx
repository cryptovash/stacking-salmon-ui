import { Web3Provider } from '@ethersproject/providers';
import { setLocalStorageItem, getLocalStorageItem } from './utils/local-storage';
import { useWeb3React } from '@web3-react/core';
import { ReactComponent as TarotLogoFace } from './assets/images/icons/tarotlogoface.inline.svg';
import { ReactComponent as TarotLogoRays } from './assets/images/icons/tarotlogorays.inline.svg';
import clsx from 'clsx';
import ReactTooltip from 'react-tooltip';
import TarotJadeContainedButton from './components/buttons/TarotJadeContainedButton';
import TarotImage from './components/UI/TarotImage';
import LanguageProvider from './contexts/LanguageProvider';
import { PathAccountContext } from './contexts/PathAccountProvider';
import SubgraphProvider from './contexts/SubgraphProvider';
import TarotRouterProvider from './contexts/TarotRouterProvider';
import Account from './pages/Account';
import Boost from './pages/Boost';
import Bounty from './pages/Bounty';
import Claim from './pages/Claim';
import Home from './pages/Home';
import LendingPool from './pages/LendingPool';
import LiquidityGenerationEvent from './pages/LiquidityGenerationEvent';
import Stake from './pages/Stake';
import SupplyVaults from './pages/SupplyVaults';
import Footer from './parts/Footer';
import Layout from './parts/Layout';
import { useEffect, useState } from 'react';
import {
  Route, Switch, useLocation
} from 'react-router-dom';
import { useMeasure } from 'react-use';
import Updater from './store/transactions/updater';
import { PAGES } from './utils/constants/links';
import ScrollToTop from './utils/scroll-to-top';
import './app.scss';
import TermsModal from './components/InteractionModal/TermsModal';
import WrappedEscrowSPIRIT from './pages/WrappedEscrowSPIRIT';
import React from 'react';

const App = (): JSX.Element | null => {
  // TODO: double-check
  const { account, chainId } = useWeb3React<Web3Provider>();

  const [ref] = useMeasure<HTMLDivElement>();
  const location = useLocation();
  const [currAccount, setCurrAccount] = useState<string>();

  const [showTermsModal, toggleTermsModal] = useState(false);
  const [positiveConfirmation, setPositiveConfirmation] = useState<boolean>(false);

  const handlePositiveConfirmation = () => {
    setLocalStorageItem('pc', 'true', 60 * 60 * 24 * 30);
    setPositiveConfirmation(true);
  };

  useEffect(() => {
    if (!positiveConfirmation) {
      const pc = getLocalStorageItem('pc');
      if (pc) {
        setPositiveConfirmation(true);
      }
    }
  }, [positiveConfirmation]);

  useEffect(() => {
    if (location.pathname.startsWith('/account/')) {
      setCurrAccount(location.pathname.substring(9, 51));
    }
  }, [location]);

  return (
    <>
      {(true && !positiveConfirmation) ?
        <div
          className={clsx(
            'bg-tarotBlackHaze',
            'relative',
            'min-h-screen',
            'flex',
            'items-center',
            'justify-center',
            'lg:pb-40',
            'md:pb-10',
            'overflow-hidden'
          )}>
          <div className='opacity-0 animate-fade-in-slow-delay'>
            <div className={clsx('flex flex-col items-center self-center justify-self-center tarot-fade-in transform-gpu xl:scale-90 landscape:scale-90')}>
              <div className='logos-container flex flex-col items-center'>
                <div className='first'></div>
                <div className='logos transform-gpu scale-90 portrait:scale-100'>
                  <div className='combined'>
                    <TarotLogoRays />
                    <TarotLogoFace />
                  </div>
                </div>
                <TarotImage
                  className='tarot-text-logo mt-0 mb-2 transform-gpu scale-90'
                  width='400'
                  src='/assets/images/tarot-text-logo.png' />
                <div className={clsx('grid grid-cols-4 mt-4 justify-items-center')}>
                  <div className='text-center col-span-4 text-textPrimary text-lg md:text-xl lg:text-2xl'>Decentralized Lending</div>
                </div>
                <div className={clsx('grid grid-cols-4 portrait:mt-4 justify-items-center')}>
                  <div className='text-center p-4 col-span-4 max-w-xs text-textPrimary text-base'>By using Tarot, I accept the&nbsp;
                    <span
                      className='cursor-pointer text-tarotJade-50 hover:underline'
                      onClick={() => {
                        toggleTermsModal(true);
                      }}>Terms &amp; Conditions
                    </span>.
                  </div>
                  <div className='col-span-4 portrait:mt-2'><TarotJadeContainedButton onClick={handlePositiveConfirmation}>Accept &amp; Continue</TarotJadeContainedButton></div>
                  <TermsModal
                    show={showTermsModal}
                    toggleShow={toggleTermsModal} />
                </div>
                <div className='last'></div>
              </div>
            </div>
            <Footer
              ref={ref}
              className={clsx(
                'absolute',
                'left-0',
                'bottom-0',
                'w-full',
                'tarot-fade-in'
              )} />
          </div>
        </div> :
        <>
          <SubgraphProvider key={`${chainId}-${account}-${currAccount || account}`}>
            <PathAccountContext.Provider value={`${currAccount || account}`}>
              <TarotRouterProvider>
                <Layout>
                  <LanguageProvider>
                    {/* TODO: should fix properly */}
                    <ScrollToTop />
                    <Switch>
                      <Route path={PAGES.LENDING_POOL}>
                        <LendingPool />
                      </Route>
                      <Route path={PAGES.ACCOUNT}>
                        <Account />
                      </Route>
                      <Route path={PAGES.SUPPLY_VAULTS}>
                        <SupplyVaults />
                      </Route>
                      <Route path={PAGES.STAKE}>
                        <Stake />
                      </Route>
                      <Route path={PAGES.TINSPIRIT}>
                        <WrappedEscrowSPIRIT />
                      </Route>
                      <Route path={PAGES.BOOST}>
                        <Boost />
                      </Route>
                      <Route path={PAGES.BOUNTY}>
                        <Bounty />
                      </Route>
                      <Route path={PAGES.CLAIM}>
                        <Claim />
                      </Route>
                      <Route path={PAGES.LGE}>
                        <LiquidityGenerationEvent />
                      </Route>
                      <Route
                        path={PAGES.HOME}
                        exact>
                        <Home key={chainId} />
                      </Route>
                    </Switch>
                  </LanguageProvider>
                  <ReactTooltip
                    id='react-tooltip'
                    html={true}
                    offset={{
                      top: 8,
                      bottom: 8,
                      left: 8,
                      right: 8
                    }}
                    arrowColor='transparent'
                    effect='solid'
                    place='bottom'
                    className='w-64 react-tooltip' />
                </Layout>
              </TarotRouterProvider>
            </PathAccountContext.Provider>
          </SubgraphProvider>
          <Updater />
        </>
      }
    </>
  );
};

export default App;
