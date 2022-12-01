import * as React from 'react';
import { Link } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import TarotJadeButtonGroup, { TarotJadeButtonGroupItem } from '../../components/button-groups/TarotJadeButtonGroup';
import shortenAddress from '../../utils/helpers/web3/shorten-address';
import {
  useAllTransactions,
  isTransactionRecent
} from '../../store/transactions/hooks';
import { TransactionDetails } from '../../store/transactions/reducer';
import {
  PAGES,
  PARAMETERS
} from '../../utils/constants/links';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import TarotImage from '../../components/UI/TarotImage';
import clsx from 'clsx';
import { CHAIN_ICON_PATHS, CHAIN_LABELS } from '../../config/web3/chains';
import useTarotRouter from '../../hooks/useTarotRouter';

interface Props {
  accountModalOpen: boolean;
  setAccountModalOpen: (arg0: boolean) => void;
  walletModalOpen: boolean;
  setWalletModalOpen: (arg0: boolean) => void;
  setChainModalOpen: (arg0: boolean) => void;
}

const ConnectedWalletInfo = ({
  setAccountModalOpen,
  walletModalOpen,
  setWalletModalOpen,
  setChainModalOpen
}: Props): JSX.Element | null => {
  const allTransactions = useAllTransactions();

  const sortedRecentTransactions = React.useMemo(() => {
    const transactions = Object.values(allTransactions);

    return transactions.filter(isTransactionRecent).sort(function (a: TransactionDetails, b: TransactionDetails) {
      return b.addedTime - a.addedTime;
    });
  }, [allTransactions]);

  const { account, active, deactivate, connector } = useWeb3React<Web3Provider>();
  const tarotRouter = useTarotRouter();
  const chainId = tarotRouter.chainId;

  const handleDisconnect = () => {
    if (!connector) {
      return;
    }
    try {
      (connector as any).close();
      return;
    } catch (e) {
      // Do nothing
    }

    try {
      deactivate();
    } catch (e) {
      // Do nothing
    }
  };

  const handleWalletModalOpen = () => {
    setWalletModalOpen(true);
  };

  const handleAccountModalOpen = () => {
    setAccountModalOpen(true);
  };

  const handleChainModalOpen = () => {
    setChainModalOpen(true);
  };

  const pendingTransactions = sortedRecentTransactions.filter(transaction => !transaction.receipt);

  return (
    <div>
      <div className='flex space-x-4'>
        <div
          className='inline-block self-center cursor-pointer'
          onClick={handleChainModalOpen}
          title='Chains'>
          <TarotImage
            width={32}
            height={32}
            className={clsx(
              'inline-block'
            )}
            src={CHAIN_ICON_PATHS[chainId || -1]}
            placeholder='/assets/images/default.png'
            error='/assets/images/default.png'
            alt={CHAIN_LABELS[chainId || -1]} />
        </div>
        {account ?
          <TarotJadeButtonGroup>
            <TarotJadeButtonGroupItem
              pending={pendingTransactions.length > 0}
              onClick={handleAccountModalOpen}>
          Transactions
            </TarotJadeButtonGroupItem>
            <TarotJadeButtonGroupItem>
              <Link to={PAGES.ACCOUNT.replace(`:${PARAMETERS.ACCOUNT}`, account)}>
                <span className='whitespace-nowrap'>{shortenAddress(account)}</span>
              </Link>
            </TarotJadeButtonGroupItem>
            {active &&
          <>
            <TarotJadeButtonGroupItem
              onClick={handleDisconnect}
              title='Disconnect'>
              <FontAwesomeIcon icon={faSignOutAlt} />
            </TarotJadeButtonGroupItem>
          </>
            }
          </TarotJadeButtonGroup> :
          <TarotJadeButtonGroup>
            <TarotJadeButtonGroupItem
              pending={walletModalOpen}
              onClick={handleWalletModalOpen}>
        Connect Wallet
            </TarotJadeButtonGroupItem>
          </TarotJadeButtonGroup>
        }
      </div>
    </div>
  );
};

export default ConnectedWalletInfo;