import { useAdmin } from '../AdminContext';
import CanvasExporter from '../../components/CanvasExporter';

export default function ExportPanel() {
    const { teams, matches, settings } = useAdmin();
    return (
        <div className="adm-export">
            <div className="adm-panel-header">
                <h2 className="adm-panel-title">تصدير صور</h2>
            </div>
            <p className="adm-panel-desc">انقر لتحميل PNG جاهز للنشر</p>
            <CanvasExporter teams={teams} matches={matches} settings={settings} />
        </div>
    );
}
