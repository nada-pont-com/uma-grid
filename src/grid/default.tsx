import { type JSX } from 'react';
import type {
  AgregadoFunctionProps,
  ColunaCellRenderProps,
  ColunaHeaderRenderProps,
  FiltroFunctionProps,
} from './utils/type';

export function removerAcentos(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function defaultFiltro(busca: string, valor: string): boolean {
  const vl = removerAcentos(valor).toLowerCase();

  const buscas = removerAcentos(busca).toLowerCase().split(' ');

  let valido = true;

  buscas.forEach((b: string) => {
    if (valido && !vl.includes(b)) {
      valido = false;
    }
  });

  return valido;
}

export function renderDefault<T, K extends Record<string, unknown>>({
  column,
  row,
}: ColunaCellRenderProps<T, K>) {
  return (
    <div className="text-center">
      {(row as Record<string, unknown>)?.[column.key] as JSX.Element}
    </div>
  );
}

export function renderHeaderDefault<T, K extends Record<string, unknown>>({
  column,
}: ColunaHeaderRenderProps<T, K>) {
  return <div className="header text-center">{column.texto}</div>;
}

export function renderAgregadoDefault<T, K extends Record<string, unknown>>({
  agregado,
}: AgregadoFunctionProps<T, K>) {
  return (
    <div className="text-center">
      {
        Object.keys(agregado)
          .map((k) => {
            return `${k}: ${agregado[k]}`;
          })
          .join(' ') as unknown as JSX.Element
      }
    </div>
  );
}

export function filtroFunctionDefault<T, K extends Record<string, unknown>>({
  filtro,
  value,
}: FiltroFunctionProps<T, K>) {
  // console.debug(value, filtro);
  let valido = true;
  if (typeof filtro === 'string') {
    valido = defaultFiltro(filtro?.toString(), value?.toString() ?? '');
  }

  if (typeof filtro === 'number') {
    valido = defaultFiltro(filtro?.toString(), value?.toString() ?? '');
  }

  if (typeof filtro === 'object') {
    if (Array.isArray(filtro)) {
      let v = false;
      filtro.forEach((f) => {
        if (typeof f === 'object') {
          v =
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            `${value}`
              .toLowerCase()
              .includes(f.value?.toString().toLowerCase() ?? '') || v;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-base-to-string
          v = `${value}`.toLowerCase().includes(f.toLowerCase()) || v;
        }
      });
      valido = v;
    }
  }
  return valido;
}
