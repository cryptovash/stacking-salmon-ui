// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useContext, useState } from 'react';
import clsx from 'clsx';
import { LanguageContext } from '../../../../contexts/LanguageProvider';
import phrases from './translations';
import { Row, Col, Button } from 'react-bootstrap';
import InlineAccountTokenInfo from './InlineAccountTokenInfo';
import DepositInteractionModal from '../../../../components/InteractionModal/DepositInteractionModal';
import { useSymbol, useDeposited, useDepositedUSD, useMaxWithdrawable } from '../../../../hooks/useData';
import { useTokenExplorerUrl, useTokenIcon, useTokenInfoUrl } from '../../../../hooks/useUrlGenerator';
import DisabledButtonHelper from '../../../../components/DisabledButtonHelper';
import WithdrawInteractionModal from '../../../../components/InteractionModal/WithdrawInteractionModal';
import TarotImage from '../../../../components/UI/TarotImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faCube } from '@fortawesome/free-solid-svg-icons';
import { parseNumber } from '../../../../utils/big-amount';
import usePairAddress from '../../../../hooks/usePairAddress';
import { LENDING_POOL_DETAILS_MAP } from '../../../../config/web3/contracts/lending-pools';

export default function AccountLendingPoolSupplyRow(): JSX.Element {
  const languages = useContext(LanguageContext);
  const language = languages.state.selected;
  const t = (s: string) => (phrases[s][language]);

  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()] || {};
  const poolDeactivated = poolDetails.poolDeactivated;

  const symbol = useSymbol();
  const depositedBigAmount = useDeposited();
  const deposited = parseNumber(depositedBigAmount);
  const depositedUSD = useDepositedUSD();
  const tokenIcon = useTokenIcon();
  const tokenInfoUrl = useTokenInfoUrl();
  const tokenExplorerUrl = useTokenExplorerUrl();

  const [showDepositModal, toggleDepositModal] = useState(false);
  const [showWithdrawModal, toggleWithdrawModal] = useState(false);

  const maxWithdrawable = useMaxWithdrawable();
  const withdrawDisabledInfo = `No ${symbol} to withdraw.`;

  return (
    <>
      <Row className='account-lending-pool-row'>
        <Col md={3}>
          <Row className='account-lending-pool-name-icon'>
            <Col className='token-icon'>
              <TarotImage
                width={32}
                height={32}
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
            name={t('Supplied')}
            symbol={symbol}
            value={deposited}
            valueUSD={depositedUSD} />
        </Col>
        <Col
          md={5}
          className='btn-table'>
          <Row>
            <Col>
              {poolDeactivated ? (
                <DisabledButtonHelper text='Supply is deactivated for this pool.'>{t('Supply')}</DisabledButtonHelper>
              ) : (
                <Button
                  variant='primary'
                  onClick={() => toggleDepositModal(true)}>{t('Supply')}
                </Button>
              )}
            </Col>
            <Col>
              {maxWithdrawable.amount.gt(0) ? (
                <Button
                  variant='primary'
                  onClick={() => toggleWithdrawModal(true)}>{t('Withdraw')}
                </Button>
              ) : (
                <DisabledButtonHelper text={withdrawDisabledInfo}>{t('Withdraw')}</DisabledButtonHelper>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
      <DepositInteractionModal
        show={showDepositModal}
        toggleShow={toggleDepositModal} />
      <WithdrawInteractionModal
        show={showWithdrawModal}
        toggleShow={toggleWithdrawModal} />
    </>
  );
}