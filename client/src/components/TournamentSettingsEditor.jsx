import { useState, useEffect } from 'react';
import { updateSettings } from '../services/api';

/* ─── constants ─── */
const LOGO_EMOJIS = ['⚽', '🏆', '🥇', '🌙', '⭐', '🦅', '🔥', '🌟', '🕌', '🏅'];

const FONT_OPTIONS = [
    { value: 'Tajawal', label: 'Tajawal — عصري' },
    { value: 'Cairo', label: 'Cairo — واضح' },
    { value: 'Lalezar', label: 'Lalezar — ديكوري' },
    { value: 'Rubik', label: 'Rubik — حديث' },
    { value: 'Amiri', label: 'Amiri — كلاسيكي' },
    { value: 'Oswald', label: 'Oswald — حاد' },
    { value: 'Barlow Condensed', label: 'Barlow — مضغوط' },
    { value: 'Inter', label: 'Inter — تقني' },
];

const COLOR_THEMES = [
    { id: 'dark-gold', label: 'ذهبي داكن', primary: '#e2b04a', vars: { primaryColor: '#e2b04a', secondaryColor: '#3dba72', colorBgBase: '#0f1117', colorBgCard: '#1c2130', colorBorder: '#252d3d', colorTextPrimary: '#dde2ed', colorSuccess: '#3dba72', colorDanger: '#e04b4b', colorIndigo: '#6c76e8' } },
    { id: 'ramadan-green', label: 'رمضاني أخضر', primary: '#4ade80', vars: { primaryColor: '#4ade80', secondaryColor: '#facc15', colorBgBase: '#0a1a0f', colorBgCard: '#0f2318', colorBorder: '#1a3a25', colorTextPrimary: '#d4f0d8', colorSuccess: '#4ade80', colorDanger: '#f87171', colorIndigo: '#a78bfa' } },
    { id: 'night-blue', label: 'أزرق ليلي', primary: '#60a5fa', vars: { primaryColor: '#60a5fa', secondaryColor: '#a78bfa', colorBgBase: '#060b18', colorBgCard: '#0d1630', colorBorder: '#1a2545', colorTextPrimary: '#d0d8f0', colorSuccess: '#34d399', colorDanger: '#f87171', colorIndigo: '#818cf8' } },
    { id: 'desert', label: 'صحراوي', primary: '#fb923c', vars: { primaryColor: '#fb923c', secondaryColor: '#fbbf24', colorBgBase: '#140e08', colorBgCard: '#1f160a', colorBorder: '#3a2a15', colorTextPrimary: '#f0dfc5', colorSuccess: '#4ade80', colorDanger: '#f87171', colorIndigo: '#c084fc' } },
    { id: 'classic-red', label: 'كلاسيكي أحمر', primary: '#ef4444', vars: { primaryColor: '#ef4444', secondaryColor: '#f59e0b', colorBgBase: '#0f0a0a', colorBgCard: '#1a0f0f', colorBorder: '#2e1a1a', colorTextPrimary: '#ede8e8', colorSuccess: '#22c55e', colorDanger: '#ef4444', colorIndigo: '#a855f7' } },
];

export function applySettingsColors(settings) {
    if (!settings) return;
    const root = document.documentElement;
    const set = (v, val) => val && root.style.setProperty(v, val);
    set('--gold', settings.primaryColor);
    set('--success', settings.secondaryColor);
    set('--bg-base', settings.colorBgBase);
    set('--bg-elevated', settings.colorBgBase ? `color-mix(in srgb, ${settings.colorBgBase} 60%, white 3%)` : null);
    set('--bg-card', settings.colorBgCard);
    set('--bg-input', settings.colorBgBase);
    set('--bg-hover', settings.colorBgCard ? `color-mix(in srgb, ${settings.colorBgCard} 80%, white 5%)` : null);
    set('--border', settings.colorBorder);
    set('--border-light', settings.colorBorder ? `color-mix(in srgb, ${settings.colorBorder} 60%, white 10%)` : null);
    set('--text-primary', settings.colorTextPrimary);
    set('--danger', settings.colorDanger);
    set('--indigo', settings.colorIndigo);
    if (settings.primaryColor) {
        root.style.setProperty('--gold-dim', settings.primaryColor + '22');
        root.style.setProperty('--gold-border', settings.primaryColor + '55');
    }
    if (settings.colorSuccess || settings.secondaryColor) {
        const s = settings.colorSuccess || settings.secondaryColor;
        root.style.setProperty('--success-dim', s + '1f');
    }
    if (settings.bodyFont) {
        document.body.style.fontFamily = `'${settings.bodyFont}', 'Tajawal', sans-serif`;
    }
}

