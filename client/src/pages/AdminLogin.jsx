import { useState } from 'react';
import { adminLogin } from '../services/api';

export default function AdminLogin({ onSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

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
                setError(res.message || 'كلمة السر غير صحيحة');
            }
        } catch {
            setError('تعذر الاتصال بالخادم');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-screen">
            <div className="login-card">
                {/* Icon */}
                <div className="login-icon">🔒</div>

                {/* Title */}
                <h1 className="login-title">لوحة الإدارة</h1>
                <p className="login-sub">أدخل كلمة السر للمتابعة</p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="login-input-wrapper">
                        <span className="login-input-icon">🔑</span>
                        <input
                            type={showPass ? 'text' : 'password'}
                            className="form-input"
                            placeholder="كلمة السر..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                        <button
                            type="button"
                            className="login-toggle-pass"
                            onClick={() => setShowPass(!showPass)}
                            tabIndex={-1}
                        >
                            {showPass ? '🙈' : '👁️'}
                        </button>
                    </div>

                    <button
                        className="login-btn"
                        type="submit"
                        disabled={loading || !password.trim()}
                    >
                        {loading
                            ? <span className="btn-loader" />
                            : 'دخول'
                        }
                    </button>
                </form>

                {/* Error */}
                {error && <p className="login-error">{error}</p>}

                {/* Footer */}
                <div className="login-footer">
                    <span>بطولة رمضان</span>
                    <span className="login-footer-dot" />
                    <span>لوحة التحكم</span>
                </div>
            </div>
        </div>
    );
}
