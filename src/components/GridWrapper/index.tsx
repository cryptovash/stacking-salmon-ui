import clsx from 'clsx';
import React from 'react';

const GridWrapper = ({
  className,
  ...rest
}: React.ComponentPropsWithRef<'div'>): JSX.Element => (
  <div
    className={clsx(
      'grid',
      'grid-cols-4',
      'gap-x-4',
      className
    )}
    {...rest} />
);

export default GridWrapper;