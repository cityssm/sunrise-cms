import { Router } from 'express';
import handler_milestoneICS from '../handlers/apiGet/milestoneICS.js';
export const router = Router();
router.get('/milestoneICS', handler_milestoneICS);
export default router;
