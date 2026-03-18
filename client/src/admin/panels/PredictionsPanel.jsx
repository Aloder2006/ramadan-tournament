import { useState, useEffect, useCallback } from 'react';
import { getPredictions, deletePrediction, setFinalMatchStatus } from '../../services/api';
import { useAdmin } from '../AdminContext';

const STATUS_LABELS = {
    open:    { label: 'مفتوح',  icon: '🟢', desc: 'يمكن للجميع التوقع' },
    started: { label: 'بدأت',   icon: '🟡', desc: 'لا يمكن التوقع الآن' },
    ended:   { label: 'انتهت', icon: '🔴', desc: 'المباراة انتهت' },
};

export default function PredictionsPanel() {
    const { settings, fetchAll: reloadSettings } = useAdmin();
    const finalMatchStatus = settings?.finalMatchStatus || 'open';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [error, setError] = useState('');

    const fetchPredictions = useCallback(async () => {
        try {
            setLoading(true);
            const result = await getPredictions();
            setData(result);
        } catch (e) {
            setError(e.message || 'خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPredictions(); }, [fetchPredictions]);

    const handleStatusChange = async (newStatus) => {
        if (statusLoading || newStatus === finalMatchStatus) return;
        setStatusLoading(true);
        try {
            await setFinalMatchStatus(newStatus);
            await reloadSettings();
            if (newStatus === 'ended') await fetchPredictions(); // refresh to show correct flags
        } catch (e) {
            setError(e.message || 'خطأ في تحديث الحالة');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (deleteId) return;
        if (!window.confirm('هل تريد حذف هذا التوقع؟')) return;
        setDeleteId(id);
        try {
            await deletePrediction(id);
            setData(prev => ({
                ...prev,
                predictions: prev.predictions.filter(p => p._id !== id),
                total: prev.total - 1,
                correctCount: prev.predictions.find(p => p._id === id)?.isCorrect
                    ? prev.correctCount - 1
                    : prev.correctCount,
            }));
        } catch (e) {
            setError(e.message || 'خطأ في الحذف');
        } finally {
            setDeleteId(null);
        }
    };

    const formatDate = (iso) => {
        if (!iso) return '—';
        return new Date(iso).toLocaleString('ar-SA', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });
    };

    return (
        <div className="pred-panel" dir="rtl">
            {/* ── Header ── */}
            <div className="pred-panel-header">
                <h2 className="pred-panel-title">🎯 توقعات النهائي</h2>
                {data && (
                    <div className="pred-panel-stats">
                        <span className="pred-stat">
                            <strong>{data.total}</strong> توقع
                        </span>
                        {data.correctScore && (
                            <>
                                <span className="pred-stat pred-stat-score">
                                    النتيجة الصحيحة: <strong>{data.correctScore}</strong>
                                </span>
                                <span className="pred-stat pred-stat-correct">
                                    ✅ <strong>{data.correctCount}</strong> توقع صحيح
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ── Status Control ── */}
            <div className="pred-status-control">
                <span className="pred-status-label">حالة المباراة:</span>
                <div className="pred-status-btns">
                    {Object.entries(STATUS_LABELS).map(([key, val]) => (
                        <button
                            key={key}
                            className={`pred-status-btn ${finalMatchStatus === key ? 'pred-status-active' : ''}`}
                            onClick={() => handleStatusChange(key)}
                            disabled={statusLoading}
                            title={val.desc}
                        >
                            {val.icon} {val.label}
                        </button>
                    ))}
                </div>
                <span className="pred-status-desc">{STATUS_LABELS[finalMatchStatus]?.desc}</span>
            </div>

            {error && <div className="pred-panel-error">{error}</div>}

            {/* ── Table ── */}
            {loading ? (
                <div className="pred-loading">
                    <div className="adm-loading-spinner" />
                    <p>جاري التحميل...</p>
                </div>
            ) : data?.predictions?.length === 0 ? (
                <div className="pred-empty">
                    <span>😶</span>
                    <p>لا توجد توقعات بعد</p>
                </div>
            ) : (
                <div className="pred-table-wrap">
                    <table className="pred-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>رقم الهاتف</th>
                                <th>التوقع</th>
                                <th>التاريخ</th>
                                <th>النتيجة</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.predictions.map((p, i) => (
                                <tr
                                    key={p._id}
                                    className={p.isCorrect ? 'pred-row-correct' : ''}
                                >
                                    <td className="pred-num">{i + 1}</td>
                                    <td className="pred-phone">{p.phone}</td>
                                    <td className="pred-score-cell">
                                        <span className="pred-score-badge">
                                            {p.score1} – {p.score2}
                                        </span>
                                    </td>
                                    <td className="pred-date">{formatDate(p.updatedAt || p.createdAt)}</td>
                                    <td className="pred-result-cell">
                                        {finalMatchStatus === 'ended' ? (
                                            p.isCorrect
                                                ? <span className="pred-correct-badge">✅ صحيح</span>
                                                : <span className="pred-wrong-badge">❌ خطأ</span>
                                        ) : '—'}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(p._id)}
                                            disabled={deleteId === p._id}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
