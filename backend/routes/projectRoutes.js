import { Router } from 'express';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(
  __dirname,
  '../database/research-meetings.json'
);

function readData() {
  return JSON.parse(readFileSync(dataPath, 'utf-8'));
}

function saveData(data) {
  writeFileSync(
    dataPath,
    JSON.stringify(data, null, 2),
    'utf-8'
  );
}


// 获取全部课题
router.get('/', (_req, res) => {
  const data = readData();
  res.json(data.projects || []);
});


// 新建课题
router.post('/', (req, res) => {
  const data = readData();

  const project = {
    id: `p_${Date.now()}`,
    name: req.body.name,
    researchTopic: req.body.name,
    type: req.body.type || '其他课题',
    stage: '选题论证'
  };

  data.projects.push(project);

  saveData(data);

  res.json(project);
});


// 修改课题名称
router.patch('/:id', (req, res) => {
  const data = readData();

  const project = data.projects.find(
    p => p.id === req.params.id
  );

  if (!project) {
    return res.status(404).json({
      message: 'project not found'
    });
  }

  project.name = req.body.name;
  project.researchTopic = req.body.name;

  saveData(data);

  res.json(project);
});


// 删除课题
router.delete('/:id', (req, res) => {
  const data = readData();

  data.projects = data.projects.filter(
    p => p.id !== req.params.id
  );

  data.meetings = data.meetings.filter(
    m => m.projectId !== req.params.id
  );

  saveData(data);

  res.json({
    message: 'deleted'
  });
});
export default router;