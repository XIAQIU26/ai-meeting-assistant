import { Router } from 'express';
import { chat, parseMeeting, preparation, insight } from '../controllers/aiController.js';

const router = Router();

router.post('/parse-meeting', parseMeeting);
router.post('/chat', chat);
router.get('/preparation', preparation);
router.get('/insight', insight);
export default router;
