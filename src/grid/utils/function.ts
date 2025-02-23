import React, { JSX } from "react";

export default function isFunction<T = undefined>(f: T | undefined): f is T {
  return typeof f === 'function';
}

export function isNumber(f: unknown | undefined): f is number {
  return typeof f === 'number' || Number.isFinite(Number(f));
}

export const delay = (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

export const withMemo = <K,>(
  Component: (props: K) => JSX.Element
) => React.memo(Component) as (props: K) => JSX.Element;