/* ─── sub-components ─── */
function Field({ label, children }) {
    return (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {children}
        </div>
    );
}

function ColorField({ label, value, onChange }) {
    return (
        <Field label={label}>
            <div className="settings-color-row">
                <input type="color" className="settings-color-swatch" value={value || '#000000'} onChange={e => onChange(e.target.value)} />
                <input className="form-input settings-color-hex" value={value || ''} maxLength={7} onChange={e => onChange(e.target.value)} placeholder="#rrggbb" />
            </div>
        </Field>
    );
}

/* ─── section block ─── */
function Section({ title, children }) {
    return (
        <div className="settings-card">
            <div className="settings-card-header">{title}</div>
            <div className="settings-card-body">{children}</div>
        </div>
    );
}

/* ─── MAIN ─── */
export default function TournamentSettingsEditor({ settings, onSaved }) {
    const [name, setName] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [emoji, setEmoji] = useState('⚽');
    const [customEmoji, setCustomEmoji] = useState('');
    const [logoFont, setLogoFont] = useState('Lalezar');
    const [bodyFont, setBodyFont] = useState('Tajawal');
    const [primaryColor, setPrimary] = useState('#e2b04a');
    const [secondaryColor, setSecondary] = useState('#3dba72');
    const [colorBgBase, setBgBase] = useState('#0f1117');
    const [colorBgCard, setBgCard] = useState('#1c2130');
    const [colorBorder, setBorder] = useState('#252d3d');
    const [colorTextPrimary, setTextPrimary] = useState('#dde2ed');
    const [colorSuccess, setSuccess] = useState('#3dba72');
    const [colorDanger, setDanger] = useState('#e04b4b');
    const [colorIndigo, setIndigo] = useState('#6c76e8');
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!settings) return;
        setName(settings.tournamentName || '');
        setSubtitle(settings.subtitle || '');
        setEmoji(settings.logoEmoji || '⚽');
        setLogoFont(settings.logoFont || 'Lalezar');
        setBodyFont(settings.bodyFont || 'Tajawal');
        setPrimary(settings.primaryColor || '#e2b04a');
        setSecondary(settings.secondaryColor || '#3dba72');
        setBgBase(settings.colorBgBase || '#0f1117');
        setBgCard(settings.colorBgCard || '#1c2130');
        setBorder(settings.colorBorder || '#252d3d');
        setTextPrimary(settings.colorTextPrimary || '#dde2ed');
        setSuccess(settings.colorSuccess || '#3dba72');
        setDanger(settings.colorDanger || '#e04b4b');
        setIndigo(settings.colorIndigo || '#6c76e8');
    }, [settings]);

    const applyTheme = (t) => {
        const v = t.vars;
        setPrimary(v.primaryColor); setSecondary(v.secondaryColor);
        setBgBase(v.colorBgBase); setBgCard(v.colorBgCard);
        setBorder(v.colorBorder); setTextPrimary(v.colorTextPrimary);
        setSuccess(v.colorSuccess); setDanger(v.colorDanger); setIndigo(v.colorIndigo);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const finalEmoji = customEmoji.trim() || emoji;
            const payload = { tournamentName: name, subtitle, logoEmoji: finalEmoji, logoFont, bodyFont, primaryColor, secondaryColor, colorBgBase, colorBgCard, colorBorder, colorTextPrimary, colorSuccess, colorDanger, colorIndigo };
            await updateSettings(payload);
            applySettingsColors({ ...payload, bodyFont });
            setMsg('تم الحفظ');
            onSaved?.();
        } catch { setMsg('فشل الحفظ'); }
        setSaving(false);
        setTimeout(() => setMsg(''), 3500);
    };

    const finalEmoji = customEmoji.trim() || emoji;

    return (
        <div className="settings-editor">

            {/* ── LIVE PREVIEW ── */}
            <div className="settings-preview" style={{ background: colorBgBase, borderColor: primaryColor + '44' }}>
                <div className="settings-preview-icon" style={{ background: primaryColor + '20', borderColor: primaryColor + '44' }}>
                    {finalEmoji}
                </div>
                <div>
                    <div className="settings-preview-name" style={{ color: primaryColor, fontFamily: `'${logoFont}', sans-serif` }}>{name || 'اسم البطولة'}</div>
                    {subtitle && <div className="settings-preview-sub" style={{ color: colorTextPrimary + '99', fontFamily: `'${bodyFont}', sans-serif` }}>{subtitle}</div>}
                </div>
            </div>

            {/* ── IDENTITY ── */}
            <Section title="هوية البطولة">
                <Field label="اسم البطولة">
                    <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="دوري رمضان" />
                </Field>
                <Field label="النص الفرعي">
                    <input className="form-input" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="1447 هـ — 2026م" />
                </Field>
                <Field label="رمز الشعار">
                    <div className="settings-emoji-grid">
                        {LOGO_EMOJIS.map(e => (
                            <button key={e} className={`settings-emoji-btn ${emoji === e && !customEmoji ? 'active' : ''}`}
                                onClick={() => { setEmoji(e); setCustomEmoji(''); }}>{e}</button>
                        ))}
                        <input className="form-input settings-emoji-custom" value={customEmoji} onChange={e => setCustomEmoji(e.target.value)} placeholder="أو اكتب" maxLength={4} />
                    </div>
                </Field>
            </Section>

            {/* ── THEME PRESETS ── */}
            <Section title="قوالب جاهزة">
                <div className="settings-theme-grid">
                    {COLOR_THEMES.map(t => (
                        <button key={t.id} className="settings-theme-btn" onClick={() => applyTheme(t)}
                            style={{ borderColor: t.primary + '66', color: t.primary, background: t.primary + '16' }}>{t.label}</button>
                    ))}
                </div>
            </Section>

            {/* ── COLORS ── */}
            <Section title="الألوان">
                <div className="admin-form-row">
                    <ColorField label="اللون الرئيسي" value={primaryColor} onChange={setPrimary} />
                    <ColorField label="اللون الثانوي" value={secondaryColor} onChange={setSecondary} />
                    <ColorField label="خلفية الصفحة" value={colorBgBase} onChange={setBgBase} />
                    <ColorField label="خلفية البطاقات" value={colorBgCard} onChange={setBgCard} />
                    <ColorField label="الحدود" value={colorBorder} onChange={setBorder} />
                    <ColorField label="النص الرئيسي" value={colorTextPrimary} onChange={setTextPrimary} />
                    <ColorField label="لون النجاح" value={colorSuccess} onChange={setSuccess} />
                    <ColorField label="لون الخطر" value={colorDanger} onChange={setDanger} />
                    <ColorField label="البنفسجي" value={colorIndigo} onChange={setIndigo} />
                </div>
            </Section>

            {/* ── FONTS ── */}
            <Section title="الخطوط">
                <div className="admin-form-row" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                    <Field label="خط العناوين">
                        <select className="form-select" value={logoFont} onChange={e => setLogoFont(e.target.value)}>
                            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <div className="settings-font-preview" style={{ color: primaryColor, fontFamily: `'${logoFont}', sans-serif` }}>معاينة — دوري رمضان</div>
                    </Field>
                    <Field label="خط النصوص">
                        <select className="form-select" value={bodyFont} onChange={e => setBodyFont(e.target.value)}>
                            {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                        <div className="settings-font-preview" style={{ fontFamily: `'${bodyFont}', sans-serif` }}>معاينة — الفريق الأول 3 - 1 الثاني</div>
                    </Field>
                </div>
            </Section>

            {/* ── SAVE ── */}
            <div className="settings-save-row">
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
                {msg && <span className={`settings-save-msg ${msg === 'تم الحفظ' ? 'msg-success' : 'msg-error'}`}>{msg}</span>}
            </div>
        </div>
    );
}
