import * as React from 'react';
import { ReactElement } from 'react';
import IconButton from '../../components/IconButton';
import clsx from 'clsx';
import TarotModal, {
  TarotModalInnerWrapper,
  TarotModalTitle
} from '../../components/UI/TarotModal';
import { ReactComponent as CloseIcon } from '../../assets/images/icons/close.svg';

import './index.scss';

interface InteractionModalContainerProps {
  title: string;
  children: ReactElement;
  show: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  toggleShow: Function;
}

export function InteractionModalContainer({ title, show, toggleShow, children }: InteractionModalContainerProps): JSX.Element {
  const closeIconRef = React.useRef(null);
  return (
    <TarotModal
      initialFocus={closeIconRef}
      open={show}
      onClose={() => toggleShow(false)}>
      <TarotModalInnerWrapper
        className={clsx(
          'p-6',
          'max-w-lg'
        )}>
        <TarotModalTitle
          as='h3'
          className={clsx(
            'text-lg',
            'font-semibold'
          )}>
          {title}
        </TarotModalTitle>
        <IconButton
          className={clsx(
            'w-12',
            'h-12',
            'absolute',
            'top-3',
            'right-3'
          )}
          onClick={() => toggleShow(false)}>
          <CloseIcon
            ref={closeIconRef}
            width={18}
            height={18}
            className='text-textSecondary' />
        </IconButton>
        <div className='mt-4'>
          {children}
        </div>
      </TarotModalInnerWrapper>
    </TarotModal>
  );
}