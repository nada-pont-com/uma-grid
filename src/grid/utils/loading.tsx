import classNames from 'classnames';
import { memo, CSSProperties } from 'react';

interface Props {
  altura: number;
  loading: boolean;
}

export function Loading({ altura, loading }: Props) {
  const idx = -1;

  const props = { idx, headerid: 'loading' };

  const varsCss: Record<string, unknown> = {
    '--grid-column': -2,
  };

  const style: CSSProperties = {
    ...varsCss,
  };

  return (
    <div
      className="grid-row"
      style={
        {
          '--grid-row-start': altura,
        } as unknown as CSSProperties
      }
    >
      <div
        {...props}
        role="cell"
        aria-hidden
        style={style}
        className={classNames('grid-loading-data', { show: loading })}
      >
        <div className="d-flex grid-loading-data-content justify-content-around rounded-lg align-items-center">
          <div className="position-relative">
            <div className="loading" />
          </div>
          <div className="">Carregando Dados</div>
        </div>
      </div>
    </div>
  );
}

const LoadingDefault = memo(Loading) as typeof Loading;
export default LoadingDefault;
