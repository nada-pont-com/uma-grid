import React from 'react';
import type { JSX } from 'react';
import type { ItemInterface } from 'react-sortablejs';
import type { ExtendedKeyboardEvent } from 'mousetrap';

/* use */
export interface ViewData<
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  scrollTop: number;
  linhas: K[];
  totalLinhas?: number;
  alturaLinha: number;
  clientHeight: number;
}

export interface ViewColuna<
  T extends ColunaBruta = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  colunasBruta: ColunaGrid<T, K>[];
  scrollLeft: number;
  alturaHeader: number;
  gridWidth: number;
  gridFilter?: boolean;
  onSortHeader?: SortHeaderEventHandler;
  gridFilterFunction?: FiltroFunction<T, K>;
}

export interface ViewFiltroProps<
  T,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  data: K[];
  colunas: Array<ColunaProps<T, K> & T>;
  innerRef?: InnerRefGrid;
  gridOrdem: GridOrdem;
  // gridFilterFunction?: FiltroFunction<T>;
}

export interface ViewAgregadoProps<
  T extends Coluna<T, K>,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  colunas: Array<ColunaProps<T, K> & T>;
  linhas: K[];
  colOverscanStartIdx: number;
  colOverscanEndIdx: number;
  alturaHeader: number;
  filtravel: boolean;
}

export interface useCopyProps<
  T extends Coluna<T, K>,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  gridSelect: GridSelect | undefined;
  data: K[];
  colunas: Array<ColunaProps<T, K> & T>;
}

export interface useSelectProps<
  T extends Coluna<T, K>,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  gridSelect: GridSelect | undefined;
  data: K[];
  colunas: Array<ColunaProps<T, K> & T>;
  onSelectCell?: SelectCellEventHandler<T, K>;
  onSelectRow?: SelectRowEventHandler<T, K>;
  onSelect?: SelectEventHandler<T, K>;
}


/* Grid */

export interface InnerRefGridProps {
  filter?: (key: string, value: FiltroValue) => void;
}

export type InnerRefGrid = React.RefObject<InnerRefGridProps>;

interface SourceData<K extends Record<string, unknown> = Record<string, unknown>> {
  tipo: 'page' | 'total', 
  /** Busca os dados e não atualiza o estado de `data`, controlado de forma externa */
  onPush?: DataPushEventHandler;
  /** Utilizado em conjunto com `onPush` */
  totalLinhas?: number;
  /** Busca os dados e atualiza o estado de `data` */
  dataPush?: DataPush<K>;
  /** Busca o total de Linhas, necessário para usar `dataPush` */
  totalPush?: TotalDataPush;
  tamanhoPage?: number;
  /** Quantidade de Pagina para buscar na inicialização da Grid
   * 
   * `Todas` = Qualquer valor diferente de > 0 
   * */
  pagesStart?: number;
}

export interface GridProps<
  T extends Coluna<T, K>,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  innerRef?: InnerRefGrid;
  data: K[];
  colunas: ColunaGrid<T, K>[];
  alturaLinha?: number;
  alturaHeader?: number;
  sort?: boolean;
  grupoSort?: string;
  className?: string;
  /** Busca de dados Dinamicamente */
  sourceData?: SourceData<K>,
  onSelectCell?: SelectCellEventHandler<T, K>;
  onSelectRow?: SelectRowEventHandler<T, K>;
  onSelect?: SelectEventHandler<T, K>;
  onRemoveHeader?: RemoveHeaderEventHandler;
  onSortHeader?: SortHeaderEventHandler;
  filterFunction?: FiltroFunction<T, K>;
}

export interface GridSelect {
  idx: number;
  rowIdx: number;
}
export interface GridOrdem {
  key: string;
  asc: boolean;
}

/* Coluna */

export type ColunaGrid<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> = Coluna<T, K> & T;

export type Coluna<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> = ColunaEvents<T, K> & ColunaBruta;

export interface ColunaEvents<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
  key extends string = string,
> {
  renderHeader?: RenderHeaderHandler<T, K>;
  render?: RenderHandler<T, K>;
  // ordenar?: OrdenarHandler<T, K>;
  filterFunction?: FiltroFunction<T, K>;
  agregadores?: RecordAgregado<T, K, key>;
  agregadoresRender?: AgregadoFunction<T, K, key>;
}

export interface ColunaBruta {
  key: string;
  texto: string;
  // renderHeader?: (props: ColunaHeaderRender<T>) => JSX.Element | string | null;
  // render?: (props: ColunaCellRender<T>) => JSX.Element | null;
  height?: number | string;
  width?: number | string;
  filtravel?: boolean;
  order?: boolean;
  filtravelTipo?: string;
  filterClass?: string;
  fixa?: boolean;
}

export interface ColunaProps<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> extends ColunaBruta, ColunaEvents<T, K>,
    ItemInterface {
  idx: number;
  render: RenderHandler<T, K>;
  renderHeader: RenderHeaderHandler<T, K>;
  ordenar: OrdenarHandler<T, K>;
  select: (props: ColunaCellSelect<T, K>) => void;
  selectHeader: (props: ColunaHeaderSelect<T, K>) => void;
  filterFunction: FiltroFunction<T, K>;
  agregadoresRender: AgregadoFunction<T, K, keyof RecordAgregado<T, K>>;
}

export interface AgragadoProps<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
  Key extends string = string,
> {
  agregado: Record<Key, string | number>;
  render: AgregadoFunction<T, K, Key>;
  key: string;
  idx: number;
  fixa?: boolean;
}

/* Header */

export interface HeadersProps<
  T,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  colunas: Array<ColunaProps<T, K> & T>;
  sort?: boolean;
  group?: string;
  updateOrdem?: (oldIndex: number, newIndex: number) => void;
  onRemoveHeader?: RemoveHeaderEventHandler;
  select?: GridSelect;
}

/* Events */

export type RemoveHeaderEventHandler = (id?: string | number | null) => void;

export type DataPushEventHandler = (
  start?: number | null,
  end?: number | null
) => Promise<void>;

export type TotalDataPush = () => Promise<number>;

export type DataPush<K extends Record<string, unknown>> = (
  start?: number | null,
  end?: number | null
) => Promise<K[]>;

/** @param index Map<key = column.key, value = column.idx> */
export type SortHeaderEventHandler = (index: Map<string, number>) => void;

export type FiltroActionHandler<T, K extends Record<string, unknown>> = (
  props: FiltroActionProps<T, K>
) => void;

export type FiltroFunction<T, K extends Record<string, unknown>> = (
  props: FiltroFunctionProps<T, K>
) => boolean;

export type AgregadoFunction<
  T,
  K extends Record<string, unknown>,
  Key extends string = string,
> = (props: AgregadoFunctionProps<T, K, Key>) => JSX.Element;

/* Evt - Select */

export type SelectCellEventHandler<
  T extends ColunaBruta = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> = (props: SelectCellEventProps<T, K>) => void;

export type SelectRowEventHandler<
  T extends ColunaBruta = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> = (props: SelectRowEventProps<T, K>) => void;

export type SelectEventHandler<
  T extends ColunaBruta = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> = (props: SelectEventProps<T, K>) => void;

/* Evt - Render */

export type RenderHandler<
  T,
  K extends Record<string, unknown> = Record<string, unknown>,
> = (props: ColunaCellRenderProps<T, K>) => JSX.Element | null;

export type OrdenarHandler<
  T,
  K extends Record<string, unknown> = Record<string, unknown>,
> = (props: OrdenarProps<T, K>) => void;

export type RenderHeaderHandler<
  T,
  K extends Record<string, unknown> = Record<string, unknown>,
> = (props: ColunaHeaderRenderProps<T, K>) => JSX.Element | null;

