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
    // ── Tournament Identity ──
    tournamentName: { type: String, default: 'دوري رمضان' },
    subtitle: { type: String, default: '1447 هـ - 2026 م' },
    logoEmoji: { type: String, default: '⚽' },
    // ── Colors ──
    primaryColor: { type: String, default: '#e2b04a' },
    secondaryColor: { type: String, default: '#4caf80' },
    // ── Fonts ──
    logoFont: { type: String, default: 'Lalezar' },
    bodyFont: { type: String, default: 'Tajawal' },
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
