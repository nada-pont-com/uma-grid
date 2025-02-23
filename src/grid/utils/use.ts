/* eslint-disable no-shadow */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import mousetrap from 'mousetrap';

import { delay } from './function';

import type {
  ActionKeyPress,
  AgragadoProps,
  Coluna,
  ColunaBruta,
  ColunaProps,
  FiltroActionHandler,
  FiltroValue,
  GridOrdem,
  GridSelect,
  ViewAgregadoProps,
  ViewColuna,
  ViewData,
  ViewFiltroProps,
} from './type';
import {
  filtroFunctionDefault,
  renderAgregadoDefault,
  renderDefault,
  renderHeaderDefault,
} from '../default';
import isFunction, { isNumber } from './function';

export function useGridDimensions() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [inlineSize, setInlineSize] = useState(1);
  const [blockSize, setBlockSize] = useState(1);
  const [horizontalScrollbarHeight, setHorizontalScrollbarHeight] = useState(0);

  useLayoutEffect(() => {
    if (gridRef.current != null) {
      const { clientWidth, clientHeight, offsetWidth, offsetHeight } =
        gridRef.current;
      const { width, height } = gridRef.current.getBoundingClientRect();
      const initialHorizontalScrollbarHeight = offsetHeight - clientHeight;
      const initialWidth = width - offsetWidth + clientWidth;
      const initialHeight = height - initialHorizontalScrollbarHeight;

      setInlineSize(initialWidth);
      setBlockSize(initialHeight);
      setHorizontalScrollbarHeight(initialHorizontalScrollbarHeight);
    }
  }, []);

  const onResize = useCallback(() => {
    if (gridRef.current != null) {
      const { clientWidth, clientHeight, offsetWidth, offsetHeight } =
        gridRef.current;
      const { width, height } = gridRef.current.getBoundingClientRect();
      const initialHorizontalScrollbarHeight = offsetHeight - clientHeight;
      const initialWidth = width - offsetWidth + clientWidth;
      const initialHeight = height - initialHorizontalScrollbarHeight;

      flushSync(() => {
        setInlineSize(initialWidth);
        setBlockSize(initialHeight);
        setHorizontalScrollbarHeight(initialHorizontalScrollbarHeight);
      });
    }
  }, []);

  return [
    gridRef,
    inlineSize,
    blockSize,
    horizontalScrollbarHeight,
    onResize,
  ] as const;
}

export function useViewFiltro<
  T extends Coluna<T, K> = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
>({ data, colunas, innerRef, gridOrdem }: ViewFiltroProps<T, K>) {
  const [filtroData, setFiltroData] = useState<Record<string, FiltroValue>>({});

  const { action } = useMemo(() => {
    const index = {};

    const action: FiltroActionHandler<T, K> = ({ column, value }) => {
      setFiltroData((f) => {
        return {
          ...f,
          [column.key]: value,
        };
      });
    };

    if (innerRef != null) {
      innerRef.current ??= {};
      const { current } = innerRef;

      if (current != null)
        current.filter = (k, value) => {
          const coluna = colunas.find(({ key }) => {
            return key === k;
          });
          if (coluna != null) {
            action({
              value,
              column: coluna,
            });
          }
        };
    }

    return { index, action };
  }, [data]);

  const { linhas } = useMemo(() => {
    const linhas: K[] = [];
    data.forEach((row, index) => {
      let valido = true;
      colunas.forEach((coluna) => {
        const { key, filterFunction } = coluna;
        const filtro = filtroData[key];

        if (filtro == null || filtro === '') return;

        const value = row[key] as K[keyof K];

        valido =
          filterFunction({
            coluna,
            filtro,
            key,
            row,
            value,
          }) && valido;
      });

      if (valido) linhas.push({ ...row, rowIdxOriginal: index });
    });

    return { linhas };
  }, [filtroData, data, gridOrdem]);

  const { linhasOrdenadas } = useMemo(() => {
    const linhasOrdenadas: K[] = linhas.sort((a, b) => {
      const { asc, key } = gridOrdem;

      const A = asc ? b[key] : a[key];
      const B = !asc ? b[key] : a[key];

      if (isNumber(A) && isNumber(B)) {
        return A - B;
      }
      if (typeof A === 'string' && typeof B === 'string') {
        return A.localeCompare(B);
      }
      if (typeof A === 'boolean' && typeof B === 'boolean') {
        // eslint-disable-next-line no-nested-ternary
        return A === B ? 0 : A ? -1 : 1;
      }
      if (A instanceof Date && B instanceof Date) {
        return A.getTime() - B.getTime();
      }
      return 0;
    });

    return { linhasOrdenadas };
  }, [linhas]);

  return {
    linhas: linhasOrdenadas,
    filtroData,
    filtroAction: action,
  };
}

