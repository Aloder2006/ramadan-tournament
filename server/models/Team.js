const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'اسم الفريق مطلوب'],
            trim: true,
        },
        group: {
            type: String,
            required: [true, 'المجموعة مطلوبة'],
            // No enum — supports dynamic groups from tournament.config.js
        },
        played: { type: Number, default: 0 },
        won: { type: Number, default: 0 },
        drawn: { type: Number, default: 0 },
        lost: { type: Number, default: 0 },
        gf: { type: Number, default: 0 },
        ga: { type: Number, default: 0 },
        gd: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
