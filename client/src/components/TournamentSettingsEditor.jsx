import { useState } from 'react';
import { updateSettings } from '../services/api';

const FONT_OPTIONS = [
    { value: 'Lalezar', label: 'Lalezar — كلاسيكي عريض' },
    { value: 'Cairo', label: 'Cairo — عصري' },
    { value: 'Tajawal', label: 'Tajawal — ناعم' },
    { value: 'Amiri', label: 'Amiri — رسمي' },
];

const EMOJI_OPTIONS = ['⚽', '🏆', '🌙', '⭐', '🔥', '🥇', '🎯', '⚡'];

export default function TournamentSettingsEditor({ settings, onSaved }) {
    const [name, setName] = useState(settings?.tournamentName || 'دوري رمضان');
    const [subtitle, setSubtitle] = useState(settings?.subtitle || '1447 هـ - 2026 م');
    const [logoEmoji, setLogoEmoji] = useState(settings?.logoEmoji || '⚽');
    const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor || '#e2b04a');
    const [secondaryColor, setSecondaryColor] = useState(settings?.secondaryColor || '#4caf80');
    const [logoFont, setLogoFont] = useState(settings?.logoFont || 'Lalezar');
    const [bodyFont, setBodyFont] = useState(settings?.bodyFont || 'Tajawal');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSettings({ tournamentName: name, subtitle, logoEmoji, primaryColor, secondaryColor, logoFont, bodyFont });
            setMsg('✅ تم حفظ الإعدادات');
            onSaved?.();
        } catch {
            setMsg('❌ حدث خطأ');
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(''), 3000);
        }
    };

    return (
        <div className="settings-editor">
            {/* Live Preview */}
            <div className="settings-preview" style={{ borderColor: primaryColor }}>
                <span className="settings-preview-emoji">{logoEmoji}</span>
                <div>
                    <div className="settings-preview-name"
                        style={{ color: primaryColor, fontFamily: `'${logoFont}', sans-serif` }}>
                        {name || 'اسم البطولة'}
                    </div>
                    <div className="settings-preview-sub" style={{ color: secondaryColor }}>
                        {subtitle}
                    </div>
                </div>
            </div>

            <div className="settings-editor-grid">
                {/* Tournament Name */}
                <div className="form-group">
                    <label className="form-label">🏷️ اسم البطولة</label>
                    <input className="form-input" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="دورة شبرا الرمضانيه" />
                </div>

                {/* Subtitle */}
                <div className="form-group">
                    <label className="form-label">📝 السطر الثانوي</label>
                    <input className="form-input" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                        placeholder="1447 هـ - 2026 م" />
                </div>

                {/* Logo Emoji */}
                <div className="form-group">
                    <label className="form-label">🎨 شعار / إيموجي</label>
                    <div className="emoji-picker">
                        {EMOJI_OPTIONS.map(e => (
                            <button key={e} type="button"
                                className={`emoji-btn ${logoEmoji === e ? 'emoji-selected' : ''}`}
                                onClick={() => setLogoEmoji(e)}>
                                {e}
                            </button>
                        ))}
                        <input
                            className="form-input emoji-custom-input"
                            value={logoEmoji}
                            onChange={(e) => setLogoEmoji(e.target.value)}
                            maxLength={4}
                            placeholder="أو اكتب إيموجي"
                        />
                    </div>
                </div>

                {/* Colors */}
                <div className="form-group">
                    <label className="form-label">🎨 اللون الأساسي (ذهبي)</label>
                    <div className="color-picker-row">
                        <input type="color" className="color-swatch" value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)} />
                        <input className="form-input color-hex-input" value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">🎨 اللون الثانوي (أخضر)</label>
                    <div className="color-picker-row">
                        <input type="color" className="color-swatch" value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)} />
                        <input className="form-input color-hex-input" value={secondaryColor}
                            onChange={(e) => setSecondaryColor(e.target.value)} />
                    </div>
                </div>

                {/* Fonts */}
                <div className="form-group">
                    <label className="form-label">🔤 خط العنوان</label>
                    <select className="form-select" value={logoFont} onChange={(e) => setLogoFont(e.target.value)}>
                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">🔤 خط النصوص</label>
                    <select className="form-select" value={bodyFont} onChange={(e) => setBodyFont(e.target.value)}>
                        {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                    </select>
                </div>
            </div>

            <div className="settings-save-row">
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    {saving ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات'}
                </button>
                {msg && <span className={msg.includes('✅') ? 'inline-ok' : 'inline-err'}>{msg}</span>}
            </div>
        </div>
    );
}
