import { BadRequestError } from '../root/responseHandler/error.response';
import {
  ICreateGroupParams,
  IDeleteGroupParams,
  IUpdateAllGroupsParams,
  IUpdateGroupParams,
} from './interfaces/services';
import { performTransaction } from '../root/utils/performTransaction';
import { IGroupDoc } from './interfaces/group';
import Group from '../models/group';
import Board from '../models/board';

export default class GroupService {
  static async createGroup({ boardId, groups }: ICreateGroupParams) {
    let creatingNewGroupPromise: Promise<NonNullable<IGroupDoc>> | null = null;
    return await performTransaction(async (session) => {
      const workingAllGroupPromises = groups.map((group, index) => {
        if (group._id) {
          return Group.findByIdAndUpdatePosition({
            groupId: group._id,
            position: index,
            session,
          });
        } else {
          creatingNewGroupPromise = Group.createNewGroup({
            boardId,
            data: {
              ...group,
              position: index,
            },
            session,
          });
        }
      });

      if (!creatingNewGroupPromise)
        throw new BadRequestError('Missing some fields when create a new group');
      workingAllGroupPromises.unshift(creatingNewGroupPromise);
      const [createdNewGroup] = await Promise.all(workingAllGroupPromises);

      return createdNewGroup;
    });
  }

  static async updateGroup({ groupId, updationData, session = null }: IUpdateGroupParams) {
    const updatedGroup = await Group.findByIdAndUpdate(groupId, updationData, {
      new: true,
      session,
    }).lean();
    if (!updatedGroup) throw new BadRequestError('Group is not found');
    return updatedGroup;
  }

  static async updateAllGroups({ boardId, groups }: IUpdateAllGroupsParams) {
    const foundBoard = await Board.findById(boardId).lean();

    if (!foundBoard) throw new BadRequestError('Board is not founds');

    if (foundBoard.groups.length !== groups.length)
      throw new BadRequestError(
        'Please send all groups in a board to update all position of groups'
      );

    const totalNumOfGroups = groups.length;
    const totalDesiredPosition = (totalNumOfGroups * (0 + totalNumOfGroups - 1)) / 2;
    const totalPosition = groups.reduce((currTotal, group) => currTotal + group.position, 0);

    if (totalDesiredPosition !== totalPosition)
      throw new BadRequestError('Something wrong when transmitted position of groups');

    return await performTransaction(async (session) => {
      return await Group.updateAllPositionGroups({ groups, session });
    });
  }

  static async deleteGroup({ boardId, groupId, groups }: IDeleteGroupParams) {
    const foundBoard = await Board.findById(boardId);
    if (!foundBoard) throw new BadRequestError('Board is not found');

    if (foundBoard.groups.length === 1)
      throw new BadRequestError('Board has to have at least one group');

    if (foundBoard.groups.length - 1 !== groups.length)
      throw new BadRequestError('Please send all the groups when delete a column in board');

    return await performTransaction(async (session) => {
      await Group.deleteGroup({ boardDoc: foundBoard, groupId, session });
      await Group.updateAllPositionGroups({ groups, session });
    });
  }
}
