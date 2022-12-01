import clsx from 'clsx';
import React from 'react';

import TarotLink from '../../components/UI/TarotLink';

interface Props {
  error: Error;
  resetErrorBoundary?: () => void;
}

const handleRefresh = () => {
  window.location.reload();
};

const ErrorFallback = ({
  error,
  resetErrorBoundary
}: Props): JSX.Element => (
  <p
    className={clsx(
      'text-tarotCarnation',
      'space-x-1'
    )}>
    <span>Error: {error.message}.</span>
    <span>
      Please&nbsp;
      <TarotLink
        onClick={resetErrorBoundary ?? handleRefresh}
        className={clsx(
          'underline',
          'cursor-pointer'
        )}>
        refresh
      </TarotLink>
      .
    </span>
  </p>
);

export default ErrorFallback;