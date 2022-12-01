import { LENDING_POOL_DETAILS_MAP } from '../../../../config/web3/contracts/lending-pools';
import usePairAddress from '../../../../hooks/usePairAddress';
import { ZERO_ADDRESS } from '../../../../utils/address';
import { AccountLendingPoolPage } from '.';

function AccountLendingPoolPageSelector({
  pageSelected,
  setPageSelected
}: AccountLendingPoolPageSelectorProps): JSX.Element {
  const lendingPoolId = usePairAddress();
  const poolDetails = LENDING_POOL_DETAILS_MAP[lendingPoolId.toLowerCase()];
  const hasFarming = poolDetails.farmingPoolAddress0 !== ZERO_ADDRESS || poolDetails.farmingPoolAddress1 !== ZERO_ADDRESS;
  return (
    <div className='account-lending-pool-page-selector'>
      {pageSelected === AccountLendingPoolPage.LEVERAGE ? (
        <div className='selected'>Borrow</div>
      ) : (
        <div onClick={() => setPageSelected(AccountLendingPoolPage.LEVERAGE)}>Borrow</div>
      )}
      {pageSelected === AccountLendingPoolPage.EARN_INTEREST ? (
        <div className='selected'>Lend</div>
      ) : (
        <div onClick={() => setPageSelected(AccountLendingPoolPage.EARN_INTEREST)}>Lend</div>
      )}
      {(hasFarming) && (
        <>
          {pageSelected === AccountLendingPoolPage.FARMING ? (
            <div className='selected'>Farm</div>
          ) : (
            <div onClick={() => setPageSelected(AccountLendingPoolPage.FARMING)}>Farm</div>
          )}
        </>
      )}
    </div>
  );
}

export interface AccountLendingPoolPageSelectorProps {
  pageSelected: AccountLendingPoolPage;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setPageSelected: Function;
}

export default AccountLendingPoolPageSelector;