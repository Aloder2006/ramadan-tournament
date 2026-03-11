import { useMemo } from 'react';

export default function GroupTable({ group, teams }) {
    const sorted = useMemo(() => {
        return [...teams].sort(
            (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
        );
    }, [teams]);

    return (
        <div className="gt-wrap">
            {/* Header */}
            <div className="gt-header">
                <span className="gt-header-label">المجموعة</span>
                <div className="gt-header-badge">{group}</div>
            </div>

            <table className="gt-table">
                <thead>
                    <tr>
                        <th className="gt-th gt-th-team">الفريق</th>
                        <th className="gt-th">ل</th>
                        <th className="gt-th">ف</th>
                        <th className="gt-th">ت</th>
                        <th className="gt-th">خ</th>
                        <th className="gt-th">+/-</th>
                        <th className="gt-th">نق</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((team, i) => {
                        const qualified = i < 2;
                        return (
                            <tr key={team._id}
                                className={`gt-row ${qualified ? 'gt-qualified' : ''}`}
                                style={{ borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}
                            >
                                <td className="gt-td gt-td-team">
                                    <div className="gt-team-cell">
                                        <span className="gt-rank">{i + 1}</span>
                                        <span className={`gt-name ${qualified ? 'gt-name-q' : ''}`} title={team.name}>
                                            {team.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="gt-td gt-td-num">{team.played}</td>
                                <td className="gt-td gt-td-num">{team.won}</td>
                                <td className="gt-td gt-td-num">{team.drawn}</td>
                                <td className="gt-td gt-td-num">{team.lost}</td>
                                <td className="gt-td gt-td-num gt-td-gd">{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                                <td className="gt-td gt-td-pts">{team.points}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}