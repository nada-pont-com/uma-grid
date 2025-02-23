import { CSSProperties, ReactNode } from 'react';
import { Input } from 'reactstrap';
import classNames from 'classnames';

import type { SelectOption } from './utils/type';
// import Select from 'components/select/select';
// import Data from 'components/select/data';

import type {
  ColunaProps,
  FiltroActionHandler,
  FiltroProps,
  FiltroRenderProps,
} from './utils/type';
import isFunction, { withMemo } from './utils/function';

function Filtros<T, K extends Record<string, unknown>>({
  colunas,
  action,
}: FiltroProps<T, K>) {
  const nodes: ReactNode[] = [];

  for (let i = 0; i < colunas.length; i += 1) {
    const column = colunas[i];
    const { idx, key } = column;

    nodes.push(
      <FiltroDefault<T, K>
        idx={idx}
        column={column}
        action={action}
        key={`filtro_${key}`}
      />,
    );
  }

  return (
    <div
      className="grid-row"
      style={
        {
          '--grid-row-start': 2,
        } as unknown as CSSProperties
      }
    >
      {nodes}
    </div>
  );
}

/* numerico, texto, lista, data, data 2 */

function Filtro<T, K extends Record<string, unknown>>({
  idx,
  column,
  action,
}: FiltroRenderProps<T, K>) {
  let node: ReactNode | undefined;
  const { filtravel, filtravelTipo, fixa } = column;

  if (filtravel && isFunction(action)) {
    if (filtravelTipo === 'checkedlist') {
      // node = <FiltroLista<T, K> value="" action={action} column={column} />;
    }
    if (filtravelTipo === 'date') {
      // node = (
      //   <FiltroData<T, K>
      //     value=""
      //     action={action}
      //     column={column}
      //     range={false}
      //   />
      // );
    }
    if (filtravelTipo === 'range') {
      // node = (
      //   <FiltroData<T, K> value="" action={action} column={column} range />
      // );
    }
    if (filtravelTipo === 'number') {
      node = (
        <FiltroInput<T, K>
          value=""
          action={action}
          column={column}
          type="number"
        />
      );
    }
    if(node == null){
      node = (
        <FiltroInput<T, K> value="" action={action} column={column} type="text" />
      );
    }
  }

  const varsCss: Record<string, unknown> = {
    '--grid-column': idx + 1,
  };

  const style: CSSProperties = {
    ...varsCss,
  };

  if (fixa) style.insetInlineStart = `var(--grid-init-left-${idx + 1})`;

  return (
    <div style={style} className="grid-filtro">
      {node}
    </div>
  );
}

interface Props<T, K extends Record<string, unknown>> {
  action: FiltroActionHandler<T, K>;
  column: ColunaProps<T, K> & T;
  value: string | number | SelectOption | SelectOption[] | undefined | null;
}

function FiltroInput<T, K extends Record<string, unknown>>({
  type,
  action,
  value,
  column,
}: Props<T, K> & { type: 'number' | 'text' }) {
  return (
    <Input
      defaultValue={value as string | number}
      className={classNames('h-100', column.filterClass)}
      type={type}
      onChange={(e) => {
        action({
          column,
          value: e.target.value,
        });
      }}
    />
  );
}

// function FiltroData<T, K extends Record<string, unknown>>({
//   range,
//   value = '',
//   action,
//   column,
// }: Props<T, K> & { range: boolean }) {
//   return ( <div />
//     // <Data
//     //   disabled
//     //   selectsRange={range}
//     //   value={value as unknown as Date}
//     //   onChange={(vl: string | string[] | null) => {
//     //     action({
//     //       column,
//     //       value: vl,
//     //     });
//     //   }}
//     // />
//   );
// }

// function FiltroLista<T, K extends Record<string, unknown>>({
//   action,
//   column,
//   value,
// }: Props<T, K>) {
//   return ( <div />
//     // <Select
//     //   isDisabled
//     //   isClearable
//     //   placeholder="Selecione"
//     //   onChange={() => {
//     //     action({
//     //       column,
//     //       value,
//     //     });
//     //   }}
//     // />
//   );
// }

const FiltroDefault = withMemo(Filtro);
const FiltrosDefault = withMemo(Filtros);

export default FiltrosDefault;
