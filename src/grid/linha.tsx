import { type CSSProperties } from 'react';
import type React from 'react';

import { ColunaGrupoRender, ColunaRender } from './coluna';
import type { Data, DescricaoRenderProps, RowRenderProps } from './utils/type';
import { withMemo } from './utils/function';

function Row<T, K extends Data>({
  rowIdx,
  row,
  colunas,
  gridRowStart,
  select,
  descricao = false,
}: RowRenderProps<T, K>) {
  const cells = [];
  const haveChildren = (row.rowIndexChildrens?.size ?? 0) > 0;
  const haveParent = row.rowIndexParent != null;

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
          hierarchy={haveChildren}
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
          hierarchy={haveChildren}
          descricao={descricao}
        />
      );
    }
  }

  return (
    <div
      className="grid-row"
      style={
        {
          '--grid-row-start': gridRowStart,
        } as unknown as CSSProperties
      }
    >
      {cells}
    </div>
  );
}

interface NoRowProps {
  gridRowStart: number;
}

function NoRowRender({ gridRowStart }: NoRowProps) {
  return (
    <div
      className="grid-row"
      style={
        {
          '--grid-row-start': gridRowStart,
        } as unknown as CSSProperties
      }
    >
      <div
        role="cell"
        aria-hidden
        className="grid-empty-cell"
        style={{
          gridColumn: '1 / -1',
        }}
      >
        <div>Sem Dados</div>
      </div>
    </div>
  );
}

const RowDefault = withMemo(Row);

export const NoRow = withMemo(NoRowRender);

export default function renderRow<T, K extends Record<string, unknown>>(
  key: React.Key,
  props: RowRenderProps<T, K>
) {
  return <RowDefault<T, K> key={`linha_${key}`} {...props} />;
}

function Descricao<T, K extends Data>({
  row,
  gridRowStart,
  colunas,
  rowIdx,
  descricaoRender,
  hide = false,
}: DescricaoRenderProps<T, K>) {
  const Tag = descricaoRender ?? (() => undefined);

  if (hide) return <div className="grid-row" />;

  return (
    <div
      className="grid-row"
      style={
        {
          '--grid-row-start': `${gridRowStart}`.split('/')[0],
          '--grid-row-end': `${gridRowStart}`.split('/')[1],
        } as unknown as CSSProperties
      }
    >
      <div role="cell" aria-hidden className="grid-cell grid-cell-descricao">
        <div aria-hidden className="grid-cell-descricao-conteudo">
          <Tag columns={colunas} row={row} rowIdx={rowIdx} />
        </div>
      </div>
    </div>
  );
}

const DescricaoDefault = withMemo(Descricao);

export function renderDescricao<T, K extends Data>(
  key: React.Key,
  props: DescricaoRenderProps<T, K>
) {
  return <DescricaoDefault<T, K> key={`linha_${key}`} {...props} />;
}
