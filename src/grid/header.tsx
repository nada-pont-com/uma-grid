import { type CSSProperties } from 'react';
import { ReactSortable } from 'react-sortablejs';
import classNames from 'classnames';

import type {
  HeaderGrupoRenderProps,
  HeaderRenderProps,
  HeadersProps,
} from './utils/type';
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

export function Grupo<T, K extends Record<string, unknown>>({
  colunas,
  grupo,
  idx,
  select,
}: HeaderGrupoRenderProps<T, K>) {
  const cells = [];

  const { key } = grupo;
  const props = { idx, headerid: key, grupoLength: colunas.length };

  for (let index = 0; index < colunas.length; index += 1) {
    const column = colunas[index];
    if (column.tipo === 'coluna') {
      // const { idx, key } = column;
      cells.push(
        <ColunaDefault<T, K>
          key={column.key}
          column={column}
          idx={column.idx}
          select={select}
        />
      );
    } else {
      const { colunas: cols } = column;
      cells.push(
        <GrupoDefault<T, K>
          key={column.key}
          colunas={cols}
          grupo={column}
          idx={column.idx}
          select={select}
        />
      );
    }
  }

  const varsCss: Record<string, unknown> = {
    '--grid-column': `${idx + 1} / ${idx + 1 + colunas.length}`,
  };

  const style: CSSProperties = {
    ...varsCss,
  };

  // if (fixa) style.insetInlineStart = `var(--grid-init-left-${idx + 1})`;

  return (
    <div
      {...props}
      role="cell"
      aria-hidden
      style={style}
      className={classNames('grid-header grid-header-grupo', {
        // 'grid-cell-fixa': fixa,
        'grid-cell-select': select?.idx === idx && select.rowIdx === -1,
        'grid-col-select': select?.idx === idx,
      })}
      onClick={() => {
        // column.selectHeader({
        //   column,
        // });
      }}
    >
      <div className="grid-header-grupo-titulo">{grupo.texto}</div>
      <div className="grid-header-grupo-colunas">{cells}</div>
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
    if (column.tipo === 'coluna') {
      const { idx, key } = column;
      cells.push(
        <ColunaDefault<T, K>
          key={key}
          column={column}
          idx={idx}
          select={select}
        />
      );
    } else {
      const { idx, key, colunas: cols } = column;
      cells.push(
        <GrupoDefault<T, K>
          key={key}
          colunas={cols}
          grupo={column}
          idx={idx}
          select={select}
        />
      );
    }
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
          console.log(
            evt.dragged.getAttribute('idx'),
            evt.related.getAttribute('idx')
          );
          updateOrdem(
            Number(evt.dragged.getAttribute('idx')),
            Number(evt.related.getAttribute('idx')),
            Number(evt.dragged.getAttribute('grupoLength') ?? 1),
            Number(evt.related.getAttribute('grupoLength') ?? 1)
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
    if (column.tipo === 'coluna') {
      const { idx, key } = column;
      cells.push(
        <ColunaDefault<T, K>
          key={key}
          column={column}
          idx={idx}
          select={select}
        />
      );
    } else {
      const { idx, key, colunas: cols } = column;
      cells.push(
        <GrupoDefault<T, K>
          key={key}
          colunas={cols}
          grupo={column}
          idx={idx}
          select={select}
        />
      );
    }
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
const GrupoDefault = withMemo(Grupo);
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
