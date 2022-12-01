import { Placement } from '@popperjs/core';
import ReactTooltip from 'react-tooltip';
import { useEffectOnce } from 'react-use';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

interface TooltipProps {
  text: string | JSX.Element
  show: boolean | string | undefined
  children: React.ReactNode
  placement?: Placement
}

export default function Tooltip({ text, ...rest }: TooltipProps): JSX.Element {
  useEffectOnce(() => {
    ReactTooltip.rebuild();
  });
  rest.show = undefined;
  if (typeof text === 'string') {
    text = <span>{text}</span>;
  }
  return (
    <div
      data-for='react-tooltip'
      className='inline-block'
      data-tip={renderToStaticMarkup(text)}>
      {rest.children}
    </div>
  );
}
