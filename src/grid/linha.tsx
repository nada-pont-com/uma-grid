import React, { CSSProperties } from 'react';

import { ColunaRender } from './coluna';
import type { ColunaProps, GridSelect } from './utils/type';
import { withMemo } from './utils/function';

interface Props<T, K extends Record<string, unknown>> {
  rowIdx: number;
  row: K;
  colunas: Array<ColunaProps<T, K> & T>;
  gridRowStart: number;
  select?: GridSelect;
  // gridTemplateColumns: string;
}

function Row<T, K extends Record<string, unknown>>({
  rowIdx,
  row,
  colunas,
  gridRowStart,
  select,
}: Props<T, K>) {
  const cells = [];

  for (let index = 0; index < colunas.length; index += 1) {
    const column = colunas[index];
    // eslint-disable-next-line no-unused-vars
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
      />,
    );
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
  props: Props<T, K>,
) {
  return <RowDefault<T, K> key={`linha_${key}`} {...props} />;
}
