"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryTransform {
    constructor(query, requestQuery) {
        this.query = query;
        this.requestQuery = requestQuery;
    }
    filter() {
        const queryObj = Object.assign({}, this.requestQuery);
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach((el) => delete queryObj[el]);
        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort() {
        if (this.requestQuery.sort) {
            const sortBy = this.requestQuery.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        }
        else {
            this.query = this.query.sort('-updatedAt');
        }
        return this;
    }
    limitFields(fields) {
        if (this.requestQuery.fields) {
            const fields = this.requestQuery.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }
        else {
            this.query = this.query.select(fields);
        }
        this.query = this.query.select('-__v');
        return this;
    }
    paginate(isWorkspace = false) {
        const page = +this.requestQuery.page || 1;
        let limit = +this.requestQuery.limit || 10;
        limit = isWorkspace ? limit - 1 : limit;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
    getQuery() {
        return this.query.lean();
    }
}
exports.default = QueryTransform;
