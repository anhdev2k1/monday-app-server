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
const mongoose_1 = require("mongoose");
const db_1 = __importDefault(require("../root/db"));
const utils_1 = require("../root/utils");
const task_1 = __importDefault(require("./task"));
const DOCUMENT_NAME = 'TasksColumns';
const COLLECTION_NAME = 'TasksColumnss';
// Declare the Schema of the Mongo model
var tasksColumnsSchema = new mongoose_1.Schema({
    value: {
        type: String,
        default: null,
    },
    valueId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'DefaultValue',
        default: null,
    },
    typeOfValue: {
        type: String,
        required: true,
    },
    belongColumn: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Column',
    },
    belongTask: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Task',
    },
}, {
    collection: COLLECTION_NAME,
    timestamps: true,
});
tasksColumnsSchema.static('createNewTasksColumns', function createNewTasksColumns({ data, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const [createdNewTasksColumns] = yield this.create([Object.assign({}, data)], { session });
        return createdNewTasksColumns;
    });
});
tasksColumnsSchema.static('createTasksColumnsByColumn', function createTasksColumnsByColumn({ boardDoc, columnDoc, defaultValues, position, session, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const boardWithGroups = yield boardDoc.populate({
            path: 'groups',
            options: {
                sort: { position: 1 },
            },
            populate: {
                path: 'tasks',
                options: {
                    sort: { position: 1 },
                },
            },
        });
        // const tasks = (boardWithGroups.groups as NonNullable<IGroupDoc>[]).reduce(
        //   (currTasks: NonNullable<ITaskDoc>[], group) => {
        //     currTasks.push(...(group.tasks as NonNullable<ITaskDoc>[]));
        //     return currTasks;
        //   },
        //   []
        // );
        const tasks = boardWithGroups.groups.flatMap((group) => group.tasks);
        const updatingTaskPromises = tasks.map((task) => (0, utils_1.createSetOfTasksColumnsByColumn)({
            columnId: columnDoc._id,
            defaultValue: defaultValues.at(-1),
            taskDoc: task,
            position,
            typeOfValue: defaultValues.length !== 0 ? 'multiple' : 'single',
            session,
        }));
        const tasksColumns = yield Promise.all(updatingTaskPromises);
        return tasksColumns;
    });
});
tasksColumnsSchema.static('deleteTasksColumnsByColumn', function deleteTasksColumnsByColumn({ tasksColumnsDoc }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield task_1.default.findByIdAndUpdate(tasksColumnsDoc.belongTask, {
            $pull: {
                values: tasksColumnsDoc._id,
            },
        });
        yield tasksColumnsDoc.deleteOne();
    });
});
//Export the model
const TasksColumns = db_1.default.model(DOCUMENT_NAME, tasksColumnsSchema);
exports.default = TasksColumns;
