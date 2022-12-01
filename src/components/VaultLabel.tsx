import clsx from 'clsx';

import { VaultDetails } from 'config/web3/contracts/vault-details';
import { DexInfo } from 'config/web3/dexs';
import TarotImage from './UI/TarotImage';

interface VaultLabelProps {
  vaultDetails?: VaultDetails;
  dex: DexInfo;
  mobile?: boolean;
  stable: boolean;
}

const VaultLabel = ({
  vaultDetails,
  dex,
  className
}: VaultLabelProps & React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'flex',
      'flex-col',
      'flex-shrink-0',
      'items-center',
      'space-y-1.5',
      className
    )}>
    <TarotImage
      width={36}
      height={36}
      // TODO: could componentize
      className={clsx(
        'inline-block'
      )}
      src={vaultDetails ? vaultDetails.iconPath : dex.iconPath}
      placeholder='/assets/images/default.png'
      error='/assets/images/default.png'
      alt={vaultDetails ? 'Vault' : 'Exchange'} />
    <span
      className={clsx(
        'text-textPrimary',
        'font-medium'
      )}>
      {vaultDetails ? vaultDetails.vaultName : dex.dexName}
    </span>
  </div>
);

export default VaultLabel;