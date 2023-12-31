import { Router } from 'express';
import boardController from './controller';

const boardRouter = Router();

boardRouter.post('/workspace/:workspaceId/board', boardController.createOne as any);

boardRouter
  .route('/board/:id')
  .get(boardController.getOne as any)
  .patch(boardController.updateOne as any);

boardRouter.delete('/workspace/:workspaceId/board/:id', boardController.deleteOne as any);

boardRouter.get('/board/:keySearch', boardController.searchBoards as any);

export default boardRouter;
