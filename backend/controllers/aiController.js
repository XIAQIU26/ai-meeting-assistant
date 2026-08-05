import { getMeetings, getProjectById } from '../database/db.js';
import {
  answerResearchQuestion,
  buildPreparation,
  parseMeetingText,
  buildResearchInsight
} from '../services/aiService.js';


export async function parseMeeting(req, res) {
  const project = getProjectById(req.body.projectId || req.query.projectId || '');
  const result = await parseMeetingText(req.body.text || '', project);
  res.json(result);
}


export async function chat(req, res) {
  const projectId = req.body.projectId || req.query.projectId || '';
  const meetings = getMeetings('', projectId);
  const answer = await answerResearchQuestion(
    req.body.question || '',
    meetings,
    getProjectById(projectId)
  );

  res.json({
    answer,
    contextSize: meetings.length
  });
}


export function preparation(req, res) {
  const projectId = req.query.projectId || '';
  res.json(buildPreparation(getMeetings('', projectId), getProjectById(projectId)));
}


export function insight(req, res) {
  const projectId = req.query.projectId || '';
  const meetings = getMeetings('', projectId);
  const result = buildResearchInsight(meetings, getProjectById(projectId));

  res.json(result);
}
