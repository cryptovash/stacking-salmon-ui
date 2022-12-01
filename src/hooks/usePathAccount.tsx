import { useContext } from 'react';
import { PathAccountContext } from '../contexts/PathAccountProvider';

export default function usePathAccount() {
  const pathAccount = useContext(PathAccountContext);
  return pathAccount;
}