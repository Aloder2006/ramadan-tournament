import { useEffect, useState, useCallback } from 'react';
import { getSettings, getMatches } from '../services/api';
import PredictionModal from '../components/PredictionModal';
import Skeleton from '../components/Skeleton';
import config from '../tournament.config';

export default function PredictPage() {
    const [settings, setSettings] = useState(null);
    const [finalMatchAny, setFinalMatchAny] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const [sett, ko] = await Promise.all([
                getSettings(),
                getMatches('knockout'),
            ]);
            
            if (sett && !sett.message) {
                setSettings(sett);
            }
            
            if (Array.isArray(ko)) {
                // Find the final match to get team names
                const final = ko.find(m => m.knockoutRound === 'النهائي');
                setFinalMatchAny(final);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        document.title = `${config.logoEmoji || '⚽'} ${config.name} — توقع النهائي`;
    }, [fetchData]);

    if (loading) {
        return (
            <div className="hp-page" style={{ height: '100vh' }}>
                <header className="hp-navbar">
                    <div className="hp-navbar-inner">
                        <div className="hp-logo-group">
                            <span className="hp-logo-emoji">{config.logoEmoji || '⚽'}</span>
                            <h1 className="hp-logo-name">{config.name}</h1>
                        </div>
                    </div>
                </header>
                <div style={{ paddingTop: '4rem' }}>
                    <Skeleton type="full-page" />
                </div>
            </div>
        );
    }

    return (
        <div className="hp-page" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            {/* Simple Navbar */}
            <header className="hp-navbar">
                <div className="hp-navbar-inner" style={{ justifyContent: 'center' }}>
                    <div className="hp-logo-group">
                        <span className="hp-logo-emoji">{settings?.logoEmoji || config.logoEmoji || '⚽'}</span>
                        <h1 className="hp-logo-name">{settings?.tournamentName || config.name}</h1>
                    </div>
                </div>
            </header>

            {/* The Modal Component acts as the page content here */}
            {/* We pass onClose=null so the 'X' button doesn't appear */}
            <div style={{ position: 'relative', height: 'calc(100vh - 60px)' }}>
                <PredictionModal
                    finalMatchStatus={settings?.finalMatchStatus || 'open'}
                    team1Name={finalMatchAny?.team1?.name}
                    team2Name={finalMatchAny?.team2?.name}
                    onClose={null}
                />
            </div>
        </div>
    );
}
