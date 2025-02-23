import { useCallback, useEffect, useRef } from 'react';

interface Props{
  onResize: (e: UIEvent)=>void;
}

export default function ElementResizeListener({ onResize }: Props) {
  const rafRef = useRef(0);
  const objectRef = useRef<HTMLObjectElement>(null);
  const onResizeRef = useRef(onResize);

  onResizeRef.current = onResize;

  const onResizeCallback = useCallback((e: UIEvent) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      onResizeRef.current(e);
    });
  }, []);

  const check =
    (objectRef.current &&
      objectRef.current.contentDocument &&
      objectRef.current.contentDocument.defaultView) !== null;

  useEffect(() => {
    const obj = objectRef.current;

    if (obj && obj.contentDocument && obj.contentDocument.defaultView) {
      obj.contentDocument.defaultView.addEventListener(
        'resize',
        onResizeCallback,
      );
    }
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (obj && obj.contentDocument && obj.contentDocument.defaultView) {
        obj.contentDocument.defaultView.removeEventListener(
          'resize',
          onResizeCallback,
        );
      }
    };
  }, [onResizeCallback, check]);

  return (
    <object
      aria-label="resize"
      ref={objectRef}
      tabIndex={-1}
      type="text/html"
      data="about:blank"
      title=""
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: 0,
      }}
    />
  );
}
