import { useState } from 'react';
import { createTeam } from '../services/api';
import config from '../tournament.config';

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
        <form onSubmit={handleSubmit} className="add-team-form">
            <div className="admin-form-row-3">
                <div className="form-group">
                    <label className="form-label">اسم الفريق</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="أدخل اسم الفريق..."
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">المجموعة</label>
                    <select className="form-select" value={group} onChange={e => setGroup(e.target.value)}>
                        {config.groups.map(g => <option key={g} value={g}>المجموعة {g}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-primary" type="submit" disabled={loading}>
                        {loading ? '...' : '+ إضافة'}
                    </button>
                </div>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
        </form>
    );
}
