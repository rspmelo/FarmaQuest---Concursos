
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente baseadas no modo atual (development/production)
  // Usamos '.' para garantir que encontre o arquivo .env na raiz do projeto
  const env = loadEnv(mode, '.', '');

  return {
    plugins: [react()],
    define: {
      // Garante que process.env.API_KEY funcione no código frontend após o build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill simples para evitar que outras chamadas a process.env quebrem
      'process.env': {} 
    }
  }
})