export function useViewData<K extends Record<string, unknown>>({
  scrollTop,
  linhas,
  alturaLinha,
  totalLinhas,
  clientHeight,
}: ViewData<K>) {
  const pushCallHist = useRef<number>(0);
  const total = (totalLinhas ?? linhas.length) - 1;

  const {
    findRowIdx,
    getRowHeight,
    getRowTop,
    gridTemplateRows,
    totalLinhaAltura,
  } = useMemo(() => {
    return {
      totalLinhaAltura: alturaLinha * (total + 1),
      gridTemplateRows:
        total + 1 === 0
          ? `repeat(1, ${clientHeight}px)`
          : `repeat(${total + 1}, ${alturaLinha}px)`,
      getRowTop: (rowIdx: number) => rowIdx * alturaLinha,
      getRowHeight: () => alturaLinha,
      findRowIdx: (offset: number) => Math.floor(offset / alturaLinha),
    };
  }, [linhas, alturaLinha, clientHeight, total]);

  let rowOverscanStartIdx = 0;
  let rowOverscanEndIdx = total;
  const overscanThreshold = 4;
  const rowVisibleStartIdx = findRowIdx(scrollTop);
  const rowVisibleEndIdx = findRowIdx(scrollTop + clientHeight);
  rowOverscanStartIdx = Math.max(0, rowVisibleStartIdx - overscanThreshold);
  rowOverscanEndIdx = Math.min(total, rowVisibleEndIdx + overscanThreshold);

  const gridTemplateEndRows = useMemo(() => {
    let gridTemplateEndRows: string = '';
    if (rowVisibleEndIdx >= linhas.length && linhas.length !== 0) {
      gridTemplateEndRows = ` repeat(1, ${clientHeight - getRowTop(Math.min(rowVisibleEndIdx, total + 1))}px) `;
    }

    return gridTemplateEndRows;
  }, [linhas]);

  return {
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    totalLinhaAltura,
    gridTemplateRows,
    gridTemplateEndRows,
    pushCallHist,
    getRowTop,
    getRowHeight,
    findRowIdx,
  };
}

export function useViewColumn<
  T extends Coluna<T, K>,
  K extends Record<string, unknown> = Record<string, unknown>,
