import { ClientSession, Model, Types } from 'mongoose';
import { Doc, DocObj } from '../../root/app.interfaces';
import { ITypeDoc } from './type';
import { IDefaultValue } from '../../08-value/interfaces/defaultValue';

export interface IColumn {
  name: string;
  position: number;
  belongType: Types.ObjectId;
}

/////////////////////////////////////
/////////////////////////////////////
/////////////////////////////////////

export interface ICreateNewColumns {
  boardId: string | Types.ObjectId;
  typeDoc?: ITypeDoc;
  position?: number;
  session: ClientSession;
}

export interface ICreateNewColumnsResult {
  createdNewColumns: NonNullable<IColumnDoc>[];
  defaultValue?: IDefaultValue | null;
  tasksColumnsIds?: Types.ObjectId[];
}

export interface IDeleteColumn {
  boardId?: string;
  columnId: Types.ObjectId | string;
  session: ClientSession;
}

// For instance methods

export type IColumnDoc = Doc<IColumn, IColumnMethods>;
export type IColumnDocObj = DocObj<IColumn>;

export interface IColumnMethods {}

// For statics
export interface ColumnModel extends Model<IColumn, {}, IColumnMethods> {
  createNewColumns({
    boardId,
    typeDoc,
    position,
    session,
  }: ICreateNewColumns): Promise<ICreateNewColumnsResult>;
  deleteColumn({ boardId, columnId, session }: IDeleteColumn): Promise<null>;
}
