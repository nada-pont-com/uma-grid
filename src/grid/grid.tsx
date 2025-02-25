import React, { CSSProperties, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

import classNames from 'classnames';

import ElementResizeListener from './utils/resize';

import {
  useGridDimensions,
  useViewAgregado,
  useViewColumn,
  useViewData,
  useViewFiltro,
  useCopy,
  useSelect,
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
  data: dados = [],
  colunas: cols = [],
  alturaLinha = 36,
  alturaHeader = 48,
  sort,
  grupoSort,
  className,
  sourceData,
  onSelect,
  onSelectCell,
  onSelectRow,
  onRemoveHeader,
  onSortHeader,
  filterFunction,
  innerRef,
}: GridProps<T, K>) {
  const [data, setData] = useState(dados);
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

  useEffect(() => {
    if (dados.length > 0) setData(dados);
  }, [dados]);

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
    totalLinhas: sourceData?.totalLinhas,
  });

  useSelect({
    colunas,
    data,
    gridSelect,
    onSelect,
    onSelectCell,
    onSelectRow,
  });

  useCopy({ colunas, data, gridSelect });

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
        })
      );
    }

    return elements;
  };

  const noDataRenderView = () => {
    if (linhas.length > 0) return undefined;
    const gridRowStart = 2 + (filtravel ? 1 : 0);

    return <NoRow gridRowStart={gridRowStart} />;
  };

  /* 
    Tudo particionado
    interno 
      load - total
      load - parcial
    externo
  */

  useEffect(() => {
    let montado = true;
    async function dataPush() {
      if (sourceData != null) {
        const {
          tipo,
          dataPush,
          onPush,
          tamanhoPage,
          totalPush,
          pagesStart,
          totalLinhas,
        } = sourceData;

        if (tipo == 'total' && isFunction(dataPush)) {
          setLoading(true);
          const data = await dataPush();
          if (montado) {
            setData(data);
            setLoading(false);
          }
        } else if (
          tipo == 'page' &&
          tamanhoPage != null &&
          isFunction(totalPush) &&
          isFunction(dataPush)
        ) {
          setLoading(true);

          const total = await totalPush();
          setData(new Array(total));

          pushCallHist.current = 0;

          const startPage: number =
            (pagesStart ?? 0) > 0 ? Number(pagesStart) : total / tamanhoPage;

          pushCallHist.current = startPage;
          const max = total / tamanhoPage;
          for (let i = 0; i < Math.min(startPage, max); i++) {
            if (montado) break;
            const start = i * tamanhoPage;
            const end = (i + 1) * tamanhoPage;
            const dt = await dataPush(start, end);
            setData((data) => {
              data.splice(start, tamanhoPage, ...dt);
              return [...data];
            });
          }

          if (montado) setLoading(false);
        } else if (isFunction(onPush) && tamanhoPage != null) {
          pushCallHist.current = 0;

          const total = totalLinhas ?? dados.length;

          const startPage: number =
            (pagesStart ?? 0) > 0 ? Number(pagesStart) : total / tamanhoPage;

          pushCallHist.current = startPage;
          const max = total / tamanhoPage;
          for (let i = 0; i < Math.min(startPage, max); i++) {
            if (montado) break;
            const start = i * tamanhoPage;
            const end = (i + 1) * tamanhoPage;
            await onPush(start, end);
          }
        }
      }
    }
    dataPush();
    return () => {
      montado = false;
    };
  }, []);

  useEffect(() => {
    if (rowOverscanStartIdx == 0) return;
    let montado = true;

    async function dataPush() {
      if (sourceData != null) {
        const { tipo, dataPush, onPush, tamanhoPage, totalPush, totalLinhas } =
          sourceData;

        if (tipo == 'total') return;

        if (
          tipo == 'page' &&
          tamanhoPage != null &&
          isFunction(totalPush) &&
          isFunction(dataPush)
        ) {
          const total = data.length;
          const index = pushCallHist.current;
          const max = total / tamanhoPage;

          const atual = Math.ceil(rowOverscanEndIdx / tamanhoPage);

          if (index >= max || index <= atual) {
            return;
          }

          setLoading(true);
          if (montado)
            for (let i = index; i < Math.min(atual, max); i++) {
              if (montado) break;
              pushCallHist.current = i + 1;
              const start = i * tamanhoPage;
              const end = (i + 1) * tamanhoPage;
              const dt = await dataPush(start, end);
              setData((data) => {
                data.splice(start, tamanhoPage, ...dt);
                return [...data];
              });
            }
          if (montado) setLoading(false);
        } else if (isFunction(onPush) && tamanhoPage != null) {
          const total = totalLinhas ?? dados.length;

          const index = pushCallHist.current;
          const max = total / tamanhoPage;

          const atual = Math.ceil(rowOverscanEndIdx / tamanhoPage);

          if (index >= max || index <= atual) {
            return;
          }
          setLoading(true);

          if (montado)
            for (let i = index; i < Math.min(atual, max); i++) {
              if (montado) break;
              pushCallHist.current = i + 1;
              const start = i * tamanhoPage;
              const end = (i + 1) * tamanhoPage;
              await onPush(start, end);
            }
          if (montado) setLoading(false);
        }
      }
    }
    dataPush();

    return () => {
      montado = false;
    };
  }, [rowOverscanStartIdx, rowOverscanEndIdx]);

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
