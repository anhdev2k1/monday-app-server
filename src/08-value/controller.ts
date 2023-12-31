import { IFullController, IRequestWithAuth } from '../root/app.interfaces';
import { BadRequestError } from '../root/responseHandler/error.response';
import { CREATED, OK } from '../root/responseHandler/success.response';
import { Fn, catchAsync } from '../root/utils/catchAsync';
import ValueService from './service';

class ValueController<T extends IRequestWithAuth> implements IFullController<T> {
  getOne: Fn<T> = catchAsync(async (req, res, next) => {});

  getAll: Fn<T> = catchAsync(async (req, res, next) => {});

  createOne: Fn<T> = catchAsync(async (req, res, next) => {
    const createdNewValue = await ValueService.createValueByType({
      boardId: req.params.boardId,
      columnId: req.params.columnId,
      data: req.body,
      userId: req.user._id,
    });

    new CREATED({
      message: 'Create a new value by type successfully',
      metadata: {
        value: createdNewValue,
      },
    }).send(res);
  });

  selectValue: Fn<T> = catchAsync(async (req, res, next) => {
    const data = req.body as object;
    if (!data.hasOwnProperty('value') || !data.hasOwnProperty('valueId')) {
      throw new BadRequestError('Missing some fields');
    }

    const selectedValue = await ValueService.selectValue({
      tasksColumnsId: req.params.id,
      value: req.body.value,
      valueId: req.body.valueId,
    });

    new OK({
      message: 'Update value at task and column successfully',
      metadata: {
        value: selectedValue,
      },
    }).send(res);
  });

  updateOne: Fn<T> = catchAsync(async (req, res, next) => {
    const updatedValue = await ValueService.updateValueByType({
      defaultValueId: req.params.id,
      updationData: req.body,
    });

    new OK({
      message: 'Update value by type successfully',
      metadata: {
        value: updatedValue,
      },
    }).send(res);
  });

  deleteOne: Fn<T> = catchAsync(async (req, res, next) => {
    await ValueService.deleteValueByType({
      columnId: req.params.columnId,
      defaultValueId: req.params.id,
    });
    new OK({
      message: 'Delete a value by type successfully',
      metadata: null,
    }).send(res);
  });
}

const valueController = new ValueController();
export default valueController;
