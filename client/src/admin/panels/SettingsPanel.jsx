import { useState, useEffect } from 'react';
import { useAdmin } from '../AdminContext';
import { updateSettings } from '../../services/api';

const LOGO_EMOJIS = ['⚽', '🏆', '🥇', '🌙', '⭐', '🦅', '🔥', '🌟', '🕌', '🏅'];
const FONT_OPTIONS = [
    { value: 'Tajawal', label: 'Tajawal — عصري' },
    { value: 'Cairo', label: 'Cairo — واضح' },
    { value: 'Lalezar', label: 'Lalezar — ديكوري' },
    { value: 'Rubik', label: 'Rubik — حديث' },
    { value: 'Amiri', label: 'Amiri — كلاسيكي' },
    { value: 'Inter', label: 'Inter — تقني' },
];
const COLOR_THEMES = [
    { id: 'dark-gold', label: 'ذهبي داكن', primary: '#e2b04a', vars: { primaryColor: '#e2b04a', secondaryColor: '#3dba72', colorBgBase: '#0f1117', colorBgCard: '#1c2130', colorBorder: '#252d3d', colorTextPrimary: '#dde2ed', colorSuccess: '#3dba72', colorDanger: '#e04b4b', colorIndigo: '#6c76e8' } },
    { id: 'ramadan-green', label: 'رمضاني أخضر', primary: '#4ade80', vars: { primaryColor: '#4ade80', secondaryColor: '#facc15', colorBgBase: '#0a1a0f', colorBgCard: '#0f2318', colorBorder: '#1a3a25', colorTextPrimary: '#d4f0d8', colorSuccess: '#4ade80', colorDanger: '#f87171', colorIndigo: '#a78bfa' } },
    { id: 'night-blue', label: 'أزرق ليلي', primary: '#60a5fa', vars: { primaryColor: '#60a5fa', secondaryColor: '#a78bfa', colorBgBase: '#060b18', colorBgCard: '#0d1630', colorBorder: '#1a2545', colorTextPrimary: '#d0d8f0', colorSuccess: '#34d399', colorDanger: '#f87171', colorIndigo: '#818cf8' } },
    { id: 'desert', label: 'صحراوي', primary: '#fb923c', vars: { primaryColor: '#fb923c', secondaryColor: '#fbbf24', colorBgBase: '#140e08', colorBgCard: '#1f160a', colorBorder: '#3a2a15', colorTextPrimary: '#f0dfc5', colorSuccess: '#4ade80', colorDanger: '#f87171', colorIndigo: '#c084fc' } },
    { id: 'classic-red', label: 'كلاسيكي أحمر', primary: '#ef4444', vars: { primaryColor: '#ef4444', secondaryColor: '#f59e0b', colorBgBase: '#0f0a0a', colorBgCard: '#1a0f0f', colorBorder: '#2e1a1a', colorTextPrimary: '#ede8e8', colorSuccess: '#22c55e', colorDanger: '#ef4444', colorIndigo: '#a855f7' } },
];

export function applySettingsColors(s) {
    if (!s) return;
    const r = document.documentElement;
    const set = (v, val) => val && r.style.setProperty(v, val);
    set('--gold', s.primaryColor);
    set('--success', s.secondaryColor);
    set('--bg-base', s.colorBgBase);
    set('--bg-elevated', s.colorBgBase ? `color-mix(in srgb, ${s.colorBgBase} 60%, white 3%)` : null);
    set('--bg-card', s.colorBgCard);
    set('--bg-input', s.colorBgBase);
    set('--bg-hover', s.colorBgCard ? `color-mix(in srgb, ${s.colorBgCard} 80%, white 5%)` : null);
    set('--border', s.colorBorder);
    set('--border-light', s.colorBorder ? `color-mix(in srgb, ${s.colorBorder} 60%, white 10%)` : null);
    set('--text-primary', s.colorTextPrimary);
    set('--danger', s.colorDanger);
    set('--indigo', s.colorIndigo);
    if (s.primaryColor) { r.style.setProperty('--gold-dim', s.primaryColor + '22'); r.style.setProperty('--gold-border', s.primaryColor + '55'); }
    if (s.colorSuccess || s.secondaryColor) r.style.setProperty('--success-dim', (s.colorSuccess || s.secondaryColor) + '1f');
    if (s.bodyFont) document.body.style.fontFamily = `'${s.bodyFont}', 'Tajawal', sans-serif`;
}

