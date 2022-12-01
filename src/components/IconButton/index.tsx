import * as React from 'react';
import clsx from 'clsx';

import TarotButtonBase, { Props as TarotButtonBaseProps } from '../../components/UI/TarotButtonBase';
import { ReactComponent as SpinIcon } from '../../../assets/images/icons/spin.svg';

type CustomProps = {
  pending?: boolean;
}

type Ref = HTMLButtonElement;
const IconButton = React.forwardRef<Ref, Props>(({
  children,
  disabled = false,
  pending = false,
  className,
  ...rest
}, ref): JSX.Element => {
  const disabledOrPending = disabled || pending;

  return (
    <TarotButtonBase
      ref={ref}
      className={clsx(
        'focus:outline-none',
        'focus:ring',
        'focus:border-primary-300',
        'focus:ring-primary-200',
        'focus:ring-opacity-50',

        'rounded-full',
        'justify-center',
        'hover:bg-white',
        'hover:bg-opacity-10',
        'dark:hover:bg-black',
        'dark:hover:bg-opacity-5',
        className
      )}
      disabled={disabledOrPending}
      {...rest}>
      {pending ? (
        <SpinIcon
          className={clsx(
            'animate-spin',
            'w-5',
            'h-5'
          )} />
      ) : children}
    </TarotButtonBase>
  );
});
IconButton.displayName = 'IconButton';

export type Props = CustomProps & TarotButtonBaseProps;

export default IconButton;