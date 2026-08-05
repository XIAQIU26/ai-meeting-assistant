import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import meetingRoutes from './routes/meetingRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

import { initDatabase } from './database/db.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDist = path.resolve(__dirname, '../frontend/dist');

const app = express();

const PORT = process.env.PORT || 4000;


initDatabase();


app.use(cors());

app.use(express.json({ limit: '2mb' }));


// 测试接口
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-research-meeting-assistant'
  });
});


// API接口
app.use('/api/meetings', meetingRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/analytics', analyticsRoutes);

app.use('/api/projects', projectRoutes);


// 前端静态文件
app.use(express.static(frontendDist));


// 前端路由支持
app.get('*', (_req, res) => {
  res.sendFile(
    path.join(frontendDist, 'index.html')
  );
});


// 启动服务
app.listen(PORT, () => {

  console.log(
    `Demo running on http://127.0.0.1:${PORT}`
  );

  console.log(
    `Backend API running on http://127.0.0.1:${PORT}/api`
  );

});