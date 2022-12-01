import { InteractionModalContainer } from '.';
import InteractionButton from '../InteractionButton';
import { useTokenBalance } from '../../hooks/useData';
import { useWeb3React } from '@web3-react/core';
import { Web3Provider } from '@ethersproject/providers';
import { Address } from '../../types/interfaces';
import { SUPPLY_VAULTS } from '../../config/web3/contracts/supply-vault';
import { useApproveMigrate } from '../../hooks/useApprove';
import useMigrate from '../../hooks/useMigrate';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

/**
 * Props for the supply vault migration interaction modal.
 * @property show Shows or hides the modal.
 * @property toggleShow A function to update the show variable to show or hide the Modal.
 */
export interface MigrateIntoSupplyVaultModalProps {
  show: boolean;
  toggleShow(s: boolean): void;
  supplyVaultAddress: Address;
}

export default function MigrateIntoSupplyVaultModal({ show, toggleShow, supplyVaultAddress }: MigrateIntoSupplyVaultModalProps): JSX.Element {
  const { chainId } = useWeb3React<Web3Provider>();

  if (!chainId) {
    throw new Error('Invalid chain ID!');
  }
  const supplyVaultInfo = SUPPLY_VAULTS[chainId][supplyVaultAddress];
  if (!supplyVaultInfo.migrateFromAddress) {
    throw new Error('Missing migrateFromAddress');
  }
  const { amount, decimals } = useTokenBalance(supplyVaultInfo.migrateFromAddress);

  const invalidInput = amount.eq(0);
  const [approvalState, onApprove] = useApproveMigrate(amount, supplyVaultInfo.symbol, supplyVaultInfo.migrateFromAddress, invalidInput);
  const [migrateState, migrate] = useMigrate(approvalState, supplyVaultAddress, amount, decimals, invalidInput);

  const onMigrate = async () => {
    await migrate();
    toggleShow(false);
  };

  return (
    <InteractionModalContainer
      title={`Migrate ${supplyVaultInfo.symbol}`}
      show={show}
      toggleShow={toggleShow}>
      <>
        <div className='my-6 text-sm flex justify-center'>Migrate {supplyVaultInfo.symbol} into the redeployed Supply Vault.</div>
        <div className='mt-4 flex justify-between'>
          <InteractionButton
            name='Approve'
            onCall={onApprove}
            state={approvalState} />
          <InteractionButton
            name='Migrate'
            nameElement={
              <>Migrate <FontAwesomeIcon icon={faBolt} /></>
            }
            onCall={onMigrate}
            state={migrateState} />
        </div>
      </>
    </InteractionModalContainer>
  );
}