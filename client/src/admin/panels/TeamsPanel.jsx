import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { createTeam, updateTeam, deleteTeam } from '../../services/api';
import config from '../../tournament.config';

export default function TeamsPanel() {
    const { teams, fetchAll } = useAdmin();
    const [search, setSearch] = useState('');
    const [editId, setEditId] = useState(null);
    const [editName, setEditName] = useState('');
    const [editGroup, setEditGroup] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newGroup, setNewGroup] = useState(config.groups[0]);
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    const filtered = search
        ? teams.filter(t => t.name.includes(search) || t.group.includes(search))
        : teams;

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newName.trim()) return setAddError('أدخل اسم الفريق');
        setAddLoading(true); setAddError('');
        try {
            const res = await createTeam({ name: newName.trim(), group: newGroup });
            if (res.message && !res._id) throw new Error(res.message);
            setNewName(''); setShowAdd(false); fetchAll();
        } catch (err) { setAddError(err.message); }
        setAddLoading(false);
    };

    const startEdit = (t) => { setEditId(t._id); setEditName(t.name); setEditGroup(t.group); };
    const saveEdit = async (id) => {
        await updateTeam(id, { name: editName, group: editGroup });
        setEditId(null); fetchAll();
    };
    const del = async (id) => {
        if (!window.confirm('حذف هذا الفريق وجميع مبارياته؟')) return;
        await deleteTeam(id); fetchAll();
    };

    return (
        <div className="adm-teams">
            {/* Header */}
            <div className="adm-panel-header">
                <div className="adm-panel-header-right">
                    <h2 className="adm-panel-title">إدارة الفرق</h2>
                    <span className="adm-count-badge">{teams.length} فريق</span>
                </div>
                <button className={`btn ${showAdd ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={() => setShowAdd(!showAdd)}>
                    {showAdd ? '✕ إغلاق' : '+ إضافة فريق'}
                </button>
            </div>

            {/* Add Form */}
            {showAdd && (
                <div className="adm-add-card">
                    <form onSubmit={handleAdd} className="adm-add-form">
                        <div className="adm-add-row">
                            <div className="form-group" style={{ flex: 2 }}>
                                <label className="form-label">اسم الفريق</label>
                                <input className="form-input" value={newName} onChange={e => setNewName(e.target.value)} placeholder="أدخل اسم الفريق..." autoFocus />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">المجموعة</label>
                                <select className="form-select" value={newGroup} onChange={e => setNewGroup(e.target.value)}>
                                    {config.groups.map(g => <option key={g} value={g}>المجموعة {g}</option>)}
                                </select>
                            </div>
                            <button className="btn btn-primary" type="submit" disabled={addLoading} style={{ alignSelf: 'flex-end' }}>
                                {addLoading ? '...' : '+ إضافة'}
                            </button>
                        </div>
                        {addError && <div className="adm-inline-error">{addError}</div>}
                    </form>
                </div>
            )}

            {/* Search */}
            <div className="adm-search-bar">
                <span className="adm-search-icon">🔍</span>
                <input className="adm-search-input" placeholder="بحث عن فريق..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {/* Table */}
            <div className="adm-table-wrap">
                <table className="adm-table">
                    <thead>
                        <tr>
                            <th style={{ width: 36 }}>#</th>
                            <th style={{ textAlign: 'right', paddingRight: '.75rem' }}>الفريق</th>
                            <th>مج</th>
                            <th>نق</th>
                            <th>لع</th>
                            <th>ف</th>
                            <th>ت</th>
                            <th>خ</th>
                            <th>له</th>
                            <th>عل</th>
                            <th>±</th>
                            <th style={{ width: 72 }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="12" className="adm-empty-cell">لا يوجد فرق</td></tr>
                        ) : filtered.map((t, i) => (
                            <tr key={t._id} className={editId === t._id ? 'adm-row-editing' : ''}>
                                <td className="adm-row-num">{i + 1}</td>
                                <td style={{ textAlign: 'right', paddingRight: '.75rem' }}>
                                    <div className="adm-team-cell">
                                        <div className="adm-team-avatar">{t.name?.[0]}</div>
                                        {editId === t._id
                                            ? <input value={editName} onChange={e => setEditName(e.target.value)} className="form-input adm-inline-input" />
                                            : <span className="adm-team-name">{t.name}</span>}
                                    </div>
                                </td>
                                <td>
                                    {editId === t._id
                                        ? <select value={editGroup} onChange={e => setEditGroup(e.target.value)} className="form-select adm-inline-select">
                                            {config.groups.map(g => <option key={g} value={g}>{g}</option>)}
                                        </select>
                                        : <span className="badge badge-gold">{t.group}</span>}
                                </td>
                                <td className="adm-pts">{t.points}</td>
                                <td>{t.played}</td>
                                <td className="adm-win">{t.won}</td>
                                <td>{t.drawn}</td>
                                <td className="adm-loss">{t.lost}</td>
                                <td>{t.gf}</td>
                                <td>{t.ga}</td>
                                <td className={t.gd > 0 ? 'adm-gd-pos' : t.gd < 0 ? 'adm-gd-neg' : ''}>
                                    {t.gd > 0 ? `+${t.gd}` : t.gd}
                                </td>
                                <td>
                                    <div className="adm-row-actions">
                                        {editId === t._id ? <>
                                            <button className="btn btn-success btn-xs" onClick={() => saveEdit(t._id)}>✓</button>
                                            <button className="btn btn-ghost btn-xs" onClick={() => setEditId(null)}>✕</button>
                                        </> : <>
                                            <button className="btn btn-ghost btn-xs" onClick={() => startEdit(t)}>✏️</button>
                                            <button className="btn btn-danger btn-xs" onClick={() => del(t._id)}>🗑️</button>
                                        </>}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
