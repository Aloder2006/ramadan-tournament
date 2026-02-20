import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTeams, getTodayMatches, getTomorrowMatches, getMatchHistory, getSettings, getMatches } from '../services/api';
import MatchesSection from '../components/MatchesSection';
import GroupTable from '../components/GroupTable';
import MatchHistory from '../components/MatchHistory';
import BracketTree from '../components/BracketTree';
import { applySettingsColors } from '../components/TournamentSettingsEditor';
import config from '../tournament.config';

export default function HomePage() {
    const [teams, setTeams] = useState([]);
    const [todayMatches, setTodayMatches] = useState([]);
    const [tomorrowMatches, setTomorrowMatches] = useState([]);
    const [history, setHistory] = useState([]);
    const [settings, setSettings] = useState(null);
    const [knockoutMatches, setKnockoutMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('groups');

    useEffect(() => {
        const load = async () => {
            try {
                const [teamsData, todayData, tomorrowData, historyData, settingsData, koData] = await Promise.all([
                    getTeams(), getTodayMatches(), getTomorrowMatches(), getMatchHistory(), getSettings(), getMatches('knockout'),
                ]);
                setTeams(Array.isArray(teamsData) ? teamsData : []);
                setTodayMatches(Array.isArray(todayData) ? todayData : []);
                setTomorrowMatches(Array.isArray(tomorrowData) ? tomorrowData : []);
                setHistory(Array.isArray(historyData) ? historyData : []);
                if (settingsData && !settingsData.message) {
                    setSettings(settingsData);
                    applySettingsColors(settingsData);
                    if (settingsData.phase === 'knockout') setView('knockout');
                }
                setKnockoutMatches(Array.isArray(koData) ? koData : []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="loading-screen">
            <div className="splash-logo">{config.logoEmoji}</div>
            <div className="splash-name">{config.name}</div>
            <div className="loader" />
        </div>
    );

    // Champion detection
    const finalMatch = knockoutMatches.find(m => m.knockoutRound === 'النهائي' && m.status === 'Completed');
    const champion = finalMatch
        ? finalMatch.hasPenalties
            ? (finalMatch.penaltyScore1 > finalMatch.penaltyScore2 ? finalMatch.team1 : finalMatch.team2)
            : (finalMatch.score1 > finalMatch.score2 ? finalMatch.team1 : finalMatch.score2 > finalMatch.score1 ? finalMatch.team2 : null)
        : null;

    const tName = settings?.tournamentName || config.name;
    const tEmoji = settings?.logoEmoji || config.logoEmoji;

    return (
        <div className="page">
            {/* Navbar */}
            <header className="simple-navbar">
                <div style={{ width: 32 }} />
                <h1 className="simple-navbar-title">
                    <span className="navbar-logo">{tEmoji}</span>
                    {tName}
                </h1>
                <div style={{ width: 32 }} />
            </header>

            {/* View Toggle */}
            <div className="view-toggle">
                <button className={`view-toggle-btn ${view === 'groups' ? 'active' : ''}`} onClick={() => setView('groups')}>
                    المجموعات
                </button>
                <button className={`view-toggle-btn ${view === 'knockout' ? 'active' : ''}`} onClick={() => setView('knockout')}>
                    الإقصاء
                    {settings?.phase === 'knockout' && <span className="live-dot" />}
                </button>
            </div>

            {/* ── GROUPS VIEW ── */}
            {view === 'groups' && (
                <>
                    <MatchesSection
                        todayMatches={todayMatches.filter(m => m.phase !== 'knockout')}
                        tomorrowMatches={tomorrowMatches.filter(m => m.phase !== 'knockout')}
                    />

                    <section className="groups-section">
                        <h2 className="section-heading">جداول المجموعات</h2>
                        <div className="groups-grid">
                            {config.groups.map(g => (
                                <GroupTable key={g} group={g} teams={teams.filter(t => t.group === g)} />
                            ))}
                        </div>
                    </section>

                    <MatchHistory matches={history.filter(m => m.phase !== 'knockout')} />
                </>
            )}

            {/* ── KNOCKOUT VIEW ── */}
            {view === 'knockout' && (
                <div className="ko-view">
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

                    <MatchesSection
                        todayMatches={todayMatches.filter(m => m.phase === 'knockout')}
                        tomorrowMatches={tomorrowMatches.filter(m => m.phase === 'knockout')}
                    />

                    <div className="ko-bracket-desktop">
                        <BracketTree knockoutMatches={knockoutMatches} bracketSlots={settings?.bracketSlots || []} />
                    </div>

                    {/* Mobile KO list */}
                    <div className="ko-match-list">
                        {['ربع النهائي', 'نصف النهائي', 'نهائي الترتيب', 'النهائي'].map(round => {
                            const roundMs = knockoutMatches.filter(m => m.knockoutRound === round);
                            if (!roundMs.length) return null;
                            return (
                                <div key={round} className="ko-round-group">
                                    <div className="ko-round-title">{round}</div>
                                    {roundMs.map(m => {
                                        const done = m.status === 'Completed';
                                        const w1 = done && m.score1 > m.score2;
                                        const w2 = done && m.score2 > m.score1;
                                        return (
                                            <div key={m._id} className={`ko-match-row ${done ? 'ko-done' : ''}`}>
                                                <div className={`ko-team-name ${w1 ? 'ko-winner' : ''}`}>{m.team1?.name}</div>
                                                <div className="ko-vs">
                                                    {done
                                                        ? <span className="ko-scoreline">{m.score1} - {m.score2}</span>
                                                        : <span className="ko-vs-text">VS</span>}
                                                </div>
                                                <div className={`ko-team-name ko-team-right ${w2 ? 'ko-winner' : ''}`}>{m.team2?.name}</div>
                                                {m.matchDate && (
                                                    <div className="ko-match-date">
                                                        {new Date(m.matchDate).toLocaleDateString('ar-EG', { weekday: 'short', day: '2-digit', month: 'short' })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                        {knockoutMatches.length === 0 && !(settings?.bracketSlots?.some(s => s.team)) && (
                            <div className="ko-empty-state">
                                <div className="ko-empty-icon">🏆</div>
                                <p>لم يتم إعداد قرعة الإقصاء بعد</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
