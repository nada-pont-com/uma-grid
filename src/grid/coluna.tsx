import { type CSSProperties } from 'react';
import classNames from 'classnames';

import type { ColunaRenderProps, Data } from './utils/type';
import isFunction, { withMemo } from './utils/function';

export default function Coluna<T, K extends Data>({
  column,
  idx,
  row,
  rowIdx,
  select,
  hierarchy,
  descricao,
}: ColunaRenderProps<T, K>) {
  const { fixa } = column;

  const Tag = column.render;

  // const varsCss: Record<string, unknown> = {};

  const style: CSSProperties = {
    gridColumn: `${idx + 1} / ${idx + 2}`,
    '--grid-cell-hierarchy-margin': idx === 0 && row.nivel,
  } as unknown as CSSProperties;

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
      onClick={(e) => {
        if (
          !(e.target as HTMLElement).classList.contains(
            'simple-icon-arrow-right'
          )
        ) {
          column.select({
            rowIdx,
            column,
          });
        }
      }}
    >
      {(hierarchy || descricao) && idx === 0 && (
        <div
          className={classNames('d-flex grid-cell-collapse rotate-arrow-icon', {
            collapse: row?.hierarchy || row?.hasDescricao,
          })}
          aria-hidden
          onClick={() => {
            if (
              hierarchy &&
              isFunction(row?.updateHierarchy) &&
              row?.id != null
            ) {
              row.updateHierarchy(row.id);
            }
            if (descricao && isFunction(row?.updateDescricao)) {
              row.updateDescricao();
            }
          }}
        >
          <i className="simple-icon-arrow-down d-flex" />
        </div>
      )}
      <Tag column={column} row={row} rowIdx={rowIdx} />
    </div>
  );
}

export const ColunaRender = withMemo(Coluna);
