import { useState, useEffect } from 'react';
import { submitPrediction, updatePrediction } from '../services/api';

const LS_KEY = 'ramadan_prediction';

function getStoredPrediction() {
    try {
        return JSON.parse(localStorage.getItem(LS_KEY) || 'null');
    } catch {
        return null;
    }
}

function getOrCreateDeviceId() {
    let id = localStorage.getItem('ramadan_device_id');
    if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
        localStorage.setItem('ramadan_device_id', id);
    }
    return id;
}

// team1Name / team2Name — optional, shown in the score row labels
export default function PredictionModal({ finalMatchStatus, team1Name, team2Name, onClose }) {
    const stored = getStoredPrediction();
    const isOpen = finalMatchStatus === 'open';

    const [score1, setScore1] = useState(stored ? String(stored.score1) : '');
    const [score2, setScore2] = useState(stored ? String(stored.score2) : '');
    const [phone, setPhone] = useState(stored ? stored.phone : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const isEdit = !!stored;

    const label1 = team1Name || 'الفريق الأول';
    const label2 = team2Name || 'الفريق الثاني';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const s1 = parseInt(score1);
        const s2 = parseInt(score2);
        if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0 || s1 > 99 || s2 > 99) {
            setError('أدخل نتيجة صحيحة بين 0 و 99');
            return;
        }
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length < 9 || cleanPhone.length > 15) {
            setError('أدخل رقم هاتف صحيح');
            return;
        }

        setLoading(true);
        try {
            if (isEdit && stored.predictionId) {
                const updated = await updatePrediction(stored.predictionId, {
                    score1: s1,
                    score2: s2,
                    phone: cleanPhone,
                });
                localStorage.setItem(LS_KEY, JSON.stringify({
                    predictionId: updated._id,
                    score1: updated.score1,
                    score2: updated.score2,
                    phone: updated.phone,
                }));
                setSuccess('تم تعديل توقعك بنجاح! ✅');
            } else {
                const deviceId = getOrCreateDeviceId();
                const created = await submitPrediction({ score1: s1, score2: s2, phone: cleanPhone, deviceId });
                localStorage.setItem(LS_KEY, JSON.stringify({
                    predictionId: created._id,
                    score1: created.score1,
                    score2: created.score2,
                    phone: created.phone,
                }));
                setSuccess('تم حفظ توقعك بنجاح! 🎯');
            }

            setTimeout(() => {
                setSuccess('');
                onClose?.();
            }, 1500);
        } catch (err) {
            if (err.status === 409) {
                setError('هذا الرقم مسجل مسبقاً. إذا كان رقمك، يمكنك تعديل توقعك من خلال الزر.');
            } else {
                setError(err.message || 'حدث خطأ، حاول مرة أخرى');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pred-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
            <div className="pred-modal" dir="rtl">

                {/* ── Header ── */}
                <div className="pred-header">
                    <div className="pred-header-icon">🎯</div>
                    <div>
                        <h2 className="pred-title">توقع نتيجة النهائي</h2>
                        <p className="pred-subtitle">من سيرفع الكأس؟ سجّل توقعك!</p>
                    </div>
                    {onClose && (
                        <button className="pred-close" onClick={onClose} aria-label="إغلاق">✕</button>
                    )}
                </div>

                {!isOpen ? (
                    <div className="pred-closed">
                        <span className="pred-closed-icon">🔒</span>
                        <p>التوقعات مغلقة — المباراة {finalMatchStatus === 'started' ? 'بدأت' : 'انتهت'}</p>
                    </div>
                ) : (
                    <form className="pred-form" onSubmit={handleSubmit}>

                        {/* Score Inputs */}
                        <div className="pred-score-row">
                            <div className="pred-score-box">
                                <label className="pred-label">{label1}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    className="pred-score-input"
                                    value={score1}
                                    onChange={e => setScore1(e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                            <div className="pred-score-sep">–</div>
                            <div className="pred-score-box">
                                <label className="pred-label">{label2}</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    className="pred-score-input"
                                    value={score2}
                                    onChange={e => setScore2(e.target.value)}
                                    placeholder="0"
                                    required
                                />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="pred-phone-row">
                            <label className="pred-label">رقم الهاتف</label>
                            <input
                                type="tel"
                                className="pred-phone-input"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="05XXXXXXXX"
                                required
                                disabled={isEdit}
                            />
                            {isEdit && (
                                <span className="pred-phone-note">لا يمكن تغيير الرقم — لتسجيل رقم آخر، امسح بيانات المتصفح</span>
                            )}
                        </div>

                        {error && <div className="pred-error">{error}</div>}
                        {success && <div className="pred-success">{success}</div>}

                        <button type="submit" className="pred-submit-btn" disabled={loading}>
                            {loading ? (
                                <span className="pred-spinner" />
                            ) : isEdit ? (
                                '💾 تعديل التوقع'
                            ) : (
                                '🎯 حفظ التوقع'
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
