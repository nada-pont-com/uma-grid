import Grid from './grid';
import type {
  Coluna,
  ColunaBruta,
  SelectEventHandler,
  RemoveHeaderEventHandler,
  SortHeaderEventHandler,
} from './utils/type';

export function generateData(
  numItems: number,
  colunas: number,
): { data: Array<Record<string, unknown>>; coluna: ColunaBruta[] } {
  const data = [];
  const coluna: ColunaBruta[] = [];
  for (let i = 0; i < numItems; i += 1) {
    const item: Record<string, unknown> = {};
    for (let j = 0; j < colunas; j += 1) {
      item[`${j}x0`] = `${j}x${i}`;
    }
    data.push(item);
  }
  for (let i = 0; i < colunas; i += 1) {
    coluna.push({
      key: `${i}x0`,
      texto: `Hx${i}`,
    });
  }

  return { data, coluna };
}

export function generateDataByColunas(
  numItems: number,
  colunas: ColunaBruta[],
): { data: Array<Record<string, unknown>> } {
  const data = [];
  for (let i = 0; i < numItems; i += 1) {
    const item: Record<string, unknown> = {};
    colunas.forEach(({ key }) => {
      item[key] = `${key}x${i}`;
    });
    data.push(item);
  }

  return { data };
}

export default function Teste() {
  const { data, coluna } = generateData(10, 24);

  return <Grid data={data} colunas={coluna} sort grupoSort="grid-configuracao" />;
}

export function TesteData<T extends Coluna<T>>({
  colunas,
  className,
  onSelect,
  onRemoveHeader,
  onSortHeader,
}: {
  colunas: T[];
  className: string;
  onSelect: SelectEventHandler<T>;
  onRemoveHeader: RemoveHeaderEventHandler;
  onSortHeader: SortHeaderEventHandler;
}) {
  const { data } = generateDataByColunas(10, colunas);

  return (
    <Grid<T>
      data={data}
      colunas={colunas}
      sort
      onSelect={onSelect}
      grupoSort="grid-configuracao"
      className={className}
      onRemoveHeader={onRemoveHeader}
      onSortHeader={onSortHeader}
    />
  );
}
