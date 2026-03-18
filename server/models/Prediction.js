const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
    {
        phone: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        score1: { type: Number, required: true, min: 0, max: 99 },
        score2: { type: Number, required: true, min: 0, max: 99 },
        deviceId: { type: String, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Prediction', predictionSchema);
