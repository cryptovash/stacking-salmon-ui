import { ReactComponent as SpinIcon } from '../../assets/images/icons/spin.svg';
import clsx from 'clsx';
import AccountModal from '../../components/InteractionModal/AccountModal';
import ChainModal from '../../components/InteractionModal/ChainModal';
import WalletModal from '../../components/InteractionModal/WalletModal';
import TarotImage from '../../components/UI/TarotImage';
import { usePriceProgress, useProviderTriedEager } from '../../hooks/useTarotRouter';
import AppBar from '../../parts/AppBar';
import Footer from '../../parts/Footer';
import * as React from 'react';
import { AlertTriangle } from 'react-feather';
import { useMeasure } from 'react-use';
import { isTransactionRecent, useAllTransactions } from '../../store/transactions/hooks';
import { TransactionDetails } from '../../store/transactions/reducer';
import tailwindConfig from '../../tailwind.config';
import { LAYOUT } from '../../utils/constants/styles';

const Layout = ({
  children,
  className,
  ...rest
}: React.ComponentPropsWithRef<'div'>): JSX.Element => {
  const providerTriedEager = useProviderTriedEager();
  const allTransactions = useAllTransactions();
  const [accountModalOpen, setAccountModalOpen] = React.useState(false);
  const [walletModalOpen, setWalletModalOpen] = React.useState(false);
  const [chainModalOpen, setChainModalOpen] = React.useState(false);

  const sortedRecentTransactions = React.useMemo(() => {
    const transactions = Object.values(allTransactions);

    return transactions.filter(isTransactionRecent).sort(function (a: TransactionDetails, b: TransactionDetails) {
      return b.addedTime - a.addedTime;
    });
  }, [allTransactions]);
  const pendingTransactions = sortedRecentTransactions.filter(transaction => !transaction.receipt);
  const confirmedTransactions = sortedRecentTransactions.filter(transaction => transaction.receipt);

  const [ref, { height: footerHeight }] = useMeasure<HTMLDivElement>();
  const priceProgress = usePriceProgress();

  const [cardIndexes, setCardIndexes] = React.useState<number[]>([]);
  const [cardRotations, setCardRotations] = React.useState<boolean[]>([]);

  React.useEffect(() => {
    if (cardIndexes && cardIndexes.length > 0) {
      return;
    }
    const newIndexes = [];
    while (newIndexes.length < 3) {
      const r = Math.floor(Math.random() * 22) + 1;
      if (newIndexes.indexOf(r) === -1) newIndexes.push(r);
    }
    setCardIndexes(newIndexes);
  }, [cardIndexes]);

  React.useEffect(() => {
    if (cardRotations && cardRotations.length > 0) {
      return;
    }
    const newRotations = [];
    while (newRotations.length < 3) {
      const r = Math.random() < .5;
      newRotations.push(r);
    }
    setCardRotations(newRotations);
  }, [cardRotations]);

  if (priceProgress < 100) {
    return (
      <div
        className={clsx(
          'bg-tarotBlackHaze',
          'relative',
          'min-h-screen',
          'flex',
          'flex-col',
          '!overflow-hidden',
          'items-center',
          'justify-center',
          'lg:pb-40',
          'md:pb-10',
          priceProgress === 100 ? 'animate-loading-fade-out-fast' : ''
        )}>
        <div
          className={clsx(
            priceProgress > 90 ? 'animate-loading-fade-out-fast' : ''
          )}>
          <div
            className={clsx(
              priceProgress > 90 ? 'animate-loading-fade-out-fast' : ''
            )}>
            <div>Loading...</div>
            <div className='w-24 h-2 bg-tarotJade-700 border border-tarotJade-50'>
              <div
                className='h-1 bg-tarotJade-50'
                style={{
                  transitionProperty: 'all',
                  transitionDuration: '700ms',
                  width: `${priceProgress}%`
                }}>
              </div>
            </div>
          </div>
          <div className={`${priceProgress > 90 ? 'animate-cards-ping-slow-once' : ''} mt-4 h-10 flex w-24 justify-between`}>
            {cardIndexes.length === 3 && cardRotations.length === 3 &&
          <>
            <TarotImage
              className={`transform-gpu ${cardRotations[0] ? 'rotate-180' : ''}`}
              style={{
                transitionProperty: 'all',
                transitionDuration: '2500ms',
                opacity: `${priceProgress < 1 ? 0 : 100 }%`
              }}
              width={20}
              src={`/assets/images/cards/${cardIndexes[0]}.jpg`}
              alt='' />
            <TarotImage
              className={`transform-gpu ${cardRotations[1] ? 'rotate-180' : ''}`}
              style={{
                transitionProperty: 'all',
                transitionDuration: '2500ms',
                opacity: `${priceProgress < 33 ? 0 : 100 }%`
              }}
              width={20}
              src={`/assets/images/cards/${cardIndexes[1]}.jpg`}
              alt='' />
            <TarotImage
              className={`transform-gpu ${cardRotations[2] ? 'rotate-180' : ''}`}
              style={{
                transitionProperty: 'all',
                transitionDuration: '2500ms',
                opacity: `${priceProgress < 66 ? 0 : 100 }%`
              }}
              width={20}
              src={`/assets/images/cards/${cardIndexes[2]}.jpg`}
              alt='' />
          </>
            }
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        paddingTop: LAYOUT.appBarHeight
      }}
      className={clsx(
        'bg-tarotBlackHaze',
        'relative',
        'min-h-screen',
        className
      )}
      {...rest}>
      <AppBar
        accountModalOpen={accountModalOpen}
        setAccountModalOpen={setAccountModalOpen}
        setWalletModalOpen={setWalletModalOpen}
        walletModalOpen={walletModalOpen}
        setChainModalOpen={setChainModalOpen}
        appBarHeight={LAYOUT.appBarHeight}
        className={clsx(
          'fixed',
          'top-0',
          'right-0',
          'left-0',
          'max-w-7xl',
          'z-tarotAppBar',
          'mx-auto',
          'border-b'
        )}
        style={{
          borderBottomColor: tailwindConfig.theme.extend.colors.tarotBlackHaze['700']
        }} />
      {Date.now() < 0 &&
      <div className='flex flex-row justify-center'>
        <div className='flex flex-row bg-tarotJade-900 border items-center border-tarotJade-400 rounded-lg p-4 space-x-4 m-4 max-w-3xl'>
          <div>
            <AlertTriangle
              color={tailwindConfig.theme.extend.colors.tarotJade['800']}
              fill={tailwindConfig.theme.extend.colors.tarotJade['200']} />
          </div>
          <div className='text-sm text-textSecondary'></div>
        </div>
      </div>
      }
      <main
        className={clsx(
          'max-w-7xl',
          'mx-auto'
        )}
        style={{
          paddingBottom: footerHeight
        }}>
        <div
          className={clsx(
            'container',
            'mx-auto',
            'py-8',
            'sm:px-2'
          )}>
          {providerTriedEager ? children :
            <div
              className={clsx(
                'p-7',
                'flex',
                'justify-center'
              )}>
              <SpinIcon
                className={clsx(
                  'animate-spin',
                  'w-8',
                  'h-8',
                  'text-tarotJade-200',
                  'filter',
                  'brightness-150'
                )} />
            </div>
          }
        </div>
      </main>
      <Footer
        ref={ref}
        className={clsx(
          'absolute',
          'bottom-0',
          'w-full'
        )} />
      <AccountModal
        show={accountModalOpen}
        toggleShow={setAccountModalOpen}
        pending={pendingTransactions}
        confirmed={confirmedTransactions} />
      <WalletModal
        show={walletModalOpen}
        toggleShow={setWalletModalOpen} />
      <ChainModal
        show={chainModalOpen}
        toggleShow={setChainModalOpen} />
    </div>
  );
};

export default Layout;