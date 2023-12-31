import { Schema, Types } from 'mongoose';
import {
  ICreateNewTask,
  ICreateNewTasks,
  IDeleteAllTasksInGroup,
  IDeleteTask,
  IFindByIdAndUpdatePosition,
  ITask,
  ITaskDoc,
  ITaskMethods,
  IUpdateAllPositionTasks,
  IUpdateAllPositionsInValue,
  TaskModel,
} from '../07-task/interfaces/task';
import db from '../root/db';
import Group from './group';
import { BadRequestError, NotFoundError } from '../root/responseHandler/error.response';
import { createSetOfTasksColumnsByTask, createSetOfTasksColumnsByTask1 } from '../root/utils';
import TasksColumns from './tasksColumns';
import Board from './board';
import { IColumnDoc } from '../05-column/interfaces/column';
import validator from 'validator';

const DOCUMENT_NAME = 'Task';
const COLLECTION_NAME = 'Tasks';

// Declare the Schema of the Mongo model
var taskSchema = new Schema<ITask, TaskModel, ITaskMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    values: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'TasksColumns',
        },
      ],
      default: [],
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

taskSchema.static(
  'findByIdAndUpdatePosition',
  async function findByIdAndUpdatePosition({
    taskId,
    position,
    session,
  }: IFindByIdAndUpdatePosition): Promise<NonNullable<ITaskDoc>> {
    const updatedTask = await this.findByIdAndUpdate(
      taskId,
      {
        $set: {
          position: position,
        },
      },
      { new: true, session }
    );

    if (!updatedTask) throw new NotFoundError(`Task with ${taskId} is not found`);
    return updatedTask;
  }
);

taskSchema.static(
  'createNewTask',
  async function createNewTask({ boardId, groupDoc, data, session }: ICreateNewTask) {
    const foundBoard = await Board.findById(boardId, {}, { session })
      .populate({
        path: 'columns',
        select: '_id name position defaultValues',
        options: {
          sort: { position: 1 },
        },
        populate: {
          path: 'defaultValues',
          select: '_id value color canEditColor',
          match: {
            canEditColor: false,
          },
        },
      })
      .lean();

    if (!foundBoard) throw new NotFoundError('Board is not found');

    const [createdNewTask] = (await this.create([{ ...data }], {
      session,
    })) as NonNullable<ITaskDoc>[];

    await groupDoc.updateOne(
      {
        $push: {
          tasks: createdNewTask!._id,
        },
      },
      { new: true, session }
    );

    const createdNewTasksColumns = await createSetOfTasksColumnsByTask({
      columns: foundBoard.columns as NonNullable<IColumnDoc>[],
      taskDoc: createdNewTask,
      session,
    });

    const updatedTask = await Task.findByIdAndUpdate(
      createdNewTask._id,
      {
        $set: {
          values: createdNewTasksColumns.map((tasksColumns) => tasksColumns._id),
        },
      },
      { new: true, session }
    );

    return await updatedTask!.populate({
      path: 'values',
      select: '_id value valueId belongColumn typeOfValue',
      populate: {
        path: 'valueId',
        select: '_id value color',
      },
    });
  }
);

taskSchema.static(
  'updateAllPositionsInValue',
  async function updateAllColumn({
    changedPositions,
    desiredPositions,
    taskId,
    session,
  }: IUpdateAllPositionsInValue) {
    const foundTask = await this.findById(taskId);
    if (!foundTask) throw new NotFoundError('Task is not found');
    const values = foundTask.values;
    const changedPositionValues = changedPositions.map(
      (changedPosition) => values[changedPosition]
    );
    desiredPositions.forEach((desiredPosition, index) => {
      values[desiredPosition] = changedPositionValues[index];
    });

    await foundTask.updateOne(
      {
        $set: {
          values: values,
        },
      },
      { session }
    );
  }
);

taskSchema.static(
  'createNewTasks',
  async function createNewTasks({ columns, selectedDefaultValues, session }: ICreateNewTasks) {
    // Get all values default of these columns

    const taskObjs: ITask[] = [
      { name: 'Task 1', position: 0, values: [] },
      { name: 'Task 2', position: 1, values: [] },
      { name: 'Task 1', position: 0, values: [] },
      { name: 'Task 2', position: 1, values: [] },
    ];

    const createdInsertTasks = (await this.insertMany(taskObjs, {
      session,
    })) as NonNullable<ITaskDoc>[];
    const updatingCreatedTasks = createdInsertTasks.map((task) =>
      createSetOfTasksColumnsByTask1({
        selectedDefaultValues,
        columns,
        taskDoc: task,
        session,
      })
    );

    const createdNewTasks = await Promise.all(updatingCreatedTasks);

    return createdNewTasks;
  }
);

taskSchema.static(
  'updateAllPositionTasks',
  async function updateAllPositionTasks({
    tasks,
    session,
  }: IUpdateAllPositionTasks): Promise<NonNullable<ITaskDoc>[]> {
    const updatingAllTaskPromises = tasks.map((task, index) =>
      this.findByIdAndUpdatePosition({ taskId: task._id, position: index, session })
    );

    return await Promise.all(updatingAllTaskPromises);
  }
);

taskSchema.static(
  'deleteTask',
  async function deleteTask({ groupDoc, taskId, session }: IDeleteTask) {
    if (!validator.isMongoId(taskId.toString()))
      throw new BadRequestError(`Task Id: ${taskId} is invalid`);

    const deletedTask = await this.findByIdAndDelete(taskId, { session });
    if (!deletedTask) throw new NotFoundError('Task is not found');

    if (groupDoc) {
      await groupDoc.updateOne(
        {
          $pull: {
            tasks: deletedTask._id,
          },
        },
        { session }
      );

      const foundAllTasksInGroup = await this.find(
        {
          _id: { $in: groupDoc.tasks },
        },
        {},
        { session }
      ).sort({ position: 1 });

      const slicedTasks = foundAllTasksInGroup.slice(deletedTask.position);

      const updatingPositionAllTasksPromises = slicedTasks.map((task, index) =>
        task.updateOne(
          {
            $set: {
              position: deletedTask.position + index,
            },
          },
          { session }
        )
      );

      await Promise.all(updatingPositionAllTasksPromises);
    }

    await TasksColumns.deleteMany({ _id: { $in: deletedTask.values } }, { session });
  }
);

taskSchema.static(
  'deleteAllTasks',
  async function deleteAllTasks({ groupId, session }: IDeleteAllTasksInGroup) {
    const foundGroup = await Group.findById(groupId, {}, { session });
    if (!foundGroup) throw new NotFoundError('Group is not found');
    const deletingTaskPromises = foundGroup.tasks.map((task) =>
      this.deleteTask({ taskId: task as Types.ObjectId, session })
    );

    await Promise.all(deletingTaskPromises);
  }
);

//Export the model
const Task = db.model<ITask, TaskModel>(DOCUMENT_NAME, taskSchema);
export default Task;
