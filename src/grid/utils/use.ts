/* eslint-disable no-shadow */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import mousetrap from 'mousetrap';

import copy from 'copy-to-clipboard';
import isFunction, { delay, isNumber } from './function';

import type {
  ActionKeyPress,
  AgragadoProps,
  Coluna,
  ColunaBruta,
  ColunaGrupoProps,
  ColunaProps,
  Data,
  FiltroActionHandler,
  FiltroValue,
  GridNivelType,
  GridOrdem,
  GridSelect,
  useCopyProps,
  useSelectProps,
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
  K extends Data = Data,
>({
  data,
  colunas,
  innerRef,
  gridOrdem,
  hierarchy,
  descricao = false,
  alturaDescricao = 1,
}: ViewFiltroProps<T, K>) {
  const [filtroData, setFiltroData] = useState<Record<string, FiltroValue>>({});
  const [updateData, setUpdateData] = useState<boolean>(false);

  const hideChildrenList = useRef<Set<number | string>>(new Set());

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

  const {
    parentIndexById,
    parentIdByRoot,
    parentToChild,
    childToParent,
    buildChildToRoot,
  } = useMemo(() => {
    const parentIndexById: Record<string | number, number> = {};
    const parentIdByRoot: Record<number | string, Set<string | number>> = {};
    const parentToChild: Record<string, Set<number>> = {};
    const childToParent: Record<string | number, string | number> = {};

    if (hierarchy) {
      data.forEach((row, index) => {
        const { root, id } = row ?? {};
        if (id == null) {
          return;
        }

        if (root != null) {
          parentToChild[root] ??= new Set();

          parentToChild[root].add(index);

          childToParent[id] = root;
          parentIdByRoot[root] ??= new Set();
          parentIdByRoot[root].add(id);
        }

        parentIndexById[id] = index;
      });
    }

    const buildChildToRoot = (
      id: string | number | undefined | null
    ): Array<string | number> => {
      if (id == null) {
        return [];
      }
      const parentId = childToParent[id];

      if (parentId == null) return [id];

      const list = buildChildToRoot(parentId);
      list.push(id);

      return list;
    };

    return {
      parentIndexById,
      parentIdByRoot,
      parentToChild,
      childToParent,
      buildChildToRoot,
    };
  }, [data, data.length]);

  const nivelById = useMemo(() => {
    const obj: Record<number | string, Partial<GridNivelType>> = {};
    Object.keys(parentToChild).forEach((id) => {
      const filhos = parentIdByRoot[id]; // verrifica se tem filho
      const pai = childToParent[id]; // verrifica se tem pai

      let objPai: Partial<GridNivelType> | null = null;

      if (pai != null) {
        obj[pai] ??= { nivel: 0 };
        objPai = obj[pai];
      }

      const nivel = pai == null ? 0 : (objPai?.nivel ?? 0) + 1;

      filhos?.forEach((filho) => {
        obj[filho] ??= { nivel: nivel + 1, pai: id };
        const objFilho = obj[filho];
        objFilho.nivel = nivel + 1;
      });

      obj[id] ??= {};
      obj[id].pai = pai;
      obj[id].nivel = nivel;
    });
    return obj;
  }, [parentIdByRoot, childToParent]);

  const { linhas, length } = useMemo(() => {
    const linhas: K[] = [];
    let length = 0;

    data.forEach((row, index) => {
      let valido = true;
      colunas.forEach((coluna) => {
        const { key, filterFunction } = coluna;
        const filtro = filtroData[key];

        if (filtro == null || filtro === '') return;

        // if (row == null || !(key in row) || row[key] == null) return;
        // if (row[key] == null) return;

        const value = row?.[key] as K[keyof K];

        valido =
          filterFunction({
            coluna,
            filtro,
            key,
            row,
            value,
          }) && valido;
      });

      if (valido) {
        length += 1;

        const linhaData: K = {
          ...row,
          rowIdxOriginal: index,
        };

        if (hierarchy) {
          if (hideChildrenList.current.size > 0) {
            const allParents = buildChildToRoot(row?.root);

            if (allParents.some((item) => hideChildrenList.current.has(item))) {
              length -= 1;
              return;
            }
          }

          linhaData.updateHierarchy = function updateHierarchy() {
            if (row.id == null) {
              return;
            }
            // eslint-disable-next-line no-param-reassign
            row.hierarchy = !this?.hierarchy;
            if (hideChildrenList.current.has(row.id)) {
              hideChildrenList.current.delete(row.id);
            } else {
              hideChildrenList.current.add(row.id);
            }
            setUpdateData((u) => !u);
          };

          if (row.id != null) {
            linhaData.nivel = nivelById[row.id]?.nivel;
            linhaData.rowIndexChildrens = parentToChild[row.id];
          }
          if (row.root != null) {
            linhaData.rowIndexParent = parentIndexById[row.root];
          }
        }

        if (descricao) {
          linhaData.updateDescricao = function updateDescricao() {
            // eslint-disable-next-line no-param-reassign
            row.hasDescricao = !this?.hasDescricao;
            setUpdateData((u) => !u);
          };

          if (row?.hasDescricao) {
            length += alturaDescricao;
          }
        }

        linhas.push(linhaData);
      }
    });

    return {
      linhas,
      length,
    };
  }, [filtroData, data, gridOrdem, updateData]);

  const { linhasOrdenadas } = useMemo(() => {
    const dataByHierarchy = (
      rootA: string | number | undefined | null,
      rootB: string | number | undefined | null,
      dados: K
    ) => {
      if (hierarchy && rootA != null && rootA !== rootB && dados.id !== rootB) {
        const item = data[parentIndexById[rootA]];
        if (item.root != null) {
          return dataByHierarchy(item.root, rootB, item);
        }
        return item;
      }

      return dados;
    };

    const linhasOrdenadas: K[] = linhas.sort((a, b) => {
      const { asc, key, ordem } = gridOrdem;

      const dataA = dataByHierarchy(a.root, b.root, a);
      const dataB = dataByHierarchy(b.root, a.root, b);

      const A = asc ? dataB[key] : dataA[key];
      const B = asc ? dataA[key] : dataB[key];

      if (hierarchy) {
        if (a.id !== dataA.id && dataA.id === dataB.id) {
          return 1;
        }

        if (b.id !== dataB.id && dataA.id === dataB.id) {
          return -1;
        }

        if (dataA[key] === dataB[key]) {
          return asc
            ? parentIndexById[dataB.id ?? ''] - parentIndexById[dataA.id ?? '']
            : parentIndexById[dataA.id ?? ''] - parentIndexById[dataB.id ?? ''];
        }
      }

      if (isFunction(ordem)) {
        return ordem({
          asc,
          key,
          a: dataA,
          b: dataB,
        });
      }

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

  const { descricaoAcumuladoByIndex, descricaoIndexByAcumulado } =
    useMemo(() => {
      let acumuloIndex = 0;
      let acumulo = 0;
      const descricaoIndexByAcumulado: Record<number, number> = {};
      const descricaoAcumuladoByIndex: Record<number, number> = {};
      if (descricao && linhas.length !== length) {
        linhasOrdenadas.forEach(({ hasDescricao }, index) => {
          descricaoIndexByAcumulado[acumuloIndex] = index;
          descricaoAcumuladoByIndex[index] = acumulo;

          if (hasDescricao) {
            for (let i = 1; i <= alturaDescricao; i += 1) {
              descricaoIndexByAcumulado[acumuloIndex + i] = index;
            }
            acumulo += alturaDescricao;
            acumuloIndex += alturaDescricao;
          }
          acumuloIndex += 1;
        });
      }
      return { descricaoAcumuladoByIndex, descricaoIndexByAcumulado };
    }, [linhasOrdenadas]);

  return {
    linhas: linhasOrdenadas,
    parentToChild,
    filtroData,
    filtroAction: action,
    descricaoAcumuladoByIndex,
    descricaoIndexByAcumulado,
    length,
  };
}

export function useViewData<K extends Data>({
  scrollTop,
  linhas,
  alturaLinha,
  totalLinhas,
  clientHeight,
  descricao,
  length = 0,
  descricaoAcumuladoByIndex = {},
  descricaoIndexByAcumulado = {},
}: ViewData<K>) {
  const pushCallHist = useRef<number>(0);
  const total = (totalLinhas ?? linhas.length) - 1;

  const gridTemplateRowsExtra = useMemo(() => {
    if (descricao) {
      let template = '';
      const totalItens = total + 1;
      const quantidade = length - totalItens;

      if (quantidade !== 0 && length !== 0) {
        template = `repeat(${quantidade}, ${alturaLinha}px)`;
      }
      return { default: `repeat(${totalItens}, ${0}px) `, template };
    }
    return { default: '', template: '' };
  }, [length, total]);

  const {
    findRowIdx,
    getRowHeight,
    getRowTop,
    gridTemplateRows,
    totalLinhaAltura,
  } = useMemo(() => {
    return {
      totalLinhaAltura: alturaLinha * (total + 1),
      gridTemplateRows: `${
        total + 1 === 0
          ? `repeat(1, ${clientHeight}px)`
          : `repeat(${total + 1}, ${alturaLinha}px)`
      } ${gridTemplateRowsExtra.template}`,
      getRowTop: (rowIdx: number) => rowIdx * alturaLinha,
      getRowHeight: () => alturaLinha,
      findRowIdx: (offset: number) => Math.floor(offset / alturaLinha),
    };
  }, [
    linhas.length,
    alturaLinha,
    clientHeight,
    total,
    gridTemplateRowsExtra.template,
  ]);

  let rowOverscanStartIdx = 0;
  let rowOverscanEndIdx = total;
  const overscanThreshold = 4;
  const rowVisibleStartIdx = findRowIdx(scrollTop);

  const rowVisibleEndIdx = findRowIdx(scrollTop + clientHeight);
  rowOverscanStartIdx = Math.min(
    total + 1,
    Math.max(0, rowVisibleStartIdx - overscanThreshold)
  );

  let descricaoDeslocamentoAcumulado = 0;

  const descricaoDeslocamentoAcumuladoIndex =
    descricaoIndexByAcumulado[rowOverscanStartIdx];

  if (descricaoDeslocamentoAcumuladoIndex != null) {
    rowOverscanStartIdx = Math.max(
      0,
      descricaoDeslocamentoAcumuladoIndex - overscanThreshold
    );

    descricaoDeslocamentoAcumulado =
      descricaoAcumuladoByIndex[rowOverscanStartIdx];
  }

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
    gridTemplateRowsExtra,
    descricaoDeslocamentoAcumulado,
  };
}

export function useViewColumn<T extends Coluna<T, K>, K extends Data = Data>({
  scrollLeft,
  gridWidth,
  grupos,
  colunasBruta,
  onSortHeader,
  alturaHeader,
  alturaGrupo,
  gridOrdemDefault,
  gridFilterFunction,
  gridFilter = false,
}: ViewColuna<T, K>) {
  const [select, setSelect] = useState<GridSelect>();
  const [gridOrdem, setGridOrdem] = useState<GridOrdem<K>>(
    gridOrdemDefault ?? {
      key: colunasBruta?.[0]?.key ?? '',
      asc: true,
      ordem: colunasBruta?.[0]?.orderFunction,
    }
  );
  const [ordem, setOrdem] = useState<boolean>();

  const grupoIndex = useMemo(() => {
    const grupoIndex: Record<string, ColunaGrupoProps<T, K>> = {};

    grupos?.forEach((grupo) => {
      grupoIndex[grupo.key] = {
        ...grupo,
        colunas: [],
        idx: -1,
        tipo: 'grupo',
        id: grupo.key,
        alturaGrupo,
      };
    });

    return grupoIndex;
  }, [grupos]);

  const { cols, updateOrdem, filtravel, fixaCount } = useMemo(() => {
    const colunas: Array<ColunaProps<T, K> & T> = [];

    let filtravel = gridFilter;
    let fixaCount = 0;

    colunasBruta.forEach((props) => {
      filtravel = props.filtravel || filtravel;

      const renderHeader = props.renderHeader ?? renderHeaderDefault;
      const render = props.render ?? renderDefault;
      const filterFunction =
        props.filterFunction ??
        gridFilterFunction ??
        filtroFunctionDefault<T, K>;

      const agregadoresRender =
        props.agregadoresRender ?? renderAgregadoDefault;

      if (props.fixa) fixaCount += 1;

      colunas.push({
        ...props,
        tipo: 'coluna',
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
                return {
                  key: column.key,
                  asc: !prev.asc,
                  ordem: column.orderFunction,
                };
              }
              return {
                key: column.key,
                asc: false,
                ordem: column.orderFunction,
              };
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
      updateOrdem: (oldIndex: number, newIndex: number) => {
        const d = oldIndex - newIndex < 0 ? -1 : 1;

        // Selecionado
        const grupoOld = grupoIndex[cols[oldIndex].grupo ?? ''];

        // Quem foi escostado
        const grupoNew = grupoIndex[cols[newIndex].grupo ?? ''];

        const tamanhoGrupoOld = grupoOld?.colunas.length ?? 1;
        const tamanhoGrupoNew = (grupoNew?.colunas.length ?? 1) - 1;

        cols.forEach((col) => {
          if (col.grupo != null) {
            if (col.grupo === grupoOld?.key) {
              const idx = grupoOld?.colunas.findIndex((c) => c.key === col.key);
              if (d < 0) {
                // eslint-disable-next-line no-param-reassign
                col.idx =
                  newIndex + tamanhoGrupoNew + idx - (tamanhoGrupoOld - 1);
              } else {
                // eslint-disable-next-line no-param-reassign
                col.idx = newIndex + idx;
              }
              return;
            }
          }
          // Depois da posição antiga e antes da nova
          if (col.idx > oldIndex && col.idx <= newIndex + tamanhoGrupoNew) {
            if (d < 0) {
              // eslint-disable-next-line no-param-reassign
              col.idx += d * tamanhoGrupoOld;
            } else {
              // eslint-disable-next-line no-param-reassign
              col.idx += d;
            }
          }
          // Antes da posição antiga e depois da nova
          if (col.idx < oldIndex && col.idx >= newIndex) {
            if (d > 0) {
              // eslint-disable-next-line no-param-reassign
              col.idx += d * tamanhoGrupoOld;
            } else {
              // eslint-disable-next-line no-param-reassign
              col.idx += d;
            }
          }
        });

        if (grupoOld == null) {
          cols[oldIndex].idx = newIndex + (d < 0 ? tamanhoGrupoNew : 0);
        }

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

  const { colunasAgrupadas, nivelGrupo } = useMemo(() => {
    const colunasAgrupadas: Array<
      (ColunaProps<T, K> & T) | ColunaGrupoProps<T, K>
    > = [];

    let nivel = 0;

    colunas.forEach((coluna) => {
      if (coluna.grupo != null && grupoIndex[coluna.grupo]) {
        const grupo = grupoIndex[coluna.grupo];

        if (grupo.colunas.findIndex((c) => c.key === coluna.key) !== -1) {
          grupo.colunas = [];
        }

        grupo.colunas.push(coluna);

        let grupoPai = grupo;
        let nivelGrupo = 1;

        while (grupoPai.grupo != null && grupoIndex[grupoPai.grupo]) {
          nivelGrupo += 1;
          const novoGrupoPai = grupoIndex[grupoPai.grupo];

          if (grupoPai.colunas.length === 1) {
            grupoPai.pai = novoGrupoPai;
            novoGrupoPai.colunas.push(grupoPai);
          }

          grupoPai = novoGrupoPai;
        }

        nivel = Math.max(nivel, nivelGrupo);

        if (grupoPai.colunas.length === 1) {
          grupoPai.idx = coluna.idx;
          colunasAgrupadas.push({ ...grupoPai });
        }
      } else {
        colunasAgrupadas.push(coluna);
      }
    });

    return { colunasAgrupadas, nivelGrupo: nivel };
  }, [colunas, grupoIndex]);

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

  const gridTemplateRowHeader = useMemo(() => {
    return `repeat(1, ${alturaHeader + alturaGrupo * nivelGrupo}px) ${filtravel ? `repeat(1, ${alturaHeader - 8}px) ` : ''}`;
  }, [filtravel, alturaHeader, nivelGrupo, alturaGrupo]);

  const { colOverscanStartIdx, colOverscanEndIdx } = useMemo(() => {
    let aux = false;
    let colOverscanStartIdx = 0;
    let colOverscanEndIdx = colunasAgrupadas.length;

    const medidaColuna = (coluna: ColunaProps<T, K>, i: number) => {
      const medida = colunaMedidas.get(coluna);
      if (medida != null) {
        const { left, width } = medida;

        if (scrollLeft <= left + width && !aux) {
          aux = true;
          colOverscanStartIdx = i;
        }

        if (scrollLeft + gridWidth <= left) {
          colOverscanEndIdx = i;
          return true;
        }
      }
      return false;
    };

    const medidaGrupo = (grupo: ColunaGrupoProps<T, K>, i: number) => {
      let stop = false;
      const stack = [...grupo.colunas];

      while (stack.length > 0) {
        const col = stack.pop();
        if (col != null && col.tipo === 'grupo') {
          stack.push(...col.colunas);
        } else if (col != null) {
          stop = medidaColuna(col, i);
        }
        if (stop) break;
      }

      return stop;
    };

    for (let i = colOverscanStartIdx; i < colOverscanEndIdx; i += 1) {
      const coluna = colunasAgrupadas[i];
      if (coluna.tipo === 'grupo') {
        if (medidaGrupo(coluna, i)) break;
      } else if (medidaColuna(coluna, i)) {
        break;
      }
    }

    colOverscanEndIdx = Math.min(colOverscanEndIdx, colunasAgrupadas.length);
    // colOverscanStartIdx = Math.max(colOverscanStartIdx, 0);

    return {
      colOverscanStartIdx,
      colOverscanEndIdx,
    };
  }, [colunaMedidas, colunasAgrupadas, gridWidth, scrollLeft]);

  const [colunasView] = useMemo(() => {
    const colunasView: Array<(ColunaProps<T, K> & T) | ColunaGrupoProps<T, K>> =
      [];

    if (fixaCount !== 0) {
      for (let i = 0; i < Math.min(fixaCount, colOverscanStartIdx); i += 1) {
        colunasView.push(colunasAgrupadas[i]);
      }
    }
    for (let i = colOverscanStartIdx; i < colOverscanEndIdx; i += 1) {
      colunasView.push(colunasAgrupadas[i]);
    }
    return [colunasView];
  }, [colOverscanStartIdx, colOverscanEndIdx, colunasAgrupadas]);

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

export function useViewAgregado<T extends Coluna<T, K>, K extends Data = Data>({
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

export function useMousetrap(
  handlerKey: string | string[],
  handlerCallback: ActionKeyPress
) {
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

export function useCopy<T extends Coluna<T, K>, K extends Data = Data>({
  gridSelect,
  data,
  colunas,
}: useCopyProps<T, K>): void {
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
}

export function useSelect<T extends Coluna<T, K>, K extends Data = Data>({
  gridSelect,
  data,
  colunas,
  onSelect,
  onSelectCell,
  onSelectRow,
}: useSelectProps<T, K>): void {
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
}
