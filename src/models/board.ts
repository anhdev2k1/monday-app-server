import { Schema } from 'mongoose';
import {
  BoardModel,
  IBoard,
  IBoardDoc,
  IBoardMethods,
  ICreateNewBoard,
  IDeleteBoard,
} from '../04-board/interfaces/board';
import db from '../root/db';
import Workspace from './workspace';
import { BadRequestError } from '../root/responseHandler/error.response';

const DOCUMENT_NAME = 'Board';
const COLLECTION_NAME = 'Boards';

// Declare the Schema of the Mongo model
var boardSchema = new Schema<IBoard, BoardModel, IBoardMethods>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    isCreatedView: {
      type: Boolean,
    },
    belongWorkspace: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Workspace',
    },
    groups: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Group',
        },
      ],
      default: [],
    },
    columns: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Column',
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

boardSchema.index({ name: 'text' });

boardSchema.static(
  'createNewBoard',
  async function createNewBoard({
    workspaceDoc,
    data,
    session,
  }: ICreateNewBoard): Promise<IBoardDoc> {
    const [createdNewBoard] = await this.create(
      [
        {
          ...data,
          belongWorkspace: workspaceDoc._id,
        },
      ],
      { session }
    );
    await workspaceDoc.updateOne({
      $push: {
        boards: createdNewBoard._id,
      },
    });

    // Create new 2 columns, 2 groups and each group will create 2 new task with default values of 2 created columns

    return createdNewBoard;
  }
);

boardSchema.static(
  'deleteBoard',
  async function deleteBoard({ workspaceId, boardId, session }: IDeleteBoard) {
    // Delete all columns and groups for each board
    const deletedBoard = await this.findByIdAndDelete(boardId, { session });
    if (!deletedBoard) throw new BadRequestError('Board is not found');
    if (workspaceId) {
      await Workspace.findByIdAndUpdate(workspaceId, {
        $pull: {
          boards: deletedBoard._id,
        },
      });
    }
  }
);

//Export the model
const Board = db.model<IBoard, BoardModel>(DOCUMENT_NAME, boardSchema);
export default Board;
