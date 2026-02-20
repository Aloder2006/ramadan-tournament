import { useEffect, useState } from 'react';
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
        (async () => {
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
                    if (sett.phase === 'knockout') setView('knockout');
                }
                setKnockoutMatches(Array.isArray(ko) ? ko : []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'var(--bg-base)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'Cairo, sans-serif' }}>{config.name}</div>
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        </div>
    );

    const finalMatch = knockoutMatches.find(m => m.knockoutRound === 'النهائي' && m.status === 'Completed');
    const champion = finalMatch
        ? finalMatch.hasPenalties
            ? (finalMatch.penaltyScore1 > finalMatch.penaltyScore2 ? finalMatch.team1 : finalMatch.team2)
            : (finalMatch.score1 > finalMatch.score2 ? finalMatch.team1 : finalMatch.score2 > finalMatch.score1 ? finalMatch.team2 : null)
        : null;

    const tName = settings?.tournamentName || config.name;
    const tEmoji = settings?.logoEmoji || config.logoEmoji || '';
    const isKO = settings?.phase === 'knockout';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-base)', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>

            {/* ── NAVBAR ── */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 200,
                background: 'var(--bg-card)',
                borderBottom: '1px solid var(--border)',
            }}>
                {/* Top bar: name + admin btn */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.6rem 1rem', maxWidth: 940, margin: '0 auto' }}>
                    <div style={{ width: 32 }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                        {tEmoji && <span style={{ fontSize: '1.1rem' }}>{tEmoji}</span>}
                        <h1 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold)', margin: 0, fontFamily: 'Cairo, sans-serif' }}>{tName}</h1>
                    </div>
                    <a href="/admin" style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text-muted)', padding: '.25rem .55rem', border: '1px solid var(--border)', borderRadius: '2px', background: 'var(--bg-elevated)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                        إدارة
                    </a>
                </div>

                {/* View tabs */}
                <div style={{ display: 'flex', borderTop: '1px solid var(--border)', maxWidth: '100%' }}>
                    {[
                        { id: 'groups', label: 'المجموعات' },
                        { id: 'knockout', label: 'الإقصاء', live: isKO },
                    ].map(t => (
                        <button key={t.id}
                            onClick={() => setView(t.id)}
                            style={{
                                flex: 1, padding: '.6rem 1rem',
                                border: 'none', borderBottom: `2px solid ${view === t.id ? 'var(--gold)' : 'transparent'}`,
                                background: view === t.id ? 'var(--bg-elevated)' : 'transparent',
                                color: view === t.id ? 'var(--gold)' : 'var(--text-muted)',
                                fontFamily: 'Tajawal, sans-serif', fontSize: '.88rem', fontWeight: 700,
                                cursor: 'pointer', transition: 'all .12s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.4rem',
                            }}
                        >
                            {t.label}
                            {t.live && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
                        </button>
                    ))}
                </div>
            </header>

            {/* ── GROUPS VIEW ── */}
            {view === 'groups' && (
                <>
                    <MatchesSection
                        todayMatches={todayMatches.filter(m => m.phase !== 'knockout')}
                        tomorrowMatches={tomorrowMatches.filter(m => m.phase !== 'knockout')}
                    />

                    <section style={{ padding: '1rem 1.25rem', maxWidth: 940, margin: '0 auto' }}>
                        <div style={{
                            fontSize: '.7rem', fontWeight: 800, color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '.08em',
                            marginBottom: '.75rem', paddingBottom: '.4rem',
                            borderBottom: '1px solid var(--border)',
                        }}>جداول المجموعات</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '.85rem' }}>
                            {config.groups.map(g => (
                                <GroupTable key={g} group={g} teams={teams.filter(t => t.group === g)} />
                            ))}
                        </div>
                    </section>

                    <div style={{ maxWidth: 940, margin: '0 auto' }}>
                        <MatchHistory matches={history.filter(m => m.phase !== 'knockout')} />
                    </div>
                </>
            )}

            {/* ── KNOCKOUT VIEW ── */}
            {view === 'knockout' && (
                <div>
                    {/* Champion banner */}
                    {champion && (
                        <div style={{
                            padding: '.85rem 1.25rem',
                            background: 'linear-gradient(90deg, var(--gold-dim), transparent)',
                            borderBottom: '1px solid var(--gold-border)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', maxWidth: 940, margin: '0 auto' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '4px', background: 'var(--gold-dim)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: 'var(--gold)', fontSize: '.85rem', fontFamily: 'Inter, sans-serif' }}>
                                    {champion.name?.[0]}
                                </div>
                                <div>
                                    <div style={{ fontSize: '.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>بطل البطولة</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--gold)', fontFamily: 'Cairo, sans-serif' }}>{champion.name}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <MatchesSection
                        todayMatches={todayMatches.filter(m => m.phase === 'knockout')}
                        tomorrowMatches={tomorrowMatches.filter(m => m.phase === 'knockout')}
                    />

                    {/* Bracket tree — always shown on desktop */}
                    {(knockoutMatches.length > 0 || settings?.bracketSlots?.some(s => s.team)) ? (
                        <div style={{ maxWidth: 940, margin: '0 auto', overflow: 'hidden' }}>
                            <BracketTree
                                knockoutMatches={knockoutMatches}
                                bracketSlots={settings?.bracketSlots || []}
                            />
                        </div>
                    ) : (
                        <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.5rem' }}>لم يتم إعداد قرعة الإقصاء بعد</div>
                            <div style={{ fontSize: '.8rem' }}>انتقل إلى لوحة الإدارة لتوليد القرعة</div>
                        </div>
                    )}

                    {/* KO match history */}
                    <div style={{ maxWidth: 940, margin: '0 auto' }}>
                        <MatchHistory matches={history.filter(m => m.phase === 'knockout')} />
                    </div>
                </div>
            )}

        </div>
    );
}
