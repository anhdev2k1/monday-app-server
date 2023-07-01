"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleValueTypes = exports.SingleValueTypes = exports.multipleValueTypes = exports.MultipleValueTypes = void 0;
var MultipleValueTypes;
(function (MultipleValueTypes) {
    MultipleValueTypes["STATUS"] = "Status";
    MultipleValueTypes["PRIORITY"] = "Priority";
    MultipleValueTypes["LABEL"] = "Label";
})(MultipleValueTypes = exports.MultipleValueTypes || (exports.MultipleValueTypes = {}));
exports.multipleValueTypes = {
    status: {
        name: MultipleValueTypes.STATUS,
        icon: `${process.env.SERVER_URL}/v1/api/images/status-column-icon.svg`,
        color: '#11dd80',
    },
    priority: {
        name: MultipleValueTypes.PRIORITY,
        icon: `${process.env.SERVER_URL}/v1/api/images/priority-column-icon.png`,
        color: '#feca00',
    },
    label: {
        name: MultipleValueTypes.LABEL,
        icon: `${process.env.SERVER_URL}/v1/api/images/label-column-icon.png`,
        color: '#a358df',
    },
};
var SingleValueTypes;
(function (SingleValueTypes) {
    SingleValueTypes["DATE"] = "Date";
    SingleValueTypes["NUMBER"] = "Number";
    SingleValueTypes["TEXT"] = "Text";
})(SingleValueTypes = exports.SingleValueTypes || (exports.SingleValueTypes = {}));
exports.singleValueTypes = {
    date: {
        name: SingleValueTypes.DATE,
        icon: `${process.env.SERVER_URL}/v1/api/images/date-column-icon.svg`,
        color: '#11dd80',
    },
    number: {
        name: SingleValueTypes.NUMBER,
        icon: `${process.env.SERVER_URL}/v1/api/images/numeric-column-icon.svg`,
        color: '#ffcc00',
    },
    text: {
        name: SingleValueTypes.TEXT,
        icon: `${process.env.SERVER_URL}/v1/api/images/text-column-icon.svg`,
        color: '#00a9ff',
    },
};
