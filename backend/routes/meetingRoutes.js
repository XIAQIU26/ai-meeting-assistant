import { Router } from 'express';
import { getMeeting, listMeetings, patchMeeting, patchTaskStatus, removeMeeting, saveMeeting } from '../controllers/meetingController.js';

const router = Router();

router.get('/', listMeetings);
router.get('/:id', getMeeting);
router.post('/', saveMeeting);
router.patch('/:id', patchMeeting);
router.delete('/:id', removeMeeting);
router.patch('/tasks/:id', patchTaskStatus);


export default router;
