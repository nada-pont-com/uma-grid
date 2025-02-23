import 'react-app-polyfill/ie11';
import * as React from 'react';
import { createRoot, Container } from 'react-dom/client';
import Teste from '../src/grid/teste';

const App = () => {
  return (
    <div>
      <Teste />
    </div>
  );
};

const root = createRoot(document.getElementById('root') as Container);
root.render(<App />);