/* Pros */

type RecordAgregado<
  T,
  K extends Record<string, unknown>,
  Key extends string = string,
> = Record<Key, (props: AgregadoParametrosProps<T, K>) => string | number>;

interface AgregadoParametrosProps<T, K extends Record<string, unknown>> {
  rows: K[];
  coluna: ColunaProps<T, K> & T;
  colunas: Array<ColunaProps<T, K> & T>;
}

export interface AgregadoFunctionProps<
  T,
  K extends Record<string, unknown>,
  Key extends string = string,
> {
  agregado: Record<Key, undefined | number | string>;
  coluna: ColunaProps<T, K> & T;
}

export interface AgregadoProps<T, K extends Record<string, unknown>> {
  agregadores: Array<AgragadoProps<T, K> | undefined>;
  colunas: Array<ColunaProps<T, K> & T>;
  altura: number;
}

/* Pros - Filtro */

export type FiltroValue =
  | string[]
  | string
  | number
  | Record<string, unknown>
  | SelectOption
  | SelectOption[]
  | undefined
  | null;

export interface FiltroFunctionProps<T, K extends Record<string, unknown>> {
  key: string;
  filtro: FiltroValue;
  value: K[keyof K];
  row: K;
  coluna: ColunaProps<T, K> & T;
}

export interface FiltroActionProps<T, K extends Record<string, unknown>> {
  column: ColunaProps<T, K> & T;
  value: FiltroValue;
}

export interface FiltroProps<T, K extends Record<string, unknown>> {
  colunas: Array<ColunaProps<T, K> & T>;
  action?: FiltroActionHandler<T, K>;
}

/* Pros - Render */
export interface ColunaRenderProps<T, K extends Record<string, unknown>> {
  column: ColunaProps<T, K> & T;
  idx: number;
  rowIdx: number;
  row: K;
  select?: GridSelect;
}

export interface HeaderRenderProps<T, K extends Record<string, unknown>> {
  column: ColunaProps<T, K> & T;
  idx: number;
  select?: GridSelect;
}

export interface AgregadoRenderProps<T, K extends Record<string, unknown>> {
  agregado: AgragadoProps<T, K>;
  coluna: ColunaProps<T, K> & T;
  idx: number;
}

export interface FiltroRenderProps<T, K extends Record<string, unknown>> {
  column: ColunaProps<T, K> & T;
  idx: number;
  action?: FiltroActionHandler<T, K>;
}

export interface ColunaCellRenderProps<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  column: ColunaProps<T, K> & T;
  rowIdx: number;
  row: K;
}

export interface OrdenarProps<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  column: ColunaProps<T, K> & T;
}

export interface ColunaHeaderRenderProps<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  column: ColunaProps<T, K> & T;
}

/* Pros - Select */

interface SelectCellEventProps<T, K extends Record<string, unknown>> {
  column: ColunaProps<T, K> & T;
  rowIdx: number;
  data?: K[keyof K];
}

interface SelectRowEventProps<T, K extends Record<string, unknown>> {
  columns: Array<ColunaProps<T, K> & T>;
  rowIdx: number;
  rowData: K;
}

interface SelectEventProps<T, K extends Record<string, unknown>> {
  columns: Array<ColunaProps<T, K> & T>;
  column: ColunaProps<T, K> & T;
  rowIdx: number;
  data?: K[keyof K];
  rowData?: K;
}

export interface ColunaCellSelect<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  column: ColunaProps<T, K> & T;
  rowIdx: number;
}

export interface ColunaHeaderSelect<
  T = ColunaBruta,
  K extends Record<string, unknown> = Record<string, unknown>,
> {
  column: ColunaProps<T, K> & T;
}

export interface SelectOption {
  label: string | number | JSX.Element;
  value: number | string | undefined;
}

export type ActionKeyPress = (e: ExtendedKeyboardEvent, combo: string) => void;