>({
  scrollLeft,
  gridWidth,
  colunasBruta,
  onSortHeader,
  alturaHeader,
  gridFilterFunction,
  gridFilter = false,
}: ViewColuna<T, K>) {
  const [select, setSelect] = useState<GridSelect>();
  const [gridOrdem, setGridOrdem] = useState<GridOrdem>({
    key: colunasBruta?.[0]?.key ?? '',
    asc: true,
  });
  const [ordem, setOrdem] = useState<boolean>();

  const { cols, updateOrdem, filtravel, gridTemplateRowHeader, fixaCount } =
    useMemo(() => {
      const colunas: Array<ColunaProps<T, K> & T> = [];
      let filtravel = gridFilter;
      let fixaCount = 0;

      colunasBruta.forEach((props) => {
        filtravel = props.filtravel || filtravel;

        const renderHeader = props.renderHeader ?? renderHeaderDefault<T, K>;
        const render = props.render ?? renderDefault<T, K>;
        const filterFunction =
          props.filterFunction ??
          gridFilterFunction ??
          filtroFunctionDefault<T, K>;

        const agregadoresRender =
          props.agregadoresRender ?? renderAgregadoDefault;

        if (props.fixa) fixaCount += 1;

        colunas.push({
          ...props,
          filtravel: props.filtravel ?? gridFilter,
          id: props.key,
          idx: 0,
          select({ column, rowIdx }) {
            setSelect({
              idx: column.idx,
              rowIdx,
            });
          },

          selectHeader({ column }) {
            setSelect({
              idx: column.idx,
              rowIdx: -1,
            });
            setGridOrdem((prev) => {
              if (column.order ?? true) {
                if (prev?.key === column.key) {
                  return { key: column.key, asc: !prev.asc };
                }
                return { key: column.key, asc: false };
              }
              return prev;
            });
          },
          render,
          renderHeader,
          filterFunction,
          agregadoresRender,
          ordenar: () => {
            console.log('Aqui');
          },
        });
      });

      colunas
        .sort((a, b) => {
          if (b.fixa && a.fixa) return 0;
          if (b.fixa) return 1;
          if (a.fixa) return -1;
          return 0;
        })
        .forEach((coluna, index) => {
          // eslint-disable-next-line no-param-reassign
          coluna.idx = index;
        });

      return {
        cols: colunas,
        filtravel,
        fixaCount,
        gridTemplateRowHeader: `repeat(1, ${alturaHeader}px) ${filtravel ? `repeat(1, ${alturaHeader - 8}px) ` : ''}`,
        updateOrdem: (oldIndex: number, newIndex: number) => {
          const d = oldIndex - newIndex < 0 ? -1 : 1;
          cols.forEach((col) => {
            if (col.idx > oldIndex && col.idx <= newIndex) {
              // eslint-disable-next-line no-param-reassign
              col.idx += d;
            }
            if (col.idx < oldIndex && col.idx >= newIndex) {
              // eslint-disable-next-line no-param-reassign
              col.idx += d;
            }
          });
          cols[oldIndex].idx = newIndex;
          setOrdem((o) => !o);
        },
      };
    }, [colunasBruta]);

  const { colunas } = useMemo(() => {
    const index = new Map<string, number>();
    const colsSort = cols
      .sort((a, b) => {
        return a.idx - b.idx;
      })
      .map((c) => {
        index.set(c.key, c.idx);
        return { ...c };
      });

    if (ordem != null && isFunction(onSortHeader))
      delay(150).then(() => onSortHeader(index));

    return {
      colunas: [...colsSort],
    };
  }, [cols, ordem]);

  const { gridTemplateColumns, colunaMedidas, gridCSSFixaCells } =
    useMemo(() => {
      const gridTemplateColumns: string[] = [];

      const gridCSSFixaCells: Record<string, string> = {};

      const colunaMedidas = new Map<
        ColunaProps<T, K>,
        { left: number; width: number }
      >();

      let left = 0;

      colunas.forEach((coluna) => {
        const { idx, fixa } = coluna;

        let width: number | string = `${coluna.width ?? '10%'}`;
        if (width.includes('px')) {
          width = Number(width.replace('px', ''));
        } else if (width.includes('%')) {
          width = (gridWidth * Number(width.replace('%', ''))) / 100;
        }

        width = Number(width);
        gridTemplateColumns.push(`${width}px`);

        colunaMedidas.set(coluna, { left, width });

        if (fixa) gridCSSFixaCells[`--grid-init-left-${idx + 1}`] = `${left}px`;

        left += width;
      });

      return {
        gridTemplateColumns,
        colunaMedidas,
        gridCSSFixaCells,
      };
    }, [gridWidth, colunas]);

  const { colOverscanStartIdx, colOverscanEndIdx } = useMemo(() => {
    let aux = false;
    let colOverscanStartIdx = 0;
    let colOverscanEndIdx = colunas.length;

    for (let i = colOverscanStartIdx; i < colOverscanEndIdx; i += 1) {
      const coluna = colunas[i];
      const medida = colunaMedidas.get(coluna);
      if (medida != null) {
        const { left, width } = medida;

        if (scrollLeft <= left + width && !aux) {
          aux = true;
          colOverscanStartIdx = i;
        }

        if (scrollLeft + gridWidth <= left) {
          colOverscanEndIdx = i;
          break;
        }
      }
    }

    colOverscanEndIdx = Math.min(colOverscanEndIdx, colunas.length);
    // colOverscanStartIdx = Math.max(colOverscanStartIdx, 0);

    return {
      colOverscanStartIdx,
      colOverscanEndIdx,
    };
  }, [colunaMedidas, colunas, gridWidth, scrollLeft]);

  const [colunasView] = useMemo(() => {
    const colunasView: Array<ColunaProps<T, K> & T> = [];
    if (fixaCount !== 0) {
      for (let i = 0; i < Math.min(fixaCount, colOverscanStartIdx); i += 1) {
        colunasView.push(colunas[i]);
      }
    }
    for (let i = colOverscanStartIdx; i < colOverscanEndIdx; i += 1) {
      colunasView.push(colunas[i]);
    }
    return [colunasView];
  }, [colOverscanStartIdx, colOverscanEndIdx, colunas]);

  return {
    colunas,
    colunasView,
    gridSelect: select,
    gridTemplateColumns,
    colOverscanStartIdx,
    colOverscanEndIdx,
    updateOrdem,
    filtravel,
    gridTemplateRowHeader,
    gridCSSFixaCells,
    gridOrdem,
  };
}

