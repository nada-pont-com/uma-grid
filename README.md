# Uma Grid

## Uso

```tsx
function Componente(){
  const colunas: ColunaGrid[] = [
    {
      key: 'valor',
      texto: 'Coluna - 1',
    }
  ];
  const data: Record<string, unknown>[] = [{'valor': 10}]

  return <Grid data={data} cols={colunas}/>
}

```
