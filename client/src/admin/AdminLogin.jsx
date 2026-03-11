import { useState } from 'react';
import { adminLogin } from '../services/api';

export default function AdminLogin({ onSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [shake, setShake] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await adminLogin(password);
            if (res.success) {
                sessionStorage.setItem('adminToken', res.token);
                onSuccess();
            } else {
                triggerError(res.message || 'كلمة السر غير صحيحة');
            }
        } catch (err) {
            triggerError(err.message || 'تعذر الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    const triggerError = (msg) => {
        setError(msg);
        setShake(true);
        setTimeout(() => setShake(false), 600);
    };

    return (
        <div className="adm-login-screen">
            {/* Floating particles */}
            <div className="adm-login-particles">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="adm-particle" style={{ '--i': i }} />
                ))}
            </div>

            <div className={`adm-login-card ${shake ? 'adm-shake' : ''}`}>
                {/* Glow ring */}
                <div className="adm-login-glow" />

                {/* Icon */}
                <div className="adm-login-icon-wrap">
                    <div className="adm-login-icon">🔐</div>
                </div>

                {/* Title */}
                <h1 className="adm-login-title">لوحة الإدارة</h1>
                <p className="adm-login-sub">أدخل كلمة السر للمتابعة</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="adm-login-form">
                    <div className="adm-login-field">
                        <span className="adm-login-field-icon">🔑</span>
                        <input
                            type={showPass ? 'text' : 'password'}
                            className="adm-login-input"
                            placeholder="كلمة السر..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="button"
                            className="adm-login-reveal"
                            onClick={() => setShowPass(!showPass)}
                            tabIndex={-1}
                        >
                            {showPass ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <button
                        className="adm-login-btn"
                        type="submit"
                        disabled={loading || !password.trim()}
                    >
                        {loading ? <span className="adm-btn-spinner" /> : 'دخول'}
                    </button>
                </form>

                {/* Error */}
                {error && (
                    <div className="adm-login-error">
                        <span className="adm-err-icon">⚠️</span>
                        {error}
                    </div>
                )}

                {/* Footer */}
                <div className="adm-login-footer">
                    <span>بطولة رمضان</span>
                    <span className="adm-login-dot" />
                    <span>لوحة التحكم</span>
                </div>
            </div>
        </div>
    );
}
