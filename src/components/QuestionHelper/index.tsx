import { useCallback, useState } from 'react';
import { HelpCircle as Question } from 'react-feather';
import './index.scss';
import Tooltip from '../Tooltip';
import { Placement } from 'react-bootstrap/esm/Overlay';
import React from 'react';

export default function QuestionHelper({ text, placement }: { text: string | JSX.Element, placement?: Placement }): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  const open = useCallback(e => {
    e.preventDefault();
    return setShow(true);
  }, [setShow]);
  const close = useCallback(() => setShow(false), [setShow]);

  return (
    <span>
      <Tooltip
        text={text}
        show={show}
        placement={placement ? placement : 'auto'}>
        <div
          className='question-wrapper text-textSecondary'
          onClick={open}
          onBlur={close}
          onMouseEnter={open}
          onMouseLeave={close}>
          <Question size={16} />
        </div>
      </Tooltip>
    </span>
  );
}