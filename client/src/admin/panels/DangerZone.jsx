import { useState } from 'react';
import { useAdmin } from '../AdminContext';
import { resetGroups, resetKnockout, resetAll } from '../../services/api';

export default function DangerZone() {
    const { fetchAll } = useAdmin();
    const [resetting, setResetting] = useState(false);

    const handleReset = async (type) => {
        const msgs = {
            groups: 'سيتم حذف جميع مباريات المجموعات وإعادة تصفير النقاط.',
            knockout: 'سيتم حذف جميع مباريات الإقصاء وإفراغ القرعة.',
            all: '⚠️ تحذير خطير! سيتم حذف كل شيء والبدء من الصفر.',
        };

        if (!window.confirm(msgs[type] + '\n\nهل أنت متأكد؟')) return;

        const password = window.prompt('أدخل كلمة مرور الأدمن للتأكيد:');
        if (!password) return;

        setResetting(true);
        try {
            if (type === 'groups') await resetGroups(password);
            if (type === 'knockout') await resetKnockout(password);
            if (type === 'all') await resetAll(password);
            await fetchAll();
            alert('✅ تم إعادة التعيين بنجاح');
        } catch (e) {
            alert('❌ ' + (e.message || 'حدث خطأ'));
        } finally { setResetting(false); }
    };

    const cards = [
        { type: 'groups', title: 'إعادة تعيين دور المجموعات', desc: 'حذف مباريات المجموعات وتصفير نقاط الفرق.', danger: false },
        { type: 'knockout', title: 'إعادة تعيين دور الإقصاء', desc: 'حذف مباريات الإقصاء وإفراغ القرعة والمتأهلين.', danger: false },
        { type: 'all', title: '🔥 تصفير البطولة بالكامل', desc: 'حذف جميع الفرق والمباريات والإعدادات. (بداية جديدة)', danger: true },
    ];

    return (
        <div className="adm-danger">
            <div className="adm-panel-header">
                <h2 className="adm-panel-title" style={{ color: 'var(--danger)' }}>⚠️ منطقة الخطر</h2>
            </div>
            <p className="adm-panel-desc">الإجراءات هنا لا يمكن التراجع عنها. مطلوب كلمة مرور الأدمن.</p>

            <div className="adm-danger-grid">
                {cards.map(c => (
                    <div key={c.type} className={`adm-danger-card ${c.danger ? 'adm-danger-extreme' : ''}`}>
                        <div>
                            <div className={`adm-danger-title ${c.danger ? 'adm-text-danger' : ''}`}>{c.title}</div>
                            <div className="adm-danger-desc">{c.desc}</div>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => handleReset(c.type)} disabled={resetting}>
                            {resetting ? '⏳' : c.danger ? 'حذف كل شيء' : `تصفير ${c.type === 'groups' ? 'المجموعات' : 'الإقصاء'}`}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
