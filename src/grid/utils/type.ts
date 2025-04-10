import type React from 'react';
import type { JSX } from 'react';
import type { ItemInterface } from 'react-sortablejs';
import type { ExtendedKeyboardEvent } from 'mousetrap';

/* use */
export interface ViewData<K extends Data = Data> {
  scrollTop: number;
  linhas: K[];
  totalLinhas?: number;
  alturaLinha: number;
  clientHeight: number;
  alturaDescricao?: number;
  length?: number;
  descricao?: boolean;
  descricaoAcumuladoByIndex?: Record<number, number>;
  descricaoIndexByAcumulado?: Record<number, number>;
}

export interface ViewColuna<
  T extends ColunaBruta = ColunaBruta,
  K extends Data = Data,
> {
  colunasBruta: Array<ColunaGrid<T, K>>;
  scrollLeft: number;
  alturaHeader: number;
  alturaGrupo: number;
  gridWidth: number;
  gridFilter?: boolean;
  gridOrdemDefault?: GridOrdem<K>;
  grupos?: ColunaGrupo[];
  onSortHeader?: SortHeaderEventHandler;
  gridFilterFunction?: FiltroFunction<T, K>;
}

export interface ViewFiltroProps<T, K extends Data = Data> {
  data: K[];
  colunas: Array<ColunaProps<T, K> & T>;
  innerRef?: InnerRefGrid;
  gridOrdem: GridOrdem<K>;
  descricao?: boolean;
  alturaDescricao?: number;
  hierarchy?: boolean;
  // gridFilterFunction?: FiltroFunction<T>;
}

export interface ViewAgregadoProps<
  T extends Coluna<T, K>,
  K extends Data = Data,
> {
  colunas: Array<ColunaProps<T, K> & T>;
  linhas: K[];
  colOverscanStartIdx: number;
  colOverscanEndIdx: number;
  alturaHeader: number;
  filtravel: boolean;
}

export interface useCopyProps<T extends Coluna<T, K>, K extends Data = Data> {
  gridSelect: GridSelect | undefined;
  data: K[];
  colunas: Array<ColunaProps<T, K> & T>;
}

