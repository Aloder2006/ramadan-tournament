const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    phase: {
        type: String,
        enum: ['groups', 'knockout'],
        default: 'groups',
    },
    qualifiedTeams: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    ],
    // Bracket seeding: 8 ordered slots for the bracket (slot 1 vs 2, 3 vs 4, etc.)
    bracketSlots: [
        {
            position: { type: Number }, // 1–8
            team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
        },
    ],
    // Tournament name for sharing images
    tournamentName: { type: String, default: 'دوري رمضان' },
});

settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            phase: 'groups',
            qualifiedTeams: [],
            bracketSlots: Array.from({ length: 8 }, (_, i) => ({ position: i + 1, team: null })),
        });
    }
    // Ensure 8 bracket slots always exist
    if (!settings.bracketSlots || settings.bracketSlots.length < 8) {
        settings.bracketSlots = Array.from({ length: 8 }, (_, i) => ({
            position: i + 1,
            team: settings.bracketSlots?.[i]?.team || null,
        }));
        await settings.save();
    }
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
