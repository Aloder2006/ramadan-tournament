const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema(
    {
        team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
        group: {
            type: String,
            required: true,
            // No enum — supports dynamic groups from tournament.config.js
        },
        phase: {
            type: String,
            enum: ['groups', 'knockout'],
            default: 'groups',
        },
        status: {
            type: String,
            enum: ['Pending', 'Completed'],
            default: 'Pending',
        },
        score1: { type: Number, default: null },
        score2: { type: Number, default: null },
        redCards1: { type: Number, default: 0 },
        redCards2: { type: Number, default: 0 },
        isToday: { type: Boolean, default: false },
        matchDate: { type: Date, default: null },
        knockoutRound: { type: String, default: null },
        bracketPosition: { type: Number, default: null }, // 1-4 QF, 1-2 SF, 1 Final/3rd
        // Penalty shootout (only applies when score1 === score2 in KO)
        hasPenalties: { type: Boolean, default: false },
        penaltyScore1: { type: Number, default: null },
        penaltyScore2: { type: Number, default: null },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Match', matchSchema);
