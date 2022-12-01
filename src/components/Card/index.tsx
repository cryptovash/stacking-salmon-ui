import clsx from 'clsx';
import React from 'react';

interface Props {
  isLendingPoolDetail: boolean;
}

const Card = ({
  isLendingPoolDetail = false,
  className,
  ...rest
}: Props & React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'p-6',
      'overflow-hidden',
      isLendingPoolDetail ? null : [
        'bg-tarotBlackHaze-750',
        'shadow',
        'rounded-xl',
        'border',
        'border-tarotBlackHaze-300',
        'hover:shadow-xl',
        'hover:bg-tarotBlackHaze-850',
        'md:filter',
        'md:saturate-75',
        'hover:saturate-100',
        'transition-all',
        'duration-350',
        'h-full'
      ],
      className
    )}
    {...rest} />
);

export default Card;
