const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const QuerySchema = new Schema(
    {
        symbol: {
            type: String,
            required: true
        },

        isCrypto: {
            type: Boolean,
            required: true
        },

        notifyAt: {
            type: String,
            required: true
        },

        targetValue: {
            type: Number,
            required: true
        },

        notifyIfBelow: {
            type: Boolean,
            required: true
        },

        isCompleted: {
            type: String,
            required: true
        },

        toCurrency: {
            type: String,
            required: false
        }
    }
);

const Query = mongoose.model('Query', QuerySchema);

module.exports = { Query };