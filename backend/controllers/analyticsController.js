import { getMeetings, getProjectById } from '../database/db.js';
import { buildAnalytics } from '../services/aiService.js';

export function getAnalytics(req, res) {
  const projectId = req.query.projectId || '';
  res.json(buildAnalytics(getMeetings('', projectId), getProjectById(projectId)));
}
