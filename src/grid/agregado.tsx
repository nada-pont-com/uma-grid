import React, { CSSProperties } from 'react';
import classNames from 'classnames';
import type { AgregadoProps, AgregadoRenderProps } from './utils/type';
import { withMemo } from './utils/function';

export function Coluna<T, K extends Record<string, unknown>>({
  agregado,
  coluna,
  idx,
}: AgregadoRenderProps<T, K>) {
  const { key, fixa, agregado: agg } = agregado;
  const props = { idx, headerid: key };

  const varsCss: Record<string, unknown> = {
    '--grid-column': idx + 1,
  };

  const style: CSSProperties = {
    ...varsCss,
  };

  if (fixa) style.insetInlineStart = `var(--grid-init-left-${idx + 1})`;

  const Tag = agregado.render;

  return (
    <div
      {...props}
      role="cell"
      aria-hidden
      style={style}
      className={classNames('grid-agregado', { 'grid-cell-fixa': fixa })}
    >
      <Tag coluna={coluna} agregado={agg} />
    </div>
  );
}

export default function Agregado<T, K extends Record<string, unknown>>({
  agregadores,
  colunas,
  altura,
}: AgregadoProps<T, K>) {
  const cells = [];

  for (let index = 0; index < agregadores.length; index += 1) {
    const agregado = agregadores[index];
    if (agregado != null) {
      const coluna = colunas[index];
      const { idx, key } = agregado;
      cells.push(
        <ColunaDefault<T, K>
          key={key}
          agregado={agregado}
          idx={idx}
          coluna={coluna}
        />,
      );
    }
  }

  return (
    <div
      className="grid-row"
      style={
        {
          '--grid-row-start': altura,
        } as unknown as CSSProperties
      }
    >
      {cells}
    </div>
  );
}

const AgregadoDefault = withMemo(Agregado);
const ColunaDefault = withMemo(Coluna);

export function AgregadoRender<
  T,
  K extends Record<string, unknown> = Record<string, unknown>,
>({ agregadores, colunas, altura }: AgregadoProps<T, K>) {
  return (
    <AgregadoDefault<T, K>
      colunas={colunas}
      agregadores={agregadores}
      altura={altura}
    />
  );
}
