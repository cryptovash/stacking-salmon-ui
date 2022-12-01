// TODO: <
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
// TODO: >

import { useContext, useState } from 'react';
import clsx from 'clsx';
import { LanguageContext } from '../../../../contexts/LanguageProvider';
import phrases from './translations';
import { Row, Col, Button } from 'react-bootstrap';
import { NO_CHANGES, PoolTokenType } from '../../../../types/interfaces';
import InlineAccountTokenInfo from './InlineAccountTokenInfo';
import DepositInteractionModal from '../../../../components/InteractionModal/DepositInteractionModal';
import LeverageInteractionModal from '../../../../components/InteractionModal/LeverageInteractionModal';
import WithdrawInteractionModal from '../../../../components/InteractionModal/WithdrawInteractionModal';
import DeleverageInteractionModal from '../../../../components/InteractionModal/DeleverageInteractionModal';
import {
  useDeposited,
  useSymbol,
  useDepositedUSD,
  useMaxDeleverage,
  useCurrentLeverage,
  useMaxWithdrawable
} from '../../../../hooks/useData';
import { useAddLiquidityUrl, usePairInfoUrl, useTokenExplorerUrl, useTokenIcon } from '../../../../hooks/useUrlGenerator';
import DisabledButtonHelper from '../../../../components/DisabledButtonHelper';
import TarotImage from 'components/UI/TarotImage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faCube, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { parseNumber } from 'utils/big-amount';
import usePairAddress from 'hooks/usePairAddress';
import { LENDING_POOL_DETAILS_MAP } from 'config/web3/contracts/lending-pools';

export default function AccountLendingPoolLPRow(): JSX.Element {
  const languages = useContext(LanguageContext);
  const language = languages.state.selected;
  const t = (s: string) => phrases[s][language];

  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()] || {};
  const poolDeactivated = poolDetails.poolDeactivated;

  const symbol = useSymbol();
  const depositedBigAmount = useDeposited();
  const deposited = parseNumber(depositedBigAmount);
  const depositedUSD = useDepositedUSD();
  const tokenIconA = useTokenIcon(PoolTokenType.BorrowableA);
  const tokenIconB = useTokenIcon(PoolTokenType.BorrowableB);
  const pairInfoUrl = usePairInfoUrl();
  const addLiquidityUrl = useAddLiquidityUrl();
  const tokenExplorerUrl = useTokenExplorerUrl();

  const [showDepositModal, toggleDepositModal] = useState(false);
  const [showWithdrawModal, toggleWithdrawModal] = useState(false);
  const [showLeverageModal, toggleLeverageModal] = useState(false);
  const [showDeleverageModal, toggleDeleverageModal] = useState(false);

  const maxWithdrawable = useMaxWithdrawable();
  const maxDeleverage = useMaxDeleverage(0);
  const currentLeverage = useCurrentLeverage(NO_CHANGES);
  const withdrawDisabledInfo = `No ${symbol} to withdraw.`;
  const leverageDisabledInfo = `You need to deposit ${symbol} first in order to leverage it.`;
  const deleverageDisabledInfo = currentLeverage > 1 ? `Due to lopsided borrow balances, you must manually repay a portion of your borrows prior to using the deleverage dialog.` : `You need to open a leveraged position in order to deleverage it.`;

  return (
    <>
      <Row className='account-lending-pool-row'>
        <Col md={3}>
          <Row className='account-lending-pool-name-icon'>
            <Col className='token-icon icon-overlapped'>
              <TarotImage
                width={32}
                height={32}
                // TODO: could componentize
                className={clsx(
                  'inline-block'
                )}
                src={tokenIconA}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt='Token A' />
              <TarotImage
                width={32}
                height={32}
                className={clsx(
                  'inline-block'
                )}
                src={tokenIconB}
                placeholder='/assets/images/default.png'
                error='/assets/images/default.png'
                alt='Token B' />
            </Col>
            <Col className='token-name'>
              <div className='flex flex-col self-end'>
                <div>{`${symbol}`}</div>
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
                      title='Pair Info'
                      href={pairInfoUrl}
                      rel='noopener noreferrer'>
                      <FontAwesomeIcon icon={faChartBar} />
                    </a>
                  </div>
                  <div className='hover:text-textPrimary'>
                    <a
                      target='_blank'
                      title='Add Liquidity'
                      href={addLiquidityUrl}
                      rel='noopener noreferrer'>
                      <FontAwesomeIcon icon={faExternalLinkAlt} />
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
            name={t('Deposited')}
            symbol='LP'
            value={deposited}
            valueUSD={depositedUSD} />
        </Col>
        <Col
          md={5}
          className='btn-table'>
          <Row>
            <Col>
              <Button
                variant='primary'
                onClick={() => toggleDepositModal(true)}>
                {t('Deposit')}
              </Button>
            </Col>
            <Col>
              {maxWithdrawable.amount.gt(0) ? (
                <Button
                  variant='primary'
                  onClick={() => toggleWithdrawModal(true)}>
                  {t('Withdraw')}
                </Button>
              ) : (
                <DisabledButtonHelper text={withdrawDisabledInfo}>
                  {t('Withdraw')}
                </DisabledButtonHelper>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              {!poolDeactivated && depositedUSD > 0 ? (
                <Button
                  variant='primary'
                  onClick={() => toggleLeverageModal(true)}>
                  {t('Leverage')}
                </Button>
              ) : (
                <DisabledButtonHelper text={poolDeactivated ? 'Leverage is deactivated for this pool' : leverageDisabledInfo}>
                  {t('Leverage')}
                </DisabledButtonHelper>
              )}
            </Col>
            <Col>
              {maxDeleverage > 0 ? (
                <Button
                  variant='primary'
                  onClick={() => toggleDeleverageModal(true)}>
                  {t('Deleverage')}
                </Button>
              ) : (
                <DisabledButtonHelper text={deleverageDisabledInfo}>
                  {t('Deleverage')}
                </DisabledButtonHelper>
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
      <LeverageInteractionModal
        show={showLeverageModal}
        toggleShow={toggleLeverageModal} />
      <DeleverageInteractionModal
        show={showDeleverageModal}
        toggleShow={toggleDeleverageModal} />
    </>
  );
}
