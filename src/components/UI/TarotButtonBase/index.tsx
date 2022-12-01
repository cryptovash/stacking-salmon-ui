import * as React from 'react';
import clsx from 'clsx';

interface CustomProps {
  disabled?: boolean;
}

type Ref = HTMLButtonElement;
const TarotButtonBase = React.forwardRef<Ref, Props>(({
  disabled = false,
  className,
  children,
  ...rest
}, ref): JSX.Element => (
  <button
    ref={ref}
    className={clsx(
      'select-none',
      'transition-colors',
      'inline-flex',
      'items-center',
      'text-center',
      { 'pointer-events-none': disabled },
      className
    )}
    {...rest}>
    {children}
  </button>
));
TarotButtonBase.displayName = 'InterlayButtonBase';

export type Props = CustomProps & React.ComponentPropsWithRef<'button'>;

export default TarotButtonBase;