export interface useSelectProps<T extends Coluna<T, K>, K extends Data = Data> {
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

export interface Data extends Record<string, unknown> {
  hasDescricao?: boolean;
  hierarchy?: boolean;
  updateHierarchy?: (id: number | string) => void;
  updateDescricao?: (this: Partial<Data>) => void;
  root?: string | number | null;
  rowIdxOriginal?: number;
  id?: string | number | null;
  nivel?: number | null;
  rowIndexChildrens?: Set<number> | null;
  rowIndexParent?: number | null;
}

interface SourceData<K extends Data = Data> {
  tipo: 'page' | 'total';
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

export interface GridProps<T extends Coluna<T, K>, K extends Data = Data> {
  innerRef?: InnerRefGrid;
  data: K[];
  colunas: Array<ColunaGrid<T, K>>;
  alturaLinha?: number;
  alturaHeader?: number;
  alturaGrupo?: number;
  sort?: boolean;
  grupos?: ColunaGrupo[];
  showLoading?: boolean;
  descricao?: boolean;
  alturaDescricao?: number;
  hierarchy?: boolean;
  grupoSort?: string;
  className?: string;
  /** Busca de dados Dinamicamente */
  sourceData?: SourceData<K>;
  onSelectCell?: SelectCellEventHandler<T, K>;
  onSelectRow?: SelectRowEventHandler<T, K>;
  onSelect?: SelectEventHandler<T, K>;
  onRemoveHeader?: RemoveHeaderEventHandler;
  onSortHeader?: SortHeaderEventHandler;
  filterFunction?: FiltroFunction<T, K>;
}

export interface GridNivelType {
  nivel: number;
  pai: number | string;
  filhos?: Set<string | number>;
  parents?: Set<string | number>;
}

export interface GridSelect {
  idx: number;
  rowIdx: number;
}
export interface GridOrdem<K extends Data> {
  key: string;
  asc: boolean;
  ordem?: OrdemFunction<K>;
}

/* Coluna */

export type ColunaGrid<T = ColunaBruta, K extends Data = Data> = Coluna<T, K> &
  T;

export type Coluna<T = ColunaBruta, K extends Data = Data> = ColunaEvents<
  T,
  K
> &
  ColunaBruta;

export interface ColunaEvents<
  T = ColunaBruta,
  K extends Data = Data,
  key extends string = string,
> {
  renderHeader?: RenderHeaderHandler<T, K>;
  render?: RenderHandler<T, K>;
  // ordenar?: OrdenarHandler<T, K>;
  filterFunction?: FiltroFunction<T, K>;
  orderFunction?: OrdemFunction<K>;
  agregadores?: RecordAgregado<T, K, key>;
  agregadoresRender?: AgregadoFunction<T, K, key>;
}

export interface ColunaGrupo {
  texto: string;
  key: string;
  grupo?: string;
}

export interface ColunaGrupoProps<T = ColunaBruta, K extends Data = Data>
  extends ColunaGrupo,
    ItemInterface {
  colunas: Array<(ColunaProps<T, K> & T) | ColunaGrupoProps<T, K>>;
  idx: number;
  tipo: 'grupo';
  alturaGrupo?: number;
  pai?: ColunaGrupoProps<T, K>;
}

export interface ColunaBruta {
  key: string;
  texto: string;
  grupo?: string;
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

export interface ColunaProps<T = ColunaBruta, K extends Data = Data>
  extends ColunaBruta,
    ColunaEvents<T, K>,
    ItemInterface {
  idx: number;
  tipo: 'coluna';
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
  K extends Data = Data,
  Key extends string = string,
> {
  agregado: Record<Key, string | number>;
  render: AgregadoFunction<T, K, Key>;
  key: string;
  idx: number;
  fixa?: boolean;
}

/* Header */

export interface HeadersProps<T, K extends Data = Data> {
  colunas: Array<(ColunaProps<T, K> & T) | ColunaGrupoProps<T, K>>;
  sort?: boolean;
  group?: string;
  // grupos?: Record<string, ColunaGrupo>;
  updateOrdem?: (
    oldIndex: number,
    newIndex: number,
    oldLength?: number,
    newLength?: number
  ) => void;
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

export type DataPush<K extends Data> = (
  start?: number | null,
  end?: number | null
) => Promise<K[]>;

/** @param index Map<key = column.key, value = column.idx> */
export type SortHeaderEventHandler = (index: Map<string, number>) => void;

export type FiltroActionHandler<T, K extends Data> = (
  props: FiltroActionProps<T, K>
) => void;

export type FiltroFunction<T, K extends Data> = (
  props: FiltroFunctionProps<T, K>
) => boolean;

export type OrdemFunction<K extends Data> = (
  props: OrdemFunctionProps<K>
) => number;

export type AgregadoFunction<T, K extends Data, Key extends string = string> = (
  props: AgregadoFunctionProps<T, K, Key>
) => JSX.Element;

/* Evt - Select */

export type SelectCellEventHandler<
  T extends ColunaBruta = ColunaBruta,
  K extends Data = Data,
> = (props: SelectCellEventProps<T, K>) => void;

export type SelectRowEventHandler<
  T extends ColunaBruta = ColunaBruta,
  K extends Data = Data,
> = (props: SelectRowEventProps<T, K>) => void;

export type SelectEventHandler<
  T extends ColunaBruta = ColunaBruta,
  K extends Data = Data,
> = (props: SelectEventProps<T, K>) => void;

/* Evt - Render */

export type RenderHandler<T, K extends Data = Data> = (
  props: ColunaCellRenderProps<T, K>
) => JSX.Element | null;

export type RenderDescricaoHandler<T, K extends Data = Data> = (
  props: DescricaoCellRenderProps<T, K>
) => React.ReactNode;

export type OrdenarHandler<T, K extends Data = Data> = (
  props: OrdenarProps<T, K>
) => void;

export type RenderHeaderHandler<T, K extends Data = Data> = (
  props: ColunaHeaderRenderProps<T, K>
) => JSX.Element | null;

/* Pros */

type RecordAgregado<T, K extends Data, Key extends string = string> = Record<
  Key,
  (props: AgregadoParametrosProps<T, K>) => string | number
>;

interface AgregadoParametrosProps<T, K extends Data> {
  rows: K[];
  coluna: ColunaProps<T, K> & T;
  colunas: Array<ColunaProps<T, K> & T>;
}

export interface AgregadoFunctionProps<
  T,
  K extends Data,
  Key extends string = string,
> {
  agregado: Record<Key, undefined | number | string>;
  coluna: ColunaProps<T, K> & T;
}

export interface AgregadoProps<T, K extends Data> {
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

export interface FiltroFunctionProps<T, K extends Data> {
  key: string;
  filtro: FiltroValue;
  value: K[keyof K];
  row: K;
  coluna: ColunaProps<T, K> & T;
}

export interface OrdemFunctionProps<K extends Data> {
  key: string;
  asc: boolean;
  a: K;
  b: K;
}

export interface FiltroActionProps<T, K extends Data> {
  column: ColunaProps<T, K> & T;
  value: FiltroValue;
}

export interface FiltroProps<T, K extends Data> {
  colunas: Array<(ColunaProps<T, K> & T) | ColunaGrupoProps<T, K>>;
  action?: FiltroActionHandler<T, K>;
}

/* Pros - Render */

export interface RowRenderProps<T, K extends Data> {
  rowIdx: number;
  row: K;
  colunas: Array<(ColunaProps<T, K> & T) | ColunaGrupoProps<T, K>>;
  gridRowStart: number | `${number}/${number}`;
  select?: GridSelect;
  descricao?: boolean;
  // gridTemplateColumns: string;
}

export interface DescricaoRenderProps<T, K extends Data> {
  rowIdx: number;
  row: K;
  colunas: Array<ColunaProps<T, K> & T>;
  gridRowStart: number | `${number}/${number}`;
  select?: GridSelect;
  descricaoRender?: RenderDescricaoHandler<T, K>;
  hide?: boolean;
  // gridTemplateColumns: string;
}

export interface ColunaRenderProps<T, K extends Data> {
  column: ColunaProps<T, K> & T;
  idx: number;
  rowIdx: number;
  row: K;
  select?: GridSelect;
  hierarchy?: boolean;
  haveParent?: boolean;
  descricao: boolean;
}

export interface ColunaGrupoRenderProps<T, K extends Data> {
  grupo: ColunaGrupoProps<T, K>;
  rowIdx: number;
  row: K;
  select?: GridSelect;
  hierarchy?: boolean;
  haveParent?: boolean;
  descricao: boolean;
}

export interface HeaderRenderProps<T, K extends Data> {
  column: ColunaProps<T, K> & T;
  idx: number;
  select?: GridSelect;
}

export interface HeaderGrupoRenderProps<T, K extends Data> {
  colunas: Array<(ColunaProps<T, K> & T) | ColunaGrupoProps<T, K>>;
  grupo: ColunaGrupoProps<T, K>;
  idx: number;
  select?: GridSelect;
}

export interface AgregadoRenderProps<T, K extends Data> {
  agregado: AgragadoProps<T, K>;
  coluna: ColunaProps<T, K> & T;
  idx: number;
}

export interface FiltroRenderProps<T, K extends Data> {
  column: ColunaProps<T, K> & T;
  idx: number;
  action?: FiltroActionHandler<T, K>;
}

export interface ColunaCellRenderProps<T = ColunaBruta, K extends Data = Data> {
  column: ColunaProps<T, K> & T;
  rowIdx: number;
  row: K;
}

export interface DescricaoCellRenderProps<
  T = ColunaBruta,
  K extends Data = Data,
> {
  columns: Array<ColunaProps<T, K> & T>;
  rowIdx: number;
  row: K;
}

export interface OrdenarProps<T = ColunaBruta, K extends Data = Data> {
  column: ColunaProps<T, K> & T;
}

export interface ColunaHeaderRenderProps<
  T = ColunaBruta,
  K extends Data = Data,
> {
  column: ColunaProps<T, K> & T;
}

/* Pros - Select */

interface SelectCellEventProps<T, K extends Data> {
  column: ColunaProps<T, K> & T;
  rowIdx: number;
  data?: K[keyof K];
}

interface SelectRowEventProps<T, K extends Data> {
  columns: Array<ColunaProps<T, K> & T>;
  rowIdx: number;
  rowData: K;
}

interface SelectEventProps<T, K extends Data> {
  columns: Array<ColunaProps<T, K> & T>;
  column: ColunaProps<T, K> & T;
  rowIdx: number;
  data?: K[keyof K];
  rowData?: K;
}

export interface ColunaCellSelect<T = ColunaBruta, K extends Data = Data> {
  column: ColunaProps<T, K> & T;
  rowIdx: number;
}

export interface ColunaHeaderSelect<T = ColunaBruta, K extends Data = Data> {
  column: ColunaProps<T, K> & T;
}

export interface SelectOption {
  label: string | number | JSX.Element;
  value: number | string | undefined;
}

export type ActionKeyPress = (e: ExtendedKeyboardEvent, combo: string) => void;
