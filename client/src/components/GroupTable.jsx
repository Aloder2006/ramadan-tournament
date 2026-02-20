export default function GroupTable({ group, teams }) {
    const sorted = [...teams].sort(
        (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
    );

    return (
        <div className="group-card">
            <div className="group-header">
                <span className="group-label">المجموعة</span>
                <span className="group-letter">{group}</span>
            </div>
            {sorted.length === 0 ? (
                <p className="empty-text">لا توجد فرق في هذه المجموعة بعد</p>
            ) : (
                <div className="table-wrapper">
                    <table className="standings-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>الفريق</th>
                                <th title="لعب">ل</th>
                                <th title="فاز">ف</th>
                                <th title="تعادل">ت</th>
                                <th title="خسر">خ</th>
                                <th title="له">له</th>
                                <th title="عليه">ع</th>
                                <th title="فارق الأهداف">±</th>
                                <th title="النقاط">نق</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sorted.map((team, index) => (
                                <tr key={team._id} className={index === 0 ? 'top-row' : ''}>
                                    <td className="rank">{index + 1}</td>
                                    <td className="team-cell">{team.name}</td>
                                    <td>{team.played}</td>
                                    <td>{team.won}</td>
                                    <td>{team.drawn}</td>
                                    <td>{team.lost}</td>
                                    <td>{team.gf}</td>
                                    <td>{team.ga}</td>
                                    <td className={team.gd > 0 ? 'pos' : team.gd < 0 ? 'neg' : ''}>
                                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                                    </td>
                                    <td className="points-cell">{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
