import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/admin",
  plugins: [react()],
  build: {
    target: "esnext",
  },
  server :{
    allowedHosts:["vfast.devmaster.in", "localhost", "chatbot.bits-pilani.ac.in"]
  }
})
