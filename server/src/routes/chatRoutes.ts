import express from 'express';
import { getProjectsAndTasks } from '../controllers/chatController';

const router = express.Router();

router.get('/context', async (req, res) => {
  try {
    // Authorization should be handled by middleware
    const projectsData = await getProjectsAndTasks();
    res.json(projectsData);
  } catch (error) {
    console.error('Error in chat context route:', error);
    res.status(500).json({ error: 'Failed to fetch project data' });
  }
});

export default router;
