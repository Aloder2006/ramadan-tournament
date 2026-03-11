import { useState, useEffect } from 'react';

/**
 * useInstallPrompt — captures the `beforeinstallprompt` event
 * and provides a trigger function + UI state for the install banner.
 *
 * Usage:
 *   const { canInstall, promptInstall, isInstalled } = useInstallPrompt();
 */
export function useInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true) {
            setIsInstalled(true);
            return;
        }

        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const promptInstall = async () => {
        if (!deferredPrompt) return false;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        return outcome === 'accepted';
    };

    return {
        canInstall: !!deferredPrompt && !isInstalled,
        promptInstall,
        isInstalled,
    };
}


/**
 * InstallBanner — A dismissable floating banner that appears
 * when the app is installable. Slides in from the bottom.
 */
export function InstallBanner() {
    const { canInstall, promptInstall } = useInstallPrompt();
    const [dismissed, setDismissed] = useState(false);

    if (!canInstall || dismissed) return null;

    return (
        <div className="install-banner page-fade-in">
            <div className="install-banner-content">
                <div className="install-banner-icon">📲</div>
                <div className="install-banner-text">
                    <strong>ثبّت التطبيق</strong>
                    <span>أضف البطولة لشاشتك الرئيسية للوصول السريع</span>
                </div>
            </div>
            <div className="install-banner-actions">
                <button className="btn btn-primary btn-sm" onClick={promptInstall}>
                    تثبيت
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setDismissed(true)}>
                    لاحقاً
                </button>
            </div>
        </div>
    );
}
