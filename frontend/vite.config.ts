import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到 GitHub Pages 时，仓库会被访问在 https://<user>.github.io/<repo>/ 子路径下。
// base 设为 './' 让资源使用相对路径，兼容根路径部署和子路径部署。
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  // 固定端口：localStorage 按域名+端口隔离，端口一变数据就读不到。
  // strictPort 防止端口被占用时静默切换到别的端口导致数据"丢失"。
  server: {
    port: 5173,
    strictPort: true
  }
});
