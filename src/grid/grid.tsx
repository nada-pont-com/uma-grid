import React, { CSSProperties, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import copy from 'copy-to-clipboard';
import classNames from 'classnames';

import ElementResizeListener from './utils/resize';

import {
  useGridDimensions,
  useViewAgregado,
  useViewColumn,
  useViewData,
  useViewFiltro,
  useMousetrap,
} from './utils/use';
import renderRow, { NoRow } from './linha';
import { HeaderRender } from './header';
import type { Coluna, ColunaBruta, GridProps } from './utils/type';
import isFunction from './utils/function';
import Filtros from './filtro';

import { AgregadoRender } from './agregado';
import Loading from './utils/loading';

import './grid.scss';

export default function Grid<
  T extends Coluna<T, K> = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
>({
  data = [],
  colunas: cols = [],
  alturaLinha = 36,
  alturaHeader = 48,
  sort,
  grupoSort,
  className,
  totalLinhas,
  pushSize = 100,
  pushSizeCache = 0,
  onSelect,
  onSelectCell,
  onSelectRow,
  onRemoveHeader,
  onSortHeader,
  filterFunction,
  onDataPush,
  innerRef,
}: GridProps<T, K>) {
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [loading, setLoading] = useState(false);

  const [refGrid, gridWidth, gridHeight, , onResize] = useGridDimensions();

  const handleScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    // eslint-disable-next-line no-shadow
    const { scrollTop, scrollLeft } = event.currentTarget;
    flushSync(() => {
      setScrollTop(scrollTop);
      setScrollLeft(scrollLeft);
    });
  };

  const {
    gridTemplateColumns,
    colunasView,
    gridSelect,
    colunas,
    updateOrdem,
    filtravel,
    gridTemplateRowHeader,
    colOverscanEndIdx,
    colOverscanStartIdx,
    gridOrdem,
  } = useViewColumn<T, K>({
    colunasBruta: cols,
    gridWidth,
    scrollLeft,
    onSortHeader,
    alturaHeader,
    gridFilterFunction: filterFunction,
  });

  const { filtroAction, linhas } = useViewFiltro<T, K>({
    data,
    colunas,
    innerRef,
    gridOrdem,
  });

  const {
    agregadoresView,
    isAgregado,
    gridTemplateRowAgregado,
    alturaAgregado,
  } = useViewAgregado({
    colunas,
    linhas,
    colOverscanEndIdx,
    colOverscanStartIdx,
    alturaHeader,
    filtravel,
  });

  const headerHeight = alturaHeader + (isAgregado ? alturaHeader : 0);
  const filtroHeight = filtravel ? alturaHeader - 8 : 0;
  const clientHeight = gridHeight - headerHeight - filtroHeight;

  const {
    rowOverscanEndIdx,
    rowOverscanStartIdx,
    gridTemplateRows,
    gridTemplateEndRows,
    pushCallHist,
  } = useViewData({
    alturaLinha,
    clientHeight,
    linhas,
    scrollTop,
    totalLinhas,
  });

  const rowRenderView = () => {
    const elements: React.ReactNode[] = [];

    const startRowIdx = rowOverscanStartIdx;
    const endRowIdx = rowOverscanEndIdx;

    for (
      let viewportRowIdx = startRowIdx;
      viewportRowIdx <= endRowIdx;
      viewportRowIdx += 1
    ) {
      const rowIdx = viewportRowIdx;
      const key = rowIdx;

      const row = linhas[rowIdx];
      const gridRowStart = rowIdx + 2 + (filtravel ? 1 : 0);

      elements.push(
        renderRow(key, {
          rowIdx,
          row,
          colunas: colunasView,
          gridRowStart,
          select: gridSelect,
        }),
      );
    }

    return elements;
  };

  const noDataRenderView = () => {
    if (linhas.length > 0) return undefined;
    const gridRowStart = 2 + (filtravel ? 1 : 0);

    return <NoRow gridRowStart={gridRowStart} />;
  };

  useMousetrap(['ctrl+c', 'command+c'], () => {
    const valor = window.getSelection()?.toString() ?? '';
    if (valor !== '') {
      copy(valor);
      return;
    }
    if (gridSelect != null) {
      const { idx, rowIdx } = gridSelect;
      if (rowIdx !== -1) {
        const d = data[rowIdx][colunas[idx].key];
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const dt = `${d ?? ''}`;
        copy(dt);
      } else {
        copy(colunas[idx].texto);
      }
    }
  });

  useEffect(() => {
    if (gridSelect != null) {
      const { idx, rowIdx } = gridSelect;

      const column = colunas[idx];
      if (isFunction(onSelect)) {
        onSelect({
          column,
          columns: colunas,
          rowIdx,
          data: data[rowIdx]?.[column.key] as K[keyof K] | undefined,
          rowData: data[rowIdx],
        });
      }
      if (rowIdx !== -1) {
        if (isFunction(onSelectCell)) {
          onSelectCell({
            column,
            rowIdx,
            data: data[rowIdx]?.[column.key] as K[keyof K] | undefined,
          });
        }
        if (isFunction(onSelectRow)) {
          onSelectRow({
            columns: colunas,
            rowIdx,
            rowData: data[rowIdx],
          });
        }
      }
    }
  }, [gridSelect]);

  useEffect(() => {
    let montado = true;
    async function dataPush() {
      if (isFunction(onDataPush)) {
        const last = pushCallHist.current;
        const max = (totalLinhas ?? 0) / pushSize;
        const index = data.filter((v) => v !== undefined).length / pushSize;
        const atual = Math.ceil(rowOverscanEndIdx / pushSize);
        if (index >= max) {
          setLoading(false);
          return;
        }
        setLoading(true);
        if (pushSizeCache === 0) {
          if (index < atual && last < atual) {
            if (montado)
              for (let i = Math.max(index, last); i < atual; i += 1) {
                if (!montado) break;

                // eslint-disable-next-line no-await-in-loop
                await onDataPush(i * pushSize, (i + 1) * pushSize);
              }
            if (montado) {
              pushCallHist.current = atual;
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        } else {
          const limite = Math.min(atual + pushSizeCache, max);

          if (index < limite && last < limite) {
            for (let i = Math.max(index, last); i < limite; i += 1) {
              if (!montado) break;

              if (pushCallHist.current < i + 1) {
                pushCallHist.current = i + 1;
                // eslint-disable-next-line no-await-in-loop
                await onDataPush(i * pushSize, (i + 1) * pushSize);
              }
            }
            if (montado) setLoading(false);
          } else {
            setLoading(false);
          }
        }
      }
    }
    dataPush();
    return () => {
      montado = false;
    };
  }, [rowOverscanStartIdx, rowOverscanEndIdx]);

  console.log('loading', loading);

  const altura =
    gridTemplateEndRows !== '' ? alturaAgregado + 1 : alturaAgregado;

  return (
    <div
      ref={refGrid}
      style={
        {
          gridTemplateRows:
            gridTemplateRowHeader +
            gridTemplateRows +
            gridTemplateEndRows +
            gridTemplateRowAgregado,
          gridTemplateColumns: gridTemplateColumns.join(' '),
          '--grid-scroll-left': scrollLeft,
          '--grid-header-height': alturaHeader,
          '--grid-height': clientHeight,
        } as unknown as CSSProperties
      }
      onScroll={handleScroll}
      className={classNames('grid-table', className)}
    >
      <ElementResizeListener onResize={onResize} />
      <Loading altura={altura} loading={loading} />
      <HeaderRender<T, K>
        colunas={colunasView}
        sort={sort}
        updateOrdem={updateOrdem}
        onRemoveHeader={onRemoveHeader}
        group={grupoSort}
        select={gridSelect}
      />
      {filtravel && (
        <Filtros<T, K> action={filtroAction} colunas={colunasView} />
      )}
      {rowRenderView()}
      {noDataRenderView()}
      {isAgregado && (
        <AgregadoRender<T, K>
          agregadores={agregadoresView}
          colunas={colunas}
          altura={altura}
        />
      )}
    </div>
  );
}
