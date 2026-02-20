import { useState } from 'react';
import { adminLogin } from '../services/api';

export default function AdminLogin({ onSuccess }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
                <div className="login-icon">⚙️</div>
                <h1 className="login-title">لوحة الإدارة</h1>
                <p className="login-sub">أدخل كلمة السر للمتابعة</p>
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="password"
                        className="form-input"
                        placeholder="كلمة السر..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />
                    <button className="btn btn-primary w-full" type="submit" disabled={loading}>
                        {loading ? '...' : 'دخول'}
                    </button>
                </form>
                {error && <p className="alert alert-error" style={{ marginTop: '1rem' }}>{error}</p>}
            </div>
        </div>
    );
}
