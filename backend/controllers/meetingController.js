import { createMeeting, deleteMeeting, getMeetingById, getMeetings, updateMeeting, updateTaskStatus } from '../database/db.js';

export function listMeetings(req, res) {
  res.json(getMeetings(req.query.search || '', req.query.projectId || ''));
}

export function getMeeting(req, res) {
  const meeting = getMeetingById(req.params.id);
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
  res.json(meeting);
}

export function saveMeeting(req, res) {
  const meeting = createMeeting({ ...req.body, projectId: req.body.projectId || req.query.projectId });
  res.status(201).json(meeting);
}

export function patchMeeting(req, res) {
  const meeting = updateMeeting(req.params.id, req.body || {});
  if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
  res.json(meeting);
}

export function removeMeeting(req, res) {
  const ok = deleteMeeting(req.params.id);
  if (!ok) return res.status(404).json({ message: 'Meeting not found' });
  res.json({ message: 'deleted' });
}

export function patchTaskStatus(req, res) {
  const task = updateTaskStatus(req.params.id, req.body.status);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
}
