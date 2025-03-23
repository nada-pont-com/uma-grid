import { type CSSProperties } from 'react';
import classNames from 'classnames';

import type {
  ColunaGrupoRenderProps,
  ColunaRenderProps,
  Data,
} from './utils/type';
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

export function ColunaGrupo<T, K extends Data>({
  grupo,
  row,
  rowIdx,
  select,
  hierarchy,
  descricao,
  haveParent,
}: ColunaGrupoRenderProps<T, K>) {
  const { colunas } = grupo;
  const cells = [];

  for (let index = 0; index < colunas.length; index += 1) {
    const column = colunas[index];

    if (column.tipo === 'coluna') {
      const { idx } = column;
      // const colSpan = getColSpan(column, lastFrozenColumnIndex, { type: 'ROW', row });
      // if (colSpan !== undefined) {
      //   index += colSpan - 1;
      // }
      cells.push(
        <ColunaRender<T, K>
          key={column.key}
          column={column}
          row={row}
          idx={idx}
          rowIdx={rowIdx}
          select={select}
          haveParent={haveParent}
          hierarchy={hierarchy}
          descricao={descricao}
        />
      );
    } else {
      cells.push(
        <ColunaGrupoRender<T, K>
          key={column.key}
          grupo={column}
          row={row}
          rowIdx={rowIdx}
          select={select}
          haveParent={haveParent}
          hierarchy={hierarchy}
          descricao={descricao}
        />
      );
    }
  }

  return cells;
}

export const ColunaGrupoRender = withMemo(ColunaGrupo);

export const ColunaRender = withMemo(Coluna);
