import clsx from 'clsx';
import React from 'react';

const Panel = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'bg-tarotBlackHaze-800',
      'overflow-hidden',
      'md:rounded',
      className
    )}
    {...rest} />
);

export default Panel;