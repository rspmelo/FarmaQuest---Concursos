import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis do arquivo .env
  const env = loadEnv(mode, '.', '');
  
  // Verifica se a API KEY existe (apenas log no terminal de build)
  if (!env.API_KEY) {
    console.warn("⚠️  AVISO: API_KEY não encontrada no arquivo .env. O site pode não funcionar corretamente.");
  }

  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY com segurança. Se não existir, usa string vazia para não quebrar a sintaxe JS.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ""),
      // Define um objeto global process.env para compatibilidade
      'process.env': JSON.stringify({
         NODE_ENV: mode,
         API_KEY: env.API_KEY || ""
      })
    }
  }
})