import { createProject, getProjects } from '../database/db.js';

export function listProjects(_req, res) {
  res.json(getProjects());
}

export function saveProject(req, res) {
  const project = createProject(req.body);
  res.status(201).json(project);
}
