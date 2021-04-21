const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WatchlistSchema = new Schema(
    {
        symbol: {
            type: String,
            unique: true,
            required: true
        },

        isCrypto: {
            type: Boolean,
            required: true
        },

        price: {
            type: Number
        },

        priceCurrency: {
            type: String
            // default = USD
        }
    }
);

const Watchlist = mongoose.model('Watchlist', WatchlistSchema);

module.exports = { Watchlist };