import { Router } from 'express';
import { authenticateV2 } from '../02-authentication/middlewares/authenticate';
import accessController from '../02-authentication/conttoller';
import accessRouter from '../02-authentication/route';
import workspaceRouter from '../03-workspace/route';
import boardRouter from '../04-board/route';
import columnRouter from '../05-column/route';
import groupRouter from '../06-group/route';
import taskRouter from '../07-task/route';

const router = Router();

router.use('/auth', accessRouter);

// router.use(authenticate as any);
router.use(authenticateV2 as any);
router.use('/auth/me', accessController.getMe as any);
router.use('/auth/logout', accessController.logout as any);

//* Workspace
router.use('', workspaceRouter);

//* Board
router.use('', boardRouter);

//* Column
router.use('', columnRouter);

//* Group
router.use('', groupRouter);

//* Task
router.use('', taskRouter);

export default router;
