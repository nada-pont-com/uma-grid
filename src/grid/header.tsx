import React, { CSSProperties } from 'react';
import { ReactSortable } from 'react-sortablejs';
import classNames from 'classnames';

import type { HeaderRenderProps, HeadersProps } from './utils/type';
import isFunction, { withMemo } from './utils/function';

export function Coluna<T, K extends Record<string, unknown>>({
  column,
  idx,
  select,
}: HeaderRenderProps<T, K>) {
  const { key, fixa } = column;
  const props = { idx, headerid: key };

  const varsCss: Record<string, unknown> = {
    '--grid-column': idx + 1,
  };

  const style: CSSProperties = {
    ...varsCss,
  };

  if (fixa) style.insetInlineStart = `var(--grid-init-left-${idx + 1})`;

  const Tag = column.renderHeader;

  return (
    <div
      {...props}
      role="cell"
      aria-hidden
      style={style}
      className={classNames('grid-header', {
        'grid-cell-fixa': fixa,
        'grid-cell-select': select?.idx === idx && select.rowIdx === -1,
        'grid-col-select': select?.idx === idx,
      })}
      onClick={() => {
        column.selectHeader({
          column,
        });
      }}
    >
      <Tag column={column} />
    </div>
  );
}

function HeaderSort<T, K extends Record<string, unknown>>({
  colunas,
  updateOrdem,
  onRemoveHeader: onRemove,
  group,
  select,
}: HeadersProps<T, K>) {
  const cells = [];

  for (let index = 0; index < colunas.length; index += 1) {
    const column = colunas[index];
    const { idx, key } = column;
    cells.push(
      <ColunaDefault<T, K>
        key={key}
        column={column}
        idx={idx}
        select={select}
      />,
    );
  }

  return (
    <ReactSortable
      className="grid-row"
      style={
        {
          '--grid-row-start': 1,
        } as unknown as CSSProperties
      }
      group={
        group != null
          ? {
              name: group,
              put: false,
            }
          : undefined
      }
      list={colunas}
      setList={() => {}}
      onRemove={(evt) => {
        if (isFunction(onRemove)) onRemove(evt.item.getAttribute('headerid'));
      }}
      onMove={(evt) => {
        if (
          updateOrdem != null &&
          evt.related.classList.contains('grid-header')
        ) {
          updateOrdem(
            Number(evt.dragged.getAttribute('idx')),
            Number(evt.related.getAttribute('idx')),
          );
        }
        return true;
      }}
    >
      {cells}
    </ReactSortable>
  );
}

export default function Header<T, K extends Record<string, unknown>>({
  colunas,
  select,
}: HeadersProps<T, K>) {
  const cells = [];

  for (let index = 0; index < colunas.length; index += 1) {
    const column = colunas[index];
    const { idx, key } = column;
    cells.push(
      <ColunaDefault<T, K>
        key={key}
        column={column}
        idx={idx}
        select={select}
      />,
    );
  }

  return (
    <div
      className="grid-row"
      style={
        {
          '--grid-row-start': 1,
        } as unknown as CSSProperties
      }
    >
      {cells}
    </div>
  );
}


const HeaderDefault = withMemo(Header);
const ColunaDefault = withMemo(Coluna);
const HeaderSortDefault = withMemo(HeaderSort);

export function HeaderRender<
  T,
  K extends Record<string, unknown> = Record<string, unknown>,
>({
  colunas,
  updateOrdem,
  sort = false,
  group,
  onRemoveHeader,
  select,
}: HeadersProps<T, K>) {
  if (sort) {
    return (
      <HeaderSortDefault<T, K>
        colunas={colunas}
        updateOrdem={updateOrdem}
        group={group}
        onRemoveHeader={onRemoveHeader}
        select={select}
      />
    );
  }
  return <HeaderDefault<T, K> colunas={colunas} select={select} />;
}
