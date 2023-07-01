"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSetOfTasksColumnsByColumn = exports.createSetOfTasksColumnsByTask1 = exports.createSetOfTasksColumnsByTask = exports.getSelectData = exports.convertToArrObj = exports.getInfodata = void 0;
const lodash_1 = __importDefault(require("lodash"));
const tasksColumns_1 = __importDefault(require("../../models/tasksColumns"));
const task_1 = __importDefault(require("../../models/task"));
const getInfodata = ({ fields, object }) => {
    return lodash_1.default.pick(object, fields);
};
exports.getInfodata = getInfodata;
const convertToArrObj = ({ fields = [], objects }) => {
    return objects.map((obj) => (0, exports.getInfodata)({ fields, object: obj }));
};
exports.convertToArrObj = convertToArrObj;
const getSelectData = (select) => {
    return Object.fromEntries(select.map((el) => [el, 1]));
};
exports.getSelectData = getSelectData;
const createSetOfTasksColumnsByTask = ({ columns, session, taskDoc, }) => __awaiter(void 0, void 0, void 0, function* () {
    const creatingTasksColumnsPromises = columns.map((column) => tasksColumns_1.default.createNewTasksColumns({
        data: {
            value: '',
            valueId: column.defaultValues.length !== 0 ? column.defaultValues[0]._id : null,
            belongColumn: column._id,
            belongTask: taskDoc._id,
            typeOfValue: column.defaultValues.length !== 0 ? 'multiple' : 'single',
        },
        session,
    }));
    return yield Promise.all(creatingTasksColumnsPromises);
});
exports.createSetOfTasksColumnsByTask = createSetOfTasksColumnsByTask;
const createSetOfTasksColumnsByTask1 = ({ selectedDefaultValues, columns, session, taskDoc, }) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let result = null;
    for (const [i, column] of columns.entries()) {
        const createdNewTasksColumns = yield tasksColumns_1.default.create([
            {
                value: '',
                valueId: ((_a = selectedDefaultValues[i]) === null || _a === void 0 ? void 0 : _a._id) || null,
                belongColumn: column._id,
                belongTask: taskDoc._id,
                typeOfValue: selectedDefaultValues[i] ? 'multiple' : 'single',
            },
        ], { session });
        result = yield task_1.default.findByIdAndUpdate(taskDoc._id, {
            $push: {
                values: createdNewTasksColumns[0]._id,
            },
            new: true,
        }, { session });
    }
    return result;
});
exports.createSetOfTasksColumnsByTask1 = createSetOfTasksColumnsByTask1;
const createSetOfTasksColumnsByColumn = ({ columnId, defaultValue, taskDoc, position, typeOfValue, session, }) => __awaiter(void 0, void 0, void 0, function* () {
    const [createdNewTasksColumns] = yield tasksColumns_1.default.create([
        {
            value: '',
            valueId: defaultValue ? defaultValue._id : null,
            belongColumn: columnId,
            belongTask: taskDoc._id,
            typeOfValue,
        },
    ], { session });
    yield taskDoc.updateOne({
        $push: {
            values: {
                $each: [createdNewTasksColumns._id],
                $position: position,
            },
        },
    }, { new: true, session });
    return yield createdNewTasksColumns.populate({
        path: 'valueId',
        select: '_id value color',
    });
});
exports.createSetOfTasksColumnsByColumn = createSetOfTasksColumnsByColumn;