export function useViewAgregado<
  T extends Coluna<T, K>,
  K extends Record<string, unknown> = Record<string, unknown>,
>({
  colunas,
  linhas,
  colOverscanStartIdx,
  colOverscanEndIdx,
  alturaHeader,
  filtravel,
}: ViewAgregadoProps<T, K>) {
  const { agregadores, isAgregado, fixaCount } = useMemo(() => {
    const agregadores: Array<AgragadoProps<T, K> | undefined> = [];
    let fixaCount = 0;
    let isAgregado = false;

    colunas.forEach((coluna, index) => {
      const { agregadores: agrupadores, agregadoresRender, key, fixa } = coluna;

      if (agrupadores != null) {
        const agregado: Record<string, string | number> = {};
        isAgregado = true;

        Object.keys(agrupadores).forEach((k) => {
          agregado[k] = agrupadores[k]({
            colunas,
            coluna,
            rows: linhas,
          });
        });

        agregadores.push({
          agregado,
          render: agregadoresRender,
          idx: index,
          key: `agregado_${key}`,
          fixa,
        });
      } else {
        agregadores.push({
          agregado: {},
          idx: index,
          render: agregadoresRender,
          key: `agregado_${key}`,
          fixa,
        });
      }
      if (fixa) fixaCount += 1;
    });

    return {
      agregadores,
      isAgregado,
      fixaCount,
    };
  }, [colunas, linhas]);

  const [alturaAgregado, gridTemplateRowAgregado] = useMemo(() => {
    const altura: number = Math.max(linhas.length, 1) + 2 + Number(filtravel);
    return [altura, isAgregado ? ` repeat(1, ${alturaHeader}px)` : ''];
  }, [isAgregado, linhas]);

  const [agregadoresView] = useMemo(() => {
    const agregadoresView: Array<AgragadoProps<T, K> | undefined> = [];
    if (fixaCount !== 0) {
      for (let i = 0; i < Math.min(fixaCount, colOverscanStartIdx); i += 1) {
        agregadoresView.push(agregadores[i]);
      }
    }
    for (let i = colOverscanStartIdx; i < colOverscanEndIdx; i += 1) {
      agregadoresView.push(agregadores[i]);
    }
    return [agregadoresView];
  }, [colOverscanStartIdx, colOverscanEndIdx, agregadores]);

  return {
    agregadoresView,
    agregadores,
    isAgregado,
    gridTemplateRowAgregado,
    alturaAgregado,
  };
}

export function useMousetrap(handlerKey: string | string[], handlerCallback: ActionKeyPress){
  const actionRef = useRef<ActionKeyPress>(null);
  actionRef.current = handlerCallback;

  useEffect(() => {
    mousetrap.bind(handlerKey, (evt, combo) => {
      typeof actionRef.current === 'function' && actionRef.current(evt, combo);
      evt.preventDefault();
    });
    return () => {
      mousetrap.unbind(handlerKey);
    };
  }, [handlerKey]);
}
