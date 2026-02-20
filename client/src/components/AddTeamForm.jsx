import { useState } from 'react';
import { createTeam } from '../services/api';
import config from '../tournament.config';

const inp = (extra = {}) => ({ padding: '.48rem .7rem', background: 'var(--bg-input,#0f1117)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', fontSize: '.9rem', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box', ...extra });
const lbl = { display: 'block', fontSize: '.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.3rem' };

export default function AddTeamForm({ onTeamAdded }) {
    const [name, setName] = useState('');
    const [group, setGroup] = useState(config.groups[0] || 'أ');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return setError('أدخل اسم الفريق');
        setLoading(true); setError(''); setSuccess('');
        try {
            const result = await createTeam({ name: name.trim(), group });
            if (result.message) throw new Error(result.message);
            setSuccess(`تم إضافة "${result.name}" إلى المجموعة ${result.group}`);
            setName('');
            onTeamAdded?.(result);
        } catch (err) {
            setError(err.message || 'حدث خطأ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '.75rem', alignItems: 'flex-end' }}>
                <div>
                    <label style={lbl}>اسم الفريق</label>
                    <input
                        type="text"
                        placeholder="أدخل اسم الفريق..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={inp()}
                    />
                </div>
                <div>
                    <label style={lbl}>المجموعة</label>
                    <select value={group} onChange={e => setGroup(e.target.value)} style={inp({ minWidth: 110 })}>
                        {config.groups.map(g => <option key={g} value={g}>المجموعة {g}</option>)}
                    </select>
                </div>
                <button type="submit" disabled={loading} style={{ padding: '.48rem 1.1rem', border: 'none', borderRadius: 4, background: 'var(--gold)', color: '#000', fontWeight: 800, fontSize: '.9rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: loading ? .7 : 1, alignSelf: 'flex-end', height: 38 }}>
                    {loading ? '...' : 'إضافة'}
                </button>
            </div>
            {error && <div style={{ marginTop: '.55rem', padding: '.4rem .7rem', background: 'rgba(224,75,75,.1)', border: '1px solid var(--danger)', borderRadius: 4, fontSize: '.8rem', color: 'var(--danger)' }}>{error}</div>}
            {success && <div style={{ marginTop: '.55rem', padding: '.4rem .7rem', background: 'rgba(61,186,114,.1)', border: '1px solid var(--success)', borderRadius: 4, fontSize: '.8rem', color: 'var(--success)' }}>{success}</div>}
        </form>
    );
}
