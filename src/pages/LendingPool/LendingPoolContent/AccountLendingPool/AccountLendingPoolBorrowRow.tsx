// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useContext, useState } from 'react';
import clsx from 'clsx';
import { LanguageContext } from 'contexts/LanguageProvider';
import phrases from './translations';
import { Row, Col, Button } from 'react-bootstrap';
import { PoolTokenType } from '../../../../types/interfaces';
import InlineAccountTokenInfo from './InlineAccountTokenInfo';
import RepayInteractionModal from '../../../../components/InteractionModal/RepayInteractionModal';
import { useBorrowed, useSymbol, useBorrowedUSD, useDepositedUSD } from '../../../../hooks/useData';
import { useTokenExplorerUrl, useTokenIcon, useTokenInfoUrl } from '../../../../hooks/useUrlGenerator';
import DisabledButtonHelper from '../../../../components/DisabledButtonHelper';
import BorrowInteractionModal from '../../../../components/InteractionModal/BorrowInteractionModal';
import TarotImage from '../../../../components/UI/TarotImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faCube } from '@fortawesome/free-solid-svg-icons';
import { parseNumber } from '../../../../utils/big-amount';
import usePairAddress from '../../../../hooks/usePairAddress';
import { LENDING_POOL_DETAILS_MAP } from '../../../../config/web3/contracts/lending-pools';

export default function AccountLendingPoolBorrowRow(): JSX.Element {
  const languages = useContext(LanguageContext);
  const language = languages.state.selected;
  const t = (s: string) => (phrases[s][language]);

  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()] || {};
  const poolDeactivated = poolDetails.poolDeactivated;

  const symbol = useSymbol();
  const symbolLP = useSymbol(PoolTokenType.Collateral);
  const borrowedBigAmount = useBorrowed();
  const borrowed = parseNumber(borrowedBigAmount);
  const depositedUSD = useDepositedUSD(PoolTokenType.Collateral);
  const borrowedUSD = useBorrowedUSD();
  const tokenIcon = useTokenIcon();
  const tokenInfoUrl = useTokenInfoUrl();
  const tokenExplorerUrl = useTokenExplorerUrl();

  const [showBorrowModal, toggleBorrowModal] = useState(false);
  const [showRepayModal, toggleRepayModal] = useState(false);

  const borrowDisabledInfo = `You need to deposit ${symbolLP} as collateral in order to be able to borrow ${symbol}.`;
  const repayDisabledInfo = `You haven't borrowed any ${symbol} yet.`;

  return (
    <>
      <Row className='account-lending-pool-row'>
        <Col md={3}>
          <Row className='account-lending-pool-name-icon'>
            <Col className='token-icon'>
              <TarotImage
                width={32}
                height={32}
                // TODO: could componentize
                className={clsx(
                  'inline-block'
                )}
                src={tokenIcon}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt='Token' />
            </Col>
            <Col className='token-name'>
              <div className='flex flex-col self-end'>
                <div>{symbol}</div>
                <div className='flex flex-row space-x-3 items-center text-textSecondary'>
                  <div className='hover:text-textPrimary'>
                    <a
                      target='_blank'
                      title='View on block explorer'
                      href={tokenExplorerUrl}
                      rel='noopener noreferrer'>
                      <FontAwesomeIcon icon={faCube} />
                    </a>
                  </div>
                  <div className='hover:text-textPrimary'>
                    <a
                      target='_blank'
                      title='Token Info'
                      href={tokenInfoUrl}
                      rel='noopener noreferrer'>
                      <FontAwesomeIcon icon={faChartBar} />
                    </a>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
        <Col
          md={4}
          className='inline-account-token-info-container'>
          <InlineAccountTokenInfo
            name={t('Borrowed')}
            symbol={symbol}
            value={borrowed}
            valueUSD={borrowedUSD} />
        </Col>
        <Col
          md={5}
          className='btn-table'>
          <Row>
            <Col>
              {!poolDeactivated && depositedUSD > 0 ? (
                <Button
                  variant='primary'
                  onClick={() => toggleBorrowModal(true)}>{t('Borrow')}
                </Button>
              ) : (
                <DisabledButtonHelper text={poolDeactivated ? 'Borrowing is deactivated for this pool' : borrowDisabledInfo}>{t('Borrow')}</DisabledButtonHelper>
              )}
            </Col>
            <Col>
              {borrowed > 0 ? (
                <Button
                  variant='primary'
                  onClick={() => toggleRepayModal(true)}>{t('Repay')}
                </Button>
              ) : (
                <DisabledButtonHelper text={repayDisabledInfo}>{t('Repay')}</DisabledButtonHelper>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <BorrowInteractionModal
        show={showBorrowModal}
        toggleShow={toggleBorrowModal} />
      <RepayInteractionModal
        show={showRepayModal}
        toggleShow={toggleRepayModal} />
    </>
  );
}