import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings, getMatches } from '../services/api';
import BracketTree from '../components/BracketTree';

export default function KnockoutPage() {
    const [settings, setSettings] = useState(null);
    const [knockoutMatches, setKnockoutMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const [settingsData, matchesData] = await Promise.all([
                    getSettings(),
                    getMatches('knockout'),
                ]);
                setSettings(settingsData);
                setKnockoutMatches(Array.isArray(matchesData) ? matchesData : []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="loading-screen">
            <div className="loader" />
            <p>جاري التحميل...</p>
        </div>
    );

    const hasKnockout = knockoutMatches.length > 0 || (settings?.bracketSlots?.some(s => s.team));

    // Get winner of the final
    const finalMatch = knockoutMatches.find(m => m.knockoutRound === 'النهائي' && m.status === 'Completed');
    const champion = finalMatch
        ? (finalMatch.score1 > finalMatch.score2 ? finalMatch.team1 : finalMatch.score2 > finalMatch.score1 ? finalMatch.team2 : null)
        : null;

    return (
        <div className="page ko-page">
            {/* Admin hint */}
            <button className="admin-hint-btn" onClick={() => navigate('/admin')} title="لوحة الإدارة">⚙</button>

            {/* Header */}
            <header className="site-header">
                <div className="site-header-inner">
                    <button className="btn btn-ghost btn-sm back-btn" onClick={() => navigate('/')}>← المجموعات</button>
                    <div className="ko-header-center">
                        <span className="ko-header-icon">🏆</span>
                        <div>
                            <h1 className="site-title">دوري الإقصاء</h1>
                            <p className="site-subtitle">{settings?.tournamentName || 'دوري رمضان'}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Champion Banner */}
            {champion && (
                <div className="champion-banner">
                    <div className="champion-inner">
                        <div className="champion-trophy">🏆</div>
                        <div>
                            <div className="champion-label">بطل البطولة</div>
                            <div className="champion-name">{champion.name}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Qualified Teams Strip */}
            {settings?.qualifiedTeams?.length > 0 && (
                <div className="qualified-strip">
                    <span className="qualified-strip-label">الفرق المتأهلة:</span>
                    <div className="qualified-strip-teams">
                        {settings.qualifiedTeams.map(t => (
                            <span key={t._id} className="qualified-pill">
                                <span className="qualified-pill-group">{t.group}</span>
                                {t.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Bracket */}
            {hasKnockout ? (
                <>
                    <div className="ko-bracket-wrapper">
                        <BracketTree
                            knockoutMatches={knockoutMatches}
                            bracketSlots={settings?.bracketSlots || []}
                        />
                    </div>

                    {/* Match list (mobile-friendly alternative) */}
                    <div className="ko-match-list">
                        {['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'].map(round => {
                            const roundMatches = knockoutMatches.filter(m => m.knockoutRound === round);
                            if (!roundMatches.length) return null;
                            return (
                                <div key={round} className="ko-round-group">
                                    <div className="ko-round-title">{round}</div>
                                    {roundMatches.map(m => {
                                        const done = m.status === 'Completed';
                                        const w1 = done && m.score1 > m.score2;
                                        const w2 = done && m.score2 > m.score1;
                                        const fmtDate = (d) => d ? new Date(d).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' }) : null;
                                        return (
                                            <div key={m._id} className={`ko-match-row ${done ? 'ko-done' : ''}`}>
                                                <div className={`ko-team-name ${w1 ? 'ko-winner' : ''}`}>{m.team1?.name}</div>
                                                <div className="ko-vs">
                                                    {done ? <span className="ko-scoreline">{m.score1} - {m.score2}</span> : <span className="ko-vs-text">VS</span>}
                                                </div>
                                                <div className={`ko-team-name ko-team-right ${w2 ? 'ko-winner' : ''}`}>{m.team2?.name}</div>
                                                {m.matchDate && <div className="ko-match-date">{fmtDate(m.matchDate)}</div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <div className="ko-empty-state">
                    <div className="ko-empty-icon">🏆</div>
                    <p>لم تُعدّ مباريات الإقصاء بعد</p>
                    <p className="ko-empty-sub">انتظر انتهاء دور المجموعات</p>
                </div>
            )}
        </div>
    );
}