function Field({ label, children }) {
    return <div className="form-group"><label className="form-label">{label}</label>{children}</div>;
}

function ColorField({ label, value, onChange }) {
    return (
        <Field label={label}>
            <div className="adm-color-row">
                <input type="color" className="adm-color-swatch" value={value || '#000000'} onChange={e => onChange(e.target.value)} />
                <input className="form-input adm-color-hex" value={value || ''} maxLength={7} onChange={e => onChange(e.target.value)} placeholder="#rrggbb" />
            </div>
        </Field>
    );
}

export default function SettingsPanel() {
    const { settings, fetchAll } = useAdmin();
    const [d, setD] = useState({ name: '', subtitle: '', emoji: '⚽', customEmoji: '', logoFont: 'Lalezar', bodyFont: 'Tajawal', primaryColor: '#e2b04a', secondaryColor: '#3dba72', colorBgBase: '#0f1117', colorBgCard: '#1c2130', colorBorder: '#252d3d', colorTextPrimary: '#dde2ed', colorSuccess: '#3dba72', colorDanger: '#e04b4b', colorIndigo: '#6c76e8' });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        if (!settings) return;
        setD({
            name: settings.tournamentName || '', subtitle: settings.subtitle || '',
            emoji: settings.logoEmoji || '⚽', customEmoji: '', logoFont: settings.logoFont || 'Lalezar',
            bodyFont: settings.bodyFont || 'Tajawal', primaryColor: settings.primaryColor || '#e2b04a',
            secondaryColor: settings.secondaryColor || '#3dba72', colorBgBase: settings.colorBgBase || '#0f1117',
            colorBgCard: settings.colorBgCard || '#1c2130', colorBorder: settings.colorBorder || '#252d3d',
            colorTextPrimary: settings.colorTextPrimary || '#dde2ed', colorSuccess: settings.colorSuccess || '#3dba72',
            colorDanger: settings.colorDanger || '#e04b4b', colorIndigo: settings.colorIndigo || '#6c76e8',
        });
    }, [settings]);

    const set = (k) => (v) => setD(p => ({ ...p, [k]: v }));
    const applyTheme = (t) => { const v = t.vars; setD(p => ({ ...p, ...v })); };

    const save = async () => {
        setSaving(true);
        try {
            const emoji = d.customEmoji.trim() || d.emoji;
            const payload = { tournamentName: d.name, subtitle: d.subtitle, logoEmoji: emoji, logoFont: d.logoFont, bodyFont: d.bodyFont, primaryColor: d.primaryColor, secondaryColor: d.secondaryColor, colorBgBase: d.colorBgBase, colorBgCard: d.colorBgCard, colorBorder: d.colorBorder, colorTextPrimary: d.colorTextPrimary, colorSuccess: d.colorSuccess, colorDanger: d.colorDanger, colorIndigo: d.colorIndigo };
            await updateSettings(payload);
            applySettingsColors(payload);
            setMsg('تم الحفظ'); fetchAll();
        } catch { setMsg('فشل الحفظ'); }
        setSaving(false);
        setTimeout(() => setMsg(''), 3500);
    };

    const finalEmoji = d.customEmoji.trim() || d.emoji;

    return (
        <div className="adm-settings">
            <div className="adm-panel-header"><h2 className="adm-panel-title">إعدادات البطولة</h2></div>

            {/* Preview */}
            <div className="adm-settings-preview" style={{ background: d.colorBgBase, borderColor: d.primaryColor + '44' }}>
                <div className="adm-settings-preview-icon" style={{ background: d.primaryColor + '20', borderColor: d.primaryColor + '44' }}>{finalEmoji}</div>
                <div>
                    <div style={{ color: d.primaryColor, fontFamily: `'${d.logoFont}', sans-serif`, fontSize: '1.1rem', fontWeight: 800 }}>{d.name || 'اسم البطولة'}</div>
                    {d.subtitle && <div style={{ color: d.colorTextPrimary + '99', fontFamily: `'${d.bodyFont}', sans-serif`, fontSize: '.8rem' }}>{d.subtitle}</div>}
                </div>
            </div>

            {/* Identity */}
            <div className="adm-settings-section"><div className="adm-settings-section-title">هوية البطولة</div>
                <Field label="اسم البطولة"><input className="form-input" value={d.name} onChange={e => set('name')(e.target.value)} placeholder="دوري رمضان" /></Field>
                <Field label="النص الفرعي"><input className="form-input" value={d.subtitle} onChange={e => set('subtitle')(e.target.value)} placeholder="1447 هـ" /></Field>
                <Field label="رمز الشعار">
                    <div className="adm-emoji-grid">
                        {LOGO_EMOJIS.map(e => (<button key={e} className={`adm-emoji-btn ${d.emoji === e && !d.customEmoji ? 'active' : ''}`} onClick={() => { set('emoji')(e); set('customEmoji')(''); }}>{e}</button>))}
                        <input className="form-input adm-emoji-custom" value={d.customEmoji} onChange={e => set('customEmoji')(e.target.value)} placeholder="أو اكتب" maxLength={4} />
                    </div>
                </Field>
            </div>

            {/* Themes */}
            <div className="adm-settings-section"><div className="adm-settings-section-title">قوالب جاهزة</div>
                <div className="adm-theme-grid">
                    {COLOR_THEMES.map(t => (<button key={t.id} className="adm-theme-btn" onClick={() => applyTheme(t)} style={{ borderColor: t.primary + '66', color: t.primary, background: t.primary + '16' }}>{t.label}</button>))}
                </div>
            </div>

            {/* Colors */}
            <div className="adm-settings-section"><div className="adm-settings-section-title">الألوان</div>
                <div className="adm-color-grid">
                    <ColorField label="الرئيسي" value={d.primaryColor} onChange={set('primaryColor')} />
                    <ColorField label="الثانوي" value={d.secondaryColor} onChange={set('secondaryColor')} />
                    <ColorField label="الخلفية" value={d.colorBgBase} onChange={set('colorBgBase')} />
                    <ColorField label="البطاقات" value={d.colorBgCard} onChange={set('colorBgCard')} />
                    <ColorField label="الحدود" value={d.colorBorder} onChange={set('colorBorder')} />
                    <ColorField label="النص" value={d.colorTextPrimary} onChange={set('colorTextPrimary')} />
                    <ColorField label="النجاح" value={d.colorSuccess} onChange={set('colorSuccess')} />
                    <ColorField label="الخطر" value={d.colorDanger} onChange={set('colorDanger')} />
                    <ColorField label="البنفسجي" value={d.colorIndigo} onChange={set('colorIndigo')} />
                </div>
            </div>

            {/* Fonts */}
            <div className="adm-settings-section"><div className="adm-settings-section-title">الخطوط</div>
                <div className="adm-font-row">
                    <Field label="خط العناوين">
                        <select className="form-select" value={d.logoFont} onChange={e => set('logoFont')(e.target.value)}>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
                        <div className="adm-font-preview" style={{ color: d.primaryColor, fontFamily: `'${d.logoFont}', sans-serif` }}>معاينة — دوري رمضان</div>
                    </Field>
                    <Field label="خط النصوص">
                        <select className="form-select" value={d.bodyFont} onChange={e => set('bodyFont')(e.target.value)}>{FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}</select>
                        <div className="adm-font-preview" style={{ fontFamily: `'${d.bodyFont}', sans-serif` }}>معاينة — الفريق الأول</div>
                    </Field>
                </div>
            </div>

            {/* Save */}
            <div className="adm-save-row">
                <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</button>
                {msg && <span className={`adm-save-msg ${msg === 'تم الحفظ' ? 'msg-ok' : 'msg-err'}`}>{msg}</span>}
            </div>
        </div>
    );
}
