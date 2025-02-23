import { defineConfig, Options } from 'tsup';
import { sassPlugin } from 'esbuild-sass-plugin';

const p = [sassPlugin() as unknown] as Options['esbuildPlugins'];

export default defineConfig({
  entry: ['src/index.ts'],      // Arquivo de entrada
  format: ['esm', 'cjs'],       // Formatos do pacote (ESM e CommonJS)
  dts: true,                    // Gerar arquivos de declaração .d.ts
  sourcemap: true,              // Gerar mapas de fonte
  clean: true,                  // Limpar a pasta de saída antes de cada build
  external: ['react', 'react-dom'],  // Excluir pacotes externos do bundle
  plugins: [],  // Adicionar o plugin SCSS se necessário
  esbuildPlugins: p,
  watch: process.env.NODE_ENV === 'development',  // Ativar watch em modo de desenvolvimento
});


