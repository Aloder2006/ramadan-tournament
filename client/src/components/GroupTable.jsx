export default function GroupTable({ group, teams }) {
    const sorted = [...teams].sort(
        (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
    );

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            overflow: 'hidden',
        }}>
            {/* ── Header ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '.55rem',
                padding: '.5rem .75rem',
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border)',
            }}>
                <span style={{
                    fontSize: '.62rem', fontWeight: 900, color: 'var(--gold)',
                    background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
                    borderRadius: 3, padding: '.1rem .4rem', letterSpacing: '.04em',
                    fontFamily: 'Inter, sans-serif',
                }}>
                    {group}
                </span>
                <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    المجموعة {group}
                </span>
            </div>

            {sorted.length === 0 ? (
                <div style={{ padding: '.85rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '.78rem' }}>
                    لا توجد فرق
                </div>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={TH('right', 40)}>الفريق</th>
                            <th style={TH()}>ل</th>
                            <th style={TH()}>ف</th>
                            <th style={TH()}>ت</th>
                            <th style={TH()}>خ</th>
                            <th style={TH()}>±</th>
                            <th style={TH()}>نق</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sorted.map((team, i) => {
                            const qualified = i < 2;
                            return (
                                <tr key={team._id} style={{
                                    borderBottom: i < sorted.length - 1 ? '1px solid color-mix(in srgb, var(--border) 60%, transparent)' : 'none',
                                    borderRight: qualified ? `3px solid ${i === 0 ? 'var(--gold)' : 'color-mix(in srgb, var(--gold) 45%, transparent)'}` : '3px solid transparent',
                                }}>
                                    {/* Team name */}
                                    <td style={{ padding: '.45rem .6rem', textAlign: 'right', verticalAlign: 'middle' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                                            <span style={{
                                                fontSize: '.62rem', fontWeight: 700, color: 'var(--text-muted)',
                                                fontFamily: 'Inter, sans-serif', minWidth: 14, textAlign: 'center',
                                            }}>{i + 1}</span>
                                            <span style={{
                                                fontSize: '.84rem', fontWeight: qualified ? 700 : 500,
                                                color: qualified ? 'var(--text-primary)' : 'var(--text-secondary)',
                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100,
                                            }}>{team.name}</span>
                                        </div>
                                    </td>

                                    {/* Stats — all same muted color, no green/red noise */}
                                    <td style={TD()}>{team.played}</td>
                                    <td style={TD()}>{team.won}</td>
                                    <td style={TD()}>{team.drawn}</td>
                                    <td style={TD()}>{team.lost}</td>

                                    {/* GD */}
                                    <td style={{
                                        ...TD(),
                                        fontFamily: 'Inter, sans-serif', fontSize: '.75rem',
                                        color: team.gd > 0 ? 'var(--text-secondary)' : team.gd < 0 ? 'var(--text-muted)' : 'var(--text-muted)',
                                    }}>
                                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                                    </td>

                                    {/* Points — only gold accent */}
                                    <td style={{
                                        ...TD(),
                                        fontWeight: 900, fontSize: '.88rem',
                                        color: qualified ? 'var(--gold)' : 'var(--text-secondary)',
                                        fontFamily: 'Inter, sans-serif',
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

const TH = (align = 'center', minW) => ({
    padding: '.32rem .5rem',
    textAlign: align,
    fontSize: '.6rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    borderBottom: '1px solid var(--border)',
    minWidth: minW,
    whiteSpace: 'nowrap',
    background: 'var(--bg-elevated)',
});

const TD = (align = 'center') => ({
    padding: '.42rem .5rem',
    textAlign: align,
    fontSize: '.82rem',
    color: 'var(--text-muted)',
    verticalAlign: 'middle',
    fontFamily: 'Inter, sans-serif',
});
