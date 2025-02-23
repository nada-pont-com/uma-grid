import React, { CSSProperties, memo } from 'react';
import classNames from 'classnames';

import type { ColunaRenderProps } from './utils/type';

export default function Coluna<T, K extends Record<string, unknown>>({
  column,
  idx,
  row,
  rowIdx,
  select,
}: ColunaRenderProps<T, K>) {
  const { fixa } = column;

  const Tag = column.render;

  // const varsCss: Record<string, unknown> = {};

  const style: CSSProperties = {
    gridColumn: `${idx + 1} / ${idx + 2}`,
  };

  if (fixa) style.insetInlineStart = `var(--grid-init-left-${idx + 1})`;

  return (
    <div
      role="cell"
      aria-hidden
      className={classNames('grid-cell', {
        'grid-cell-fixa': fixa,
        'grid-cell-select': select?.idx === idx && select.rowIdx === rowIdx,
        'grid-col-select': select?.idx === idx,
      })}
      style={style}
      onClick={() => {
        column.select({
          rowIdx,
          column,
        });
      }}
    >
      <Tag column={column} row={row} rowIdx={rowIdx} />
    </div>
  );
}

export const ColunaRender = memo(Coluna) as typeof Coluna;
