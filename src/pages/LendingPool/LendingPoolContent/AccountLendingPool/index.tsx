import { ReactComponent as SpinIcon } from '../../../../assets/images/icons/spin.svg';
import clsx from 'clsx';
import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { PoolTokenType } from '../../../../types/interfaces';
import AccountLendingPoolLPRow from './AccountLendingPoolLPRow';
import PoolTokenContext from '../../../../contexts/PoolToken';
import AccountLendingPoolPageSelector from './AccountLendingPoolPageSelector';
import AccountLendingPoolSupplyRow from './AccountLendingPoolSupplyRow';
import AccountLendingPoolBorrowRow from './AccountLendingPoolBorrowRow';
import AccountLendingPoolDetailsLeverage from './AccountLendingPoolDetailsLeverage';
import AccountLendingPoolDetailsEarnInterest from './AccountLendingPoolDetailsEarnInterest';
import { useDepositedUSD, useSuppliedUSD, useSymbol } from '../../../../hooks/useData';
import AccountLendingPoolFarming from './AccountLendingPoolFarming';
import './index.scss';
import React from 'react';

interface AccountLendingPoolContainerProps {
  children: any;
}

function AccountLendingPoolContainer({ children }: AccountLendingPoolContainerProps) {
  return (
    <div className='account-lending-pool lg:px-16'>
      <Card>
        <Card.Body>
          {children}
        </Card.Body>
      </Card>
    </div>
  );
}

/**
 * Generate the Account Lending Pool card, giving details about the particular user's equity in the pool.
 * @params AccountLendingPoolProps
 */

export enum AccountLendingPoolPage {
  UNINITIALIZED,
  LEVERAGE,
  EARN_INTEREST,
  FARMING,
}

export default function AccountLendingPool(): JSX.Element {
  const {
    account
  } = useWeb3React<Web3Provider>();
  const symbol = useSymbol(PoolTokenType.Collateral);

  const collateralUSD = useDepositedUSD(PoolTokenType.Collateral);
  const suppliedUSD = useSuppliedUSD();
  const [pageSelected, setPageSelected] = useState<AccountLendingPoolPage>(AccountLendingPoolPage.UNINITIALIZED);
  const actualPageSelected = pageSelected === AccountLendingPoolPage.UNINITIALIZED ?
    collateralUSD > 0 || suppliedUSD === 0 ?
      AccountLendingPoolPage.LEVERAGE :
      AccountLendingPoolPage.EARN_INTEREST :
    pageSelected;

  if (!account) {
    return (
      <></>
    );
  }

  if (!symbol) {
    return (
      <div className='flex justify-center'>
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
    );
  }

  return (
    <AccountLendingPoolContainer>
      <AccountLendingPoolPageSelector
        pageSelected={actualPageSelected}
        setPageSelected={setPageSelected} />
      {actualPageSelected === AccountLendingPoolPage.LEVERAGE && (
        <>
          <AccountLendingPoolDetailsLeverage />
          <PoolTokenContext.Provider value={PoolTokenType.Collateral}>
            <AccountLendingPoolLPRow />
          </PoolTokenContext.Provider>
          <PoolTokenContext.Provider value={PoolTokenType.BorrowableA}>
            <AccountLendingPoolBorrowRow />
          </PoolTokenContext.Provider>
          <PoolTokenContext.Provider value={PoolTokenType.BorrowableB}>
            <AccountLendingPoolBorrowRow />
          </PoolTokenContext.Provider>
        </>
      )}
      {actualPageSelected === AccountLendingPoolPage.EARN_INTEREST && (
        <>
          <AccountLendingPoolDetailsEarnInterest />
          <PoolTokenContext.Provider value={PoolTokenType.BorrowableA}>
            <AccountLendingPoolSupplyRow />
          </PoolTokenContext.Provider>
          <PoolTokenContext.Provider value={PoolTokenType.BorrowableB}>
            <AccountLendingPoolSupplyRow />
          </PoolTokenContext.Provider>
        </>
      )}
      {actualPageSelected === AccountLendingPoolPage.FARMING && (
        <>
          <AccountLendingPoolFarming />
        </>
      )}
    </AccountLendingPoolContainer>
  );
}