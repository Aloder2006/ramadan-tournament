import { useEffect, useState, useCallback } from 'react';
import { getTeams, getTodayMatches, getTomorrowMatches, getMatchHistory, getSettings, getMatches } from '../services/api';
import MatchesSection from '../components/MatchesSection';
import GroupTable from '../components/GroupTable';
import MatchHistory from '../components/MatchHistory';
import BracketTree from '../components/BracketTree';
import Skeleton from '../components/Skeleton';
import { InstallBanner } from '../hooks/useInstallPrompt';
import { applySettingsColors } from '../admin/panels/SettingsPanel';
import config from '../tournament.config';

// Dynamic page title for SEO
function useDocumentTitle(title) {
    useEffect(() => {
        document.title = title;
    }, [title]);
}

// Auto-refresh interval (60 seconds)
const REFRESH_INTERVAL = 60 * 1000;

export default function HomePage() {
    const [teams, setTeams] = useState([]);
    const [todayMatches, setTodayMatches] = useState([]);
    const [tomorrowMatches, setTomorrowMatches] = useState([]);
    const [history, setHistory] = useState([]);
    const [settings, setSettings] = useState(null);
    const [knockoutMatches, setKnockoutMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async (isInitial = false) => {
        try {
            const [tms, today, tmrw, hist, sett, ko] = await Promise.all([
                getTeams(), getTodayMatches(), getTomorrowMatches(),
                getMatchHistory(), getSettings(), getMatches('knockout'),
            ]);
            setTeams(Array.isArray(tms) ? tms : []);
            setTodayMatches(Array.isArray(today) ? today : []);
            setTomorrowMatches(Array.isArray(tmrw) ? tmrw : []);
            setHistory(Array.isArray(hist) ? hist : []);
            if (sett && !sett.message) {
                setSettings(sett);
                applySettingsColors(sett);
            }
            setKnockoutMatches(Array.isArray(ko) ? ko : []);
        } catch (e) { console.error(e); }
        finally { if (isInitial) setLoading(false); }
    }, []);

    // Initial load
    useEffect(() => { fetchData(true); }, [fetchData]);

    // Auto-refresh every 60 seconds
    useEffect(() => {
        const interval = setInterval(() => fetchData(false), REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);

    const tName = settings?.tournamentName || config.name;
    const tEmoji = settings?.logoEmoji || config.logoEmoji || '';
    const isKO = settings?.phase === 'knockout';

    // Dynamic SEO title
    useDocumentTitle(`${tEmoji} ${tName} — ${isKO ? 'دور الإقصاء' : 'دور المجموعات'}`);

    if (loading) return (
        <div className="hp-page">
            <header className="hp-navbar">
                <div className="hp-navbar-inner">
                    <div className="hp-logo-group">
                        <span className="hp-logo-emoji">⚽</span>
                        <h1 className="hp-logo-name">{config.name}</h1>
                    </div>
                </div>
            </header>
            <Skeleton type="full-page" />
        </div>
    );

    const finalMatch = knockoutMatches.find(m => m.knockoutRound === 'النهائي' && m.status === 'Completed');
    const champion = finalMatch
        ? finalMatch.hasPenalties
            ? (finalMatch.penaltyScore1 > finalMatch.penaltyScore2 ? finalMatch.team1 : finalMatch.team2)
            : (finalMatch.score1 > finalMatch.score2 ? finalMatch.team1 : finalMatch.score2 > finalMatch.score1 ? finalMatch.team2 : null)
        : null;

    return (
        <div className="hp-page">

            {/* ── NAVBAR ── */}
            <header className="hp-navbar">
                <div className="hp-navbar-inner">
                    <div className="hp-logo-group">
                        {tEmoji && <span className="hp-logo-emoji">{tEmoji}</span>}
                        <h1 className="hp-logo-name">{tName}</h1>
                    </div>
                </div>
            </header>

            {/* ── MAIN CONTENT ── */}
            <main className="page-fade-in">
                <MatchesSection
                    todayMatches={todayMatches.filter(m => isKO ? m.phase === 'knockout' : m.phase !== 'knockout')}
                    tomorrowMatches={tomorrowMatches.filter(m => isKO ? m.phase === 'knockout' : m.phase !== 'knockout')}
                />

                {/* GROUPS VIEW */}
                {!isKO && (
                    <>
                        <section className="hp-groups-section">
                            <div className="hp-section-heading">جداول المجموعات</div>

                            <div className="hp-groups-grid">
                                {config.groups.map(g => (
                                    <GroupTable key={g} group={g} teams={teams.filter(t => t.group === g)} />
                                ))}
                            </div>

                            <div className="hp-qualified-legend">
                                <span className="hp-legend-dot" />
                                <span className="hp-legend-text">المتأهلون للإقصاء</span>
                            </div>
                        </section>

                        <div className="hp-content-wrap">
                            <MatchHistory matches={history.filter(m => m.phase !== 'knockout')} />
                        </div>
                    </>
                )}

                {/* KNOCKOUT VIEW */}
                {isKO && (
                    <div className="page-fade-in">
                        {/* Champion banner */}
                        {champion && (
                            <div className="hp-champion-banner">
                                <div className="hp-champion-inner">
                                    <div className="hp-champion-avatar">{champion.name?.[0]}</div>
                                    <div>
                                        <div className="hp-champion-label">بطل البطولة</div>
                                        <div className="hp-champion-name">{champion.name}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BracketTree */}
                        {(knockoutMatches.length > 0 || settings?.bracketSlots?.some(s => s.team)) ? (
                            <div className="hp-content-wrap" style={{ overflowX: 'auto' }}>
                                <BracketTree
                                    knockoutMatches={knockoutMatches}
                                    bracketSlots={settings?.bracketSlots || []}
                                />
                            </div>
                        ) : (
                            <div className="hp-empty-knockout">
                                <div className="hp-empty-title">لم يتم إعداد قرعة الإقصاء بعد</div>
                            </div>
                        )}

                        <div className="hp-content-wrap">
                            <MatchHistory matches={history.filter(m => m.phase === 'knockout')} />
                        </div>
                    </div>
                )}
            </main>

            {/* ── INSTALL BANNER ── */}
            <InstallBanner />

            {/* ── FOOTER ── */}
            <footer className="site-footer">
                <div className="site-footer-inner">
                    <div className="site-footer-brand">
                        {tEmoji && <span>{tEmoji}</span>}
                        <span>{tName}</span>
                    </div>
                    <div className="site-footer-socials">
                        <a href="https://www.instagram.com/i4rqm/" target="_blank" rel="noopener noreferrer" className="site-footer-social" aria-label="Instagram">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                        </a>
                        <a href="https://www.facebook.com/i4rqm" target="_blank" rel="noopener noreferrer" className="site-footer-social" aria-label="Facebook">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                        </a>
                    </div>
                    <div className="site-footer-copy">تصميم وتطوير <span className="site-footer-author">عبدالرحمن عاطف</span> © {new Date().getFullYear()}</div>
                </div>
            </footer>
        </div>
    );
}
