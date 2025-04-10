import Grid from './grid';
import type {
  Coluna,
  ColunaBruta,
  SelectEventHandler,
  RemoveHeaderEventHandler,
  SortHeaderEventHandler,
  ColunaGrid,
  ColunaGrupo,
} from './utils/type';

export function generateData(
  numItems: number,
  colunas: number
): {
  data: Array<Record<string, unknown>>;
  coluna: ColunaGrid[];
  grupos: ColunaGrupo[];
} {
  const data = [];
  const coluna: ColunaGrid[] = [];
  const grupos: ColunaGrupo[] = [
    {
      key: 'grid-configuracao',
      texto: 'Configuração',
    },
    {
      key: 'teste',
      texto: 'Teste',
    },
  ];

  for (let i = 0; i < numItems; i += 1) {
    const item: Record<string, unknown> = {};
    for (let j = 0; j < colunas; j += 1) {
      item[`${j}x0`] = `${j}x${i}`;
    }
    data.push(item);
  }
  for (let i = 0; i < colunas; i += 1) {
    let grupo: string | undefined;

    if (i < 3) {
      grupo = 'grid-configuracao';
    } else if (i < 5) {
      //
    } else if (i < 8) {
      grupo = 'teste';
    }

    coluna.push({
      key: `${i}x0`,
      texto: `Hx${i}`,
      grupo,
    });
  }

  return { data, coluna, grupos };
}

export function generateDataByColunas<T = ColunaBruta>(
  numItems: number,
  colunas: Array<ColunaGrid<T>>
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
  const { data, coluna, grupos } = generateData(10, 10);

  return <Grid data={data} colunas={coluna} sort grupos={grupos} />;
}

export function TesteData<T extends Coluna<T>>({
  colunas,
  className,
  onSelect,
  onRemoveHeader,
  onSortHeader,
}: {
  colunas: Array<ColunaGrid<T>>;
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
