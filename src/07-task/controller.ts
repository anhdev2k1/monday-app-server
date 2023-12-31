import { IRequestWithAuth } from '../root/app.interfaces';
import { BadRequestError } from '../root/responseHandler/error.response';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import { ITaskController } from './interfaces/controller';
import TaskService from './service';

class TaskController<T extends IRequestWithAuth> implements ITaskController<T> {
  getAll: Fn<T> = catchAsync(async (req, res, next) => {});

  getOne: Fn<T> = catchAsync(async (req, res, next) => {
    const foundTask = await TaskService.getTask({
      taskId: req.params.id,
    });

    new OK({
      message: 'Get task successfully',
      metadata: {
        task: foundTask,
      },
    }).send(res);
  });

  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const createdNewTask = await TaskService.createTask({
      boardId: req.params.boardId,
      groupId: req.params.groupId,
      data: req.body,
    });

    new CREATED({
      message: 'Create a new task successfully',
      metadata: {
        task: createdNewTask,
      },
    }).send(res);
  });

  updateOne: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedTask = await TaskService.updateTask({
      taskId: req.params.id,
      updationData: req.body,
    });
    new OK({
      message: 'Update task successfully',
      metadata: {
        task: updatedTask,
      },
    }).send(res);
  });

  updateAllTasks: Fn<T> = catchAsync(async (req, res, next) => {
    const { tasks } = req.body;
    if (!tasks) throw new BadRequestError('Invalid transmitted data');
    const updatedAllTasks = await TaskService.updateAllTasks({
      groupId: req.params.groupId,
      tasks,
    });

    new OK({
      message: 'Update all tasks successfully',
      metadata: {
        tasks: updatedAllTasks,
      },
    }).send(res);
  });

  deleteTasks: Fn<T> = catchAsync(async (req, res, next) => {
    const { ids } = req.query;
    if (!ids) throw new BadRequestError('Missing some fields to delete tasks');
    const taskIds = (ids as string).split(',');
    await TaskService.deleteTasks({
      groupId: req.params.groupId,
      taskIds,
    });

    new OK({
      message: 'Delete tasks successfully',
      metadata: null,
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {});

  deleteAllTasksInGroup: Fn<T> = catchAsync(async (req, res, next) => {
    await TaskService.deleteAllTasksInGroup({
      groupId: req.params.groupId,
    });
    new OK({
      message: 'Delete all tasks in group successfully',
      metadata: null,
    }).send(res);
  });
}

const taskController = new TaskController();
export default taskController;
