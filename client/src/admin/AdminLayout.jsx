import { useState } from 'react';
import { useAdmin } from './AdminContext';
import config from '../tournament.config';

import TeamsPanel from './panels/TeamsPanel';
import GroupMatchesPanel from './panels/GroupMatchesPanel';
import KnockoutPanel from './panels/KnockoutPanel';
import ExportPanel from './panels/ExportPanel';
import SettingsPanel from './panels/SettingsPanel';
import DangerZone from './panels/DangerZone';
import PredictionsPanel from './panels/PredictionsPanel';

const TABS = [
    { id: 'teams', icon: '👥', label: 'الفرق' },
    { id: 'group-matches', icon: '⚽', label: 'المباريات' },
    { id: 'knockout', icon: '🏆', label: 'الإقصاء' },
    { id: 'predictions', icon: '🎯', label: 'التوقعات' },
    { id: 'export', icon: '📸', label: 'تصدير' },
    { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
    { id: 'danger', icon: '⚠️', label: 'إعادة تعيين' },
];

export default function AdminLayout({ onLogout }) {
    const { settings, loading } = useAdmin();
    const [activeTab, setActiveTab] = useState('teams');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="adm-loading">
                <div className="adm-loading-spinner" />
                <p>جاري التحميل...</p>
            </div>
        );
    }

    const tName = settings?.tournamentName || config.name;
    const tEmoji = settings?.logoEmoji || config.logoEmoji || '🏟️';
    const isKO = settings?.phase === 'knockout';

    const renderPanel = () => {
        switch (activeTab) {
            case 'teams': return <TeamsPanel />;
            case 'group-matches': return <GroupMatchesPanel />;
            case 'knockout': return <KnockoutPanel />;
            case 'predictions': return <PredictionsPanel />;
            case 'export': return <ExportPanel />;
            case 'settings': return <SettingsPanel />;
            case 'danger': return <DangerZone />;
            default: return null;
        }
    };

    return (
        <div className="adm-layout">
            {/* ── Mobile overlay ── */}
            {sidebarOpen && <div className="adm-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* ── Sidebar ── */}
            <aside className={`adm-sidebar ${sidebarOpen ? 'adm-sidebar-open' : ''}`}>
                <div className="adm-sidebar-header">
                    <div className="adm-brand">
                        <span className="adm-brand-emoji">{tEmoji}</span>
                        <div className="adm-brand-text">
                            <div className="adm-brand-name">{tName}</div>
                            <div className="adm-brand-phase">
                                <span className={`adm-phase-badge ${isKO ? 'adm-phase-ko' : ''}`}>
                                    {isKO ? '🏆 إقصاء' : '📋 مجموعات'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <nav className="adm-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`adm-nav-item ${activeTab === tab.id ? 'adm-nav-active' : ''}`}
                            onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                        >
                            <span className="adm-nav-icon">{tab.icon}</span>
                            <span className="adm-nav-label">{tab.label}</span>
                            {tab.id === 'knockout' && isKO && <span className="adm-nav-dot" />}
                        </button>
                    ))}
                </nav>

                <div className="adm-sidebar-footer">
                    <div className="adm-visitor-count">
                        <span>👁️</span>
                        <strong>{settings?.visitorsCount || 0}</strong>
                        <span>زائر</span>
                    </div>
                    <div className="adm-sidebar-actions">
                        <a href="/" className="adm-sidebar-link">🏠 الرئيسية</a>
                        <button className="adm-logout-btn" onClick={onLogout}>خروج</button>
                    </div>
                </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="adm-main">
                {/* Top bar */}
                <header className="adm-topbar">
                    <button className="adm-menu-btn" onClick={() => setSidebarOpen(true)}>
                        <span className="adm-menu-icon">☰</span>
                    </button>
                    <div className="adm-topbar-title">
                        <span className="adm-topbar-icon">{TABS.find(t => t.id === activeTab)?.icon}</span>
                        <span>{TABS.find(t => t.id === activeTab)?.label}</span>
                    </div>
                    <div className="adm-topbar-actions">
                        <a href="/" className="btn btn-ghost btn-sm">🏠</a>
                        <button className="btn btn-danger btn-sm" onClick={onLogout}>خروج</button>
                    </div>
                </header>

                {/* Panel content */}
                <div className="adm-content">
                    <div className="adm-panel-enter">
                        {renderPanel()}
                    </div>
                </div>
            </main>
        </div>
    );
}
