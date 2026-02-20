export default function GroupTable({ group, teams }) {
    const sorted = [...teams].sort(
        (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
    );

    return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
                padding: '.45rem .75rem',
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
            }}>
                <span style={{ fontSize: '.7rem', fontWeight: 800, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    المجموعة {group}
                </span>
            </div>

            {sorted.length === 0 ? (
                <div style={{ padding: '.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.78rem' }}>
                    لا توجد فرق
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-elevated)' }}>
                            <th style={thStyle('right', 34)}>#</th>
                            <th style={thStyle('right')}>الفريق</th>
                            <th style={thStyle()}>ل</th>
                            <th style={thStyle()}>ف</th>
                            <th style={thStyle()}>ت</th>
                            <th style={thStyle()}>خ</th>
                            <th style={thStyle()}>±</th>
                            <th style={thStyle()}>نق</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((team, i) => {
                            const isQ = i < 2;
                            const isFirst = i === 0;
                            return (
                                <tr key={team._id} style={{
                                    background: isFirst ? 'rgba(226,176,74,.06)' : isQ ? 'rgba(226,176,74,.02)' : 'transparent',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    <td style={{
                                        ...tdStyle('center'),
                                        paddingRight: '.5rem',
                                    }}>
                                        {i === 0 ? (
                                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', verticalAlign: 'middle' }} />
                                        ) : i === 1 ? (
                                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', opacity: .45, verticalAlign: 'middle' }} />
                                        ) : (
                                            <span style={{ fontSize: '.7rem', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif' }}>{i + 1}</span>
                                        )}
                                    </td>
                                    <td style={{ ...tdStyle('right'), fontWeight: 700, color: 'var(--text-primary)', fontSize: '.84rem', paddingRight: '.5rem' }}>
                                        {team.name}
                                    </td>
                                    <td style={tdStyle()}>{team.played}</td>
                                    <td style={{ ...tdStyle(), color: 'var(--success)', fontWeight: 700 }}>{team.won}</td>
                                    <td style={tdStyle()}>{team.drawn}</td>
                                    <td style={{ ...tdStyle(), color: 'var(--danger)' }}>{team.lost}</td>
                                    <td style={{
                                        ...tdStyle(), fontFamily: 'Inter, sans-serif', fontSize: '.75rem',
                                        color: team.gd > 0 ? 'var(--success)' : team.gd < 0 ? 'var(--danger)' : 'var(--text-muted)',
                                    }}>
                                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                                    </td>
                                    <td style={{
                                        ...tdStyle(),
                                        fontWeight: 900, color: 'var(--gold)',
                                        fontFamily: 'Inter, sans-serif', fontSize: '.9rem',
                                    }}>
                                        {team.points}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}

const thStyle = (align = 'center', minW) => ({
    padding: '.28rem .4rem',
    textAlign: align,
    fontSize: '.6rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    borderBottom: '1px solid var(--border)',
    minWidth: minW,
    whiteSpace: 'nowrap',
});

const tdStyle = (align = 'center') => ({
    padding: '.42rem .4rem',
    textAlign: align,
    fontSize: '.8rem',
    color: 'var(--text-secondary)',
    verticalAlign: 'middle',
});
