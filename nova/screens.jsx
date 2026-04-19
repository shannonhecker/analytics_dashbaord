// Nova screens — modern dark-first

// Preview thumbnails for workspace cards — each kind renders a distinct chart
function CardPreview({kind, color='var(--accent)'}) {
  const W = 260, H = 64;
  if (kind === 'area') {
    const pts = [58, 52, 55, 48, 44, 46, 40, 36, 32, 28, 30, 24, 20, 22, 16, 12];
    const step = W / (pts.length - 1);
    const d = pts.map((y,i) => `${i===0?'M':'L'}${i*step},${y}`).join(' ');
    const fill = `${d} L${W},${H} L0,${H} Z`;
    const gid = React.useId();
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block'}}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
            <stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={fill} fill={`url(#${gid})`}/>
        <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  }
  if (kind === 'bars') {
    const vals = [28, 42, 35, 48, 52, 38, 44, 58, 46, 50, 36, 54];
    const bw = W / vals.length - 3;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{display:'block'}}>
        {vals.map((v,i)=>(
          <rect key={i} x={i*(bw+3)} y={H-v} width={bw} height={v} rx="1.5" fill={color} opacity={0.4 + (v/60)*0.6}/>
        ))}
      </svg>
    );
  }
  if (kind === 'gauge') {
    const cx = W/2, cy = H-6, r = 38;
    const pct = 0.62;
    const start = Math.PI, end = 0;
    const a = start + (end - start) * pct;
    const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
    const x2 = cx + r*Math.cos(end), y2 = cy + r*Math.sin(end);
    const xp = cx + r*Math.cos(a), yp = cy + r*Math.sin(a);
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax meet" style={{display:'block'}}>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke="var(--line)" strokeWidth="5" strokeLinecap="round"/>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${xp},${yp}`} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"/>
        <circle cx={xp} cy={yp} r="4" fill={color}/>
        <text x={cx} y={cy-8} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="14" fill="var(--ink)" letterSpacing="-0.02em">5.50</text>
      </svg>
    );
  }
  if (kind === 'donut') {
    const cx = W/2, cy = H/2+2, r = 24, rr = 16;
    const segs = [{v:0.42, c:color},{v:0.28, c:'var(--c2)'},{v:0.18, c:'var(--c3)'},{v:0.12, c:'var(--c6)'}];
    let a0 = -Math.PI/2;
    return (
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{display:'block'}}>
        {segs.map((s,i) => {
          const a1 = a0 + s.v * Math.PI*2;
          const large = s.v > 0.5 ? 1 : 0;
          const x1 = cx + r*Math.cos(a0), y1 = cy + r*Math.sin(a0);
          const x2 = cx + r*Math.cos(a1), y2 = cy + r*Math.sin(a1);
          const x3 = cx + rr*Math.cos(a1), y3 = cy + rr*Math.sin(a1);
          const x4 = cx + rr*Math.cos(a0), y4 = cy + rr*Math.sin(a0);
          const d = `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${rr},${rr} 0 ${large} 0 ${x4},${y4} Z`;
          a0 = a1;
          return <path key={i} d={d} fill={s.c}/>;
        })}
        <text x={cx} y={cy+4} textAnchor="middle" fontFamily="var(--font-mono)" fontWeight="600" fontSize="12" fill="var(--ink)" letterSpacing="-0.02em">AA</text>
      </svg>
    );
  }
  return null;
}

// --- Section heading helper (TradingView style) ---
function SectionHead({title, subtitle, seeAll, onSeeAll}) {
  return (
    <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:14}}>
      <div>
        <h2 style={{margin:0, fontSize:22, fontWeight:700, letterSpacing:'-0.02em', color:'var(--ink)'}}>{title}</h2>
        {subtitle && <div style={{fontSize:13, color:'var(--ink-3)', marginTop:4}}>{subtitle}</div>}
      </div>
      {seeAll && <button onClick={onSeeAll} style={{fontSize:13, color:'var(--accent)', fontWeight:500, display:'flex', alignItems:'center', gap:4}}>See all <span style={{fontSize:14}}>›</span></button>}
    </div>
  );
}

// --- Ticker pill (logo circle + name + price + delta), TradingView "indices" style ---
function TickerPill({code, name, sub, price, delta, spark, color, onClick}) {
  const up = delta >= 0;
  return (
    <button onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:12, padding:'14px 16px',
      background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8,
      width:'100%', textAlign:'left', transition:'all 120ms',
    }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--ink-5)'; e.currentTarget.style.boxShadow='var(--shadow-md)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.boxShadow='none';}}
    >
      <div style={{width:36, height:36, borderRadius:'50%', background:color||'var(--accent)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0, fontFamily:'var(--font-mono)', letterSpacing:'-0.02em'}}>{code}</div>
      <div style={{flex:1, minWidth:0}}>
        <div style={{fontSize:13, fontWeight:600, color:'var(--ink)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{name}</div>
        {sub && <div style={{fontSize:11, color:'var(--ink-4)', marginTop:1}}>{sub}</div>}
      </div>
      <div style={{textAlign:'right', flexShrink:0}}>
        <div className="mono" style={{fontSize:14, fontWeight:700, color:'var(--ink)'}}>{price}</div>
        <div className="mono" style={{fontSize:11.5, color: up?'var(--pos)':'var(--neg)', fontWeight:600, marginTop:2}}>{up?'+':''}{delta.toFixed(2)}%</div>
      </div>
    </button>
  );
}

function NovaHome({openDash}) {
  // Map portfolios → ticker entries using their actual data
  const colors = ['var(--c1)','var(--c2)','var(--c4)','var(--c5)','var(--c6)','var(--c7)','var(--c3)','var(--c8)'];
  const portfolios = DATA.portfolios.slice(0, 8).map((p, i) => ({
    ...p,
    code: p.name.split(' ').map(w=>w[0]).join('').slice(0,3).toUpperCase(),
    color: colors[i % colors.length],
  }));

  // Featured strip — TradingView "Indices" pattern
  const featured = [
    { id:'performance', code:'PRF', name:'Performance',    sub:'Returns & Attribution',   price:'+5.18%', delta: 2.13, color:'var(--c1)' },
    { id:'risk',        code:'RSK', name:'Risk',           sub:'VaR · CVaR · Stress',     price:'$46.3M', delta:-0.12, color:'var(--c4)' },
    { id:'esg',         code:'ESG', name:'Sustainability', sub:'ESG · Climate · Pillars', price:'5.50',   delta: 0.24, color:'var(--c2)' },
    { id:'issuer',      code:'MRD', name:'Issuer Detail',  sub:'Single-name · Peers',     price:'AA',     delta: 1.10, color:'var(--c5)' },
  ];

  // Top issuers
  const issuers = [
    { code:'AXS', name:'Apex Systems',        sub:'US · Tech',         price:'4.21%', delta:  6.4, spark: series(24,100,1.2,11), color:'var(--c1)' },
    { code:'CDR', name:'Calder Industries',   sub:'US · Industrials',  price:'3.87%', delta: -1.2, spark: series(24,100,1.0,12), color:'var(--c4)' },
    { code:'MRD', name:'Meridian Industries', sub:'US · Industrials',  price:'3.42%', delta:  2.8, spark: series(24,100,0.9,13), color:'var(--c5)' },
    { code:'ORN', name:'Orion Holdings',      sub:'EU · Materials',    price:'2.95%', delta:  0.4, spark: series(24,100,1.4,14), color:'var(--c6)' },
    { code:'SBL', name:'Sable & Co.',         sub:'UK · Financials',   price:'2.61%', delta: -2.1, spark: series(24,100,1.3,15), color:'var(--c2)' },
    { code:'NVL', name:'Novalis Group',       sub:'EU · Healthcare',   price:'2.23%', delta:  3.1, spark: series(24,100,0.8,16), color:'var(--c7)' },
  ];

  // Reports
  const reports = [
    { id:'esg',         name:'Sustainable Portfolio Report', cls:'Holdings', theme:'Sustainable Investment', updated:'1 hr ago',   owner:'Maya Klein' },
    { id:'performance', name:'Performance Report',           cls:'Holdings', theme:'Performance',            updated:'2 min ago',  owner:'Maya Klein' },
    { id:'issuer',      name:'Issuer Report',                cls:'Company',  theme:'Research',               updated:'22 min ago', owner:'J. Park'    },
    { id:'risk',        name:'Risk Report',                  cls:'Holdings', theme:'Risk',                   updated:'5 min ago',  owner:'D. Oduya'   },
    { id:'esg',         name:'Carbon Report',                cls:'Company',  theme:'Sustainable Investment', updated:'Yesterday',  owner:'A. Ventura' },
    { id:'performance', name:'Attribution Report',           cls:'Holdings', theme:'Performance',            updated:'Yesterday',  owner:'Maya Klein' },
  ];

  return (
    <div style={{flex:1, overflow:'auto', background:'var(--bg)'}}>
      <div style={{maxWidth:1400, margin:'0 auto', padding:'40px 32px 64px'}}>

        {/* Hero */}
        <div style={{marginBottom:36}}>
          <h1 style={{margin:0, fontSize:38, fontWeight:700, letterSpacing:'-0.03em', color:'var(--ink)'}}>Markets, everywhere</h1>
          <p style={{margin:'8px 0 0', fontSize:15, color:'var(--ink-3)', maxWidth:600}}>Your portfolio analytics in one place — performance, risk, sustainability, and issuer drill-down.</p>
        </div>

        {/* Featured "Indices" strip */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:48}}>
          {featured.map(f => (<TickerPill key={f.id} {...f} onClick={()=>openDash(f.id)}/>))}
        </div>

        {/* Portfolios section */}
        <section style={{marginBottom:48}}>
          <SectionHead title="Portfolios" subtitle="Holdings by mandate · monthly returns" seeAll onSeeAll={()=>openDash('performance')}/>
          <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8, overflow:'hidden'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
              <thead>
                <tr style={{color:'var(--ink-4)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em', background:'var(--bg-sunken)'}}>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>Symbol</th>
                  <th style={{textAlign:'right', padding:'10px 14px', fontWeight:600}}>Market value</th>
                  <th style={{textAlign:'right', padding:'10px 14px', fontWeight:600}}>1M</th>
                  <th style={{textAlign:'right', padding:'10px 14px', fontWeight:600}}>YTD</th>
                  <th style={{textAlign:'right', padding:'10px 14px', fontWeight:600}}>Excess</th>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>24M</th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((p,i)=>(
                  <tr key={i} onClick={()=>openDash('performance')} style={{borderTop:'1px solid var(--line-faint)', cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-sunken)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'12px 14px'}}>
                      <div style={{display:'flex', alignItems:'center', gap:10}}>
                        <div style={{width:30, height:30, borderRadius:'50%', background:p.color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', flexShrink:0}}>{p.code}</div>
                        <div style={{minWidth:0}}>
                          <div style={{fontSize:13, fontWeight:600, color:'var(--ink)'}}>{p.name}</div>
                          <div style={{fontSize:11, color:'var(--ink-4)', marginTop:1}}>{p.ccy}</div>
                        </div>
                      </div>
                    </td>
                    <td className="num" style={{padding:'12px 14px', color:'var(--ink)', fontWeight:500}}>${nfmt(p.mv,1)}</td>
                    <td className="num" style={{padding:'12px 14px', color:p.pnl>=0?'var(--pos)':'var(--neg)', fontWeight:600}}>{p.pnl>=0?'+':''}{p.pnl.toFixed(2)}%</td>
                    <td className="num" style={{padding:'12px 14px', color:p.ytd>=0?'var(--pos)':'var(--neg)', fontWeight:600}}>{p.ytd>=0?'+':''}{p.ytd.toFixed(2)}%</td>
                    <td className="num" style={{padding:'12px 14px', color:p.ytdx>=0?'var(--pos)':'var(--neg)', fontWeight:600}}>{p.ytdx>=0?'+':''}{p.ytdx.toFixed(2)}%</td>
                    <td style={{padding:'12px 14px', width:100}}><NovaSpark data={p.spark} width={84} height={24} grad/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Asset Allocation */}
        <section style={{marginBottom:48}}>
          <SectionHead title="Asset allocation" subtitle="Current snapshot by asset class" seeAll onSeeAll={()=>openDash('performance')}/>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8, padding:20}}>
              <NovaDonut segments={[
                {label:'Equities',         value:40.8, color:'var(--c1)'},
                {label:'Corporate Bonds',  value:25.0, color:'var(--c2)'},
                {label:'Government Bonds', value:12.2, color:'var(--c5)'},
                {label:'Private Equity',   value:11.0, color:'var(--c6)'},
                {label:'Hedge Funds',      value:8.0,  color:'var(--c7)'},
                {label:'Other',            value:3.0,  color:'var(--c3)'},
              ]} centerLabel="$2.83B" centerSub="Total MV"/>
            </div>
            <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8, padding:'8px 12px'}}>
              <NovaArea series={DATA.allocationHistory.series.slice(0,5)} labels={DATA.allocationHistory.labels} height={260}/>
            </div>
          </div>
        </section>

        {/* Top Issuers */}
        <section style={{marginBottom:48}}>
          <SectionHead title="Top issuers" subtitle="Holdings ranked by exposure" seeAll onSeeAll={()=>openDash('issuer')}/>
          <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8, overflow:'hidden'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
              <thead>
                <tr style={{color:'var(--ink-4)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em', background:'var(--bg-sunken)'}}>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>Issuer</th>
                  <th style={{textAlign:'right', padding:'10px 14px', fontWeight:600}}>Exposure</th>
                  <th style={{textAlign:'right', padding:'10px 14px', fontWeight:600}}>1M</th>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>24M</th>
                </tr>
              </thead>
              <tbody>
                {issuers.map((it,i)=>{
                  const up = it.delta >= 0;
                  return (
                    <tr key={i} onClick={()=>openDash('issuer')} style={{borderTop:'1px solid var(--line-faint)', cursor:'pointer'}}
                      onMouseEnter={e=>e.currentTarget.style.background='var(--bg-sunken)'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <td style={{padding:'12px 14px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:10}}>
                          <div style={{width:30, height:30, borderRadius:'50%', background:it.color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, fontFamily:'var(--font-mono)', flexShrink:0}}>{it.code}</div>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:13, fontWeight:600, color:'var(--ink)'}}>{it.name}</div>
                            <div style={{fontSize:11, color:'var(--ink-4)', marginTop:1}}>{it.sub}</div>
                          </div>
                        </div>
                      </td>
                      <td className="num" style={{padding:'12px 14px', fontWeight:600, color:'var(--ink)'}}>{it.price}</td>
                      <td className="num" style={{padding:'12px 14px', color: up?'var(--pos)':'var(--neg)', fontWeight:600}}>{up?'+':''}{it.delta.toFixed(2)}%</td>
                      <td style={{padding:'12px 14px', width:100}}><NovaSpark data={it.spark} width={84} height={24} grad color={up?'var(--pos)':'var(--neg)'}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Risk + Sustainability */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:48}}>
          <section>
            <SectionHead title="Risk" subtitle="VaR · CVaR · stress" seeAll onSeeAll={()=>openDash('risk')}/>
            <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8, overflow:'hidden'}}>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', borderBottom:'1px solid var(--line-faint)'}}>
                <RiskTile label="VaR 95%" value="$46.3M" delta={-0.12} sep/>
                <RiskTile label="VaR 99%" value="$54.2M" delta={0.34}/>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr'}}>
                <RiskTile label="CVaR" value="$56.7M" delta={0.21} sep/>
                <RiskTile label="Sharpe" value="1.42" delta={0.09}/>
              </div>
            </div>
          </section>
          <section>
            <SectionHead title="Sustainability" subtitle="ESG scores by pillar" seeAll onSeeAll={()=>openDash('esg')}/>
            <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8, padding:'16px 12px', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:8}}>
              <MiniGauge value={5.50} label="ESG" color="var(--c1)"/>
              <MiniGauge value={4.21} label="E"   color="var(--c2)"/>
              <MiniGauge value={6.30} label="S"   color="var(--c6)"/>
              <MiniGauge value={9.28} label="G"   color="var(--c5)"/>
            </div>
          </section>
        </div>

        {/* Reports */}
        <section>
          <SectionHead title="Recent reports" subtitle="Saved analytics across all workspaces"/>
          <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:8, overflow:'hidden'}}>
            <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
              <thead>
                <tr style={{color:'var(--ink-4)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.04em', background:'var(--bg-sunken)'}}>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>Name</th>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>Class</th>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>Theme</th>
                  <th style={{textAlign:'left', padding:'10px 14px', fontWeight:600}}>Owner</th>
                  <th style={{textAlign:'right', padding:'10px 14px', fontWeight:600}}>Updated</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r,i)=>(
                  <tr key={i} onClick={()=>openDash(r.id)} style={{borderTop:'1px solid var(--line-faint)', cursor:'pointer'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-sunken)'}
                    onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{padding:'12px 14px', color:'var(--accent)', fontWeight:600}}>{r.name}</td>
                    <td style={{padding:'12px 14px', color:'var(--ink-3)'}}><span style={{fontSize:11, padding:'2px 7px', border:'1px solid var(--line)', borderRadius:4}}>{r.cls}</span></td>
                    <td style={{padding:'12px 14px', color:'var(--ink-2)'}}>{r.theme}</td>
                    <td style={{padding:'12px 14px', color:'var(--ink-3)'}}>{r.owner}</td>
                    <td style={{padding:'12px 14px', textAlign:'right', color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontSize:11.5}}>{r.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
}

function RiskTile({label, value, delta, sep}) {
  const up = delta >= 0;
  return (
    <div style={{padding:'18px 20px', borderRight: sep ? '1px solid var(--line-faint)' : 'none'}}>
      <div style={{fontSize:11, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600}}>{label}</div>
      <div className="mono" style={{fontSize:24, fontWeight:700, color:'var(--ink)', marginTop:6, letterSpacing:'-0.02em'}}>{value}</div>
      <div className="mono" style={{fontSize:12, color: up?'var(--pos)':'var(--neg)', marginTop:4, fontWeight:600}}>{up?'+':''}{delta.toFixed(2)}%</div>
    </div>
  );
}

function MiniGauge({value, label, color}) {
  const pct = value / 10;
  const r = 28, cx = 36, cy = 36;
  const start = Math.PI, end = 0;
  const a = start + (end - start) * pct;
  const x1 = cx + r*Math.cos(start), y1 = cy + r*Math.sin(start);
  const x2 = cx + r*Math.cos(end),   y2 = cy + r*Math.sin(end);
  const xp = cx + r*Math.cos(a),     yp = cy + r*Math.sin(a);
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'4px'}}>
      <svg width={72} height={42} viewBox={`0 0 72 42`}>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${x2},${y2}`} fill="none" stroke="var(--bg-sunken)" strokeWidth="6" strokeLinecap="round"/>
        <path d={`M${x1},${y1} A${r},${r} 0 0 1 ${xp},${yp}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"/>
      </svg>
      <div className="mono" style={{fontSize:18, fontWeight:700, color:'var(--ink)', marginTop:-4, letterSpacing:'-0.02em'}}>{value.toFixed(2)}</div>
      <div style={{fontSize:11, color:'var(--ink-4)', marginTop:2, fontWeight:600, letterSpacing:'0.04em'}}>{label}</div>
    </div>
  );
}

function HeroKpi({label, value, delta, deltaLabel, spark, hero, compact}) {
  const up = delta>=0;
  return (
    <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:14, padding: compact?'14px 14px':'18px 20px', position:'relative', overflow:'hidden', boxShadow: hero?'var(--shadow-glow)':'none', minWidth:0}}>
      {hero && <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'var(--grad)'}}/>}
      <div style={{fontSize:10, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', fontWeight:500, marginBottom: compact?8:10}}>{label}</div>
      <div className="mono" style={{fontSize: compact?20:30, fontWeight:600, letterSpacing:'-0.025em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{value}</div>
      <div style={{display:'flex', alignItems:'center', gap:8, marginTop: compact?8:10}}>
        <div className="mono" style={{fontSize:10.5, color:up?'var(--pos)':'var(--neg)', display:'flex', alignItems:'center', gap:2, padding:'2px 6px', background:up?'var(--pos-soft)':'var(--neg-soft)', borderRadius:5, fontWeight:500, flexShrink:0}}>
          <span style={{fontSize:7}}>{up?'▲':'▼'}</span>{Math.abs(delta).toFixed(2)}{deltaLabel||'%'}
        </div>
        <div style={{flex:1, minWidth:0}}><NovaSpark data={spark} width={compact?80:120} height={20} grad color={hero?'var(--accent)':(up?'var(--pos)':'var(--neg)')}/></div>
      </div>
    </div>
  );
}

function NovaPerf() {
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(6, minmax(0, 1fr))', gap:12}}>
        <HeroKpi label="Total MV" value="$2.83B" delta={2.41} spark={series(20,100,2,101,0.5)} hero compact/>
        <HeroKpi label="MTD" value="+3.10%" delta={0.18} spark={series(20,100,1.5,102,0.3)} compact/>
        <HeroKpi label="YTD" value="+5.18%" delta={1.63} deltaLabel="pts" spark={series(20,100,2.2,103,0.8)} compact/>
        <HeroKpi label="Active" value="+2.13%" delta={-0.04} spark={series(20,100,0.8,104,0.2)} compact/>
        <HeroKpi label="Tracking" value="2.84%" delta={-0.12} spark={series(20,100,0.5,105,0)} compact/>
        <HeroKpi label="Sharpe" value="1.42" delta={0.09} deltaLabel="" spark={series(20,100,1.1,107,0.2)} compact/>
      </div>

      <NovaPanel title="Performance Results" subtitle="Net of Fees · Monthly · GBP" actions={<div style={{display:'flex', gap:4}}><NovaChip>Account</NovaChip><NovaChip active>Asset</NovaChip><NovaChip>Strategy</NovaChip></div>}>
        <NovaPerfTable/>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <NovaPanel title="Allocation History" subtitle="by Asset Class">
          <NovaArea series={DATA.allocationHistory.series} labels={DATA.allocationHistory.labels} height={260}/>
        </NovaPanel>
        <NovaPanel title="Allocation" subtitle="Current snapshot">
          <NovaDonut segments={[
            {label:'Equities', value:40.8, color:'var(--c1)'},
            {label:'Corp Bonds', value:25.0, color:'var(--c6)'},
            {label:'Other', value:21.7, color:'var(--c3)'},
            {label:'Govt Bonds', value:12.2, color:'var(--c2)'},
            {label:'Cash', value:0.3, color:'var(--c5)'},
          ]} centerLabel="$992K" centerSub="Total MV"/>
        </NovaPanel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <NovaPanel title="Returns by Account" subtitle="vs MSCI World">
          <NovaBar groups={DATA.returnsByAccount.labels} series={DATA.returnsByAccount.data} compareLine={DATA.returnsByAccount.line} height={240}/>
        </NovaPanel>
        <NovaPanel title="Investment Trend" subtitle="vs Fund Index">
          <NovaBar groups={DATA.varTrend.labels} series={DATA.varTrend.series} compareLine={DATA.varTrend.line} height={240}/>
        </NovaPanel>
      </div>
    </div>
  );
}

function NovaPerfTable() {
  return (
    <div style={{overflow:'auto', maxHeight:320, margin:'-8px -6px 0'}}>
    <table style={{width:'100%', borderCollapse:'collapse', fontSize:11.5}}>
      <thead>
        <tr style={{color:'var(--ink-4)', fontSize:9.5, textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--bg-sunken)'}}>
          <th style={nth}>Portfolio</th>
          <th style={nth}>Ccy</th>
          <th style={{...nth, textAlign:'right'}}>Market Value</th>
          <th style={{...nth, textAlign:'right'}}>1M</th>
          <th style={{...nth, textAlign:'right'}}>YTD</th>
          <th style={{...nth, textAlign:'right'}}>Benchmark</th>
          <th style={{...nth, textAlign:'right'}}>Excess</th>
          <th style={nth}>24M</th>
        </tr>
      </thead>
      <tbody>
        {DATA.portfolios.map((p,i)=>(
          <tr key={i} style={{borderTop:'1px solid var(--line-faint)'}} onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
            <td style={{...ntd, color:'var(--ink)', fontWeight:500}}>{p.name}</td>
            <td style={{...ntd, color:'var(--ink-3)'}}>{p.ccy}</td>
            <td className="num" style={ntd}>{p.mv.toLocaleString(undefined,{maximumFractionDigits:0})}</td>
            <td className="num" style={{...ntd, color: p.pnl>=0?'var(--pos)':'var(--neg)'}}>{p.pnl.toFixed(2)}%</td>
            <td className="num" style={{...ntd, color: p.ytd>=0?'var(--pos)':'var(--neg)'}}>{p.ytd.toFixed(2)}%</td>
            <td className="num" style={{...ntd, color:'var(--ink-3)'}}>{p.ytdbm.toFixed(2)}%</td>
            <td className="num" style={{...ntd, color: p.ytdx>=0?'var(--pos)':'var(--neg)', fontWeight:500}}>{p.ytdx>=0?'+':''}{p.ytdx.toFixed(2)}%</td>
            <td style={ntd}><NovaSpark data={p.spark} width={70} height={20} grad/></td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

const nth = {textAlign:'left', padding:'10px 14px', fontWeight:500};
const ntd = {padding:'10px 14px'};

function NovaRisk() {
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:12}}>
        <HeroKpi label="VaR 95%" value="$46.3M" delta={-0.12} spark={series(20,100,1.5,201,-0.1)} hero/>
        <HeroKpi label="VaR 99%" value="$54.2M" delta={0.34} spark={series(20,100,1.8,202,0.1)}/>
        <HeroKpi label="CVaR" value="$56.7M" delta={0.21} spark={series(20,100,2,203,0.15)}/>
        <HeroKpi label="Beta" value="1.08" delta={0.03} deltaLabel="" spark={series(20,100,0.8,204,0.05)}/>
        <HeroKpi label="Leverage" value="1.42×" delta={-0.02} deltaLabel="" spark={series(20,100,0.5,205,0)}/>
      </div>

      <NovaPanel title="Risk Summary" subtitle="Aggregate & fund-level breakdown">
        <div style={{overflow:'auto', margin:'-8px -6px 0'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:11.5}}>
          <thead>
            <tr style={{color:'var(--ink-4)', fontSize:9.5, textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--bg-sunken)'}}>
              <th style={nth}>View</th><th style={{...nth, textAlign:'right'}}>PV</th><th style={{...nth, textAlign:'right'}}>VaR 95%</th><th style={{...nth, textAlign:'right'}}>%</th><th style={{...nth, textAlign:'right'}}>VaR 99%</th><th style={{...nth, textAlign:'right'}}>%</th><th style={{...nth, textAlign:'right'}}>CVaR</th><th style={{...nth, textAlign:'right'}}>%</th>
            </tr>
          </thead>
          <tbody>
            {DATA.riskSummary.map((r,i)=>(
              <tr key={i} style={{borderTop:'1px solid var(--line-faint)'}}>
                <td style={{...ntd, fontWeight: i===0?600:500}}>{r.view}</td>
                <td className="num" style={ntd}>{r.mv.toLocaleString()}</td>
                <td className="num" style={ntd}>{r.var95.toLocaleString()}</td>
                <td className="num" style={{...ntd, background: novaHeat(r.var95p-3, [-5,5]), fontWeight:500}}>{r.var95p.toFixed(2)}</td>
                <td className="num" style={ntd}>{r.var99.toLocaleString()}</td>
                <td className="num" style={{...ntd, background: novaHeat(r.var99p-3, [-5,5]), fontWeight:500}}>{r.var99p.toFixed(2)}</td>
                <td className="num" style={ntd}>{r.cvar.toLocaleString()}</td>
                <td className="num" style={{...ntd, background: novaHeat(r.cvarp-5, [-5,5]), fontWeight:500}}>{r.cvarp.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16}}>
        <NovaPanel title="By Currency × Asset" subtitle="Market value %"><NovaStackedBar groups={DATA.mvByCurrency.labels} series={DATA.mvByCurrency.data} height={250}/></NovaPanel>
        <NovaPanel title="Risk Contribution" subtitle="By risk type"><NovaBar groups={DATA.riskContribution.labels} series={DATA.riskContribution.data} height={250}/></NovaPanel>
        <NovaPanel title="Top 10 Issuers" subtitle="By exposure"><NovaStackedBar groups={DATA.topIssuers.labels} series={DATA.topIssuers.data} height={250}/></NovaPanel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <NovaPanel title="Value at Risk" subtitle="Time series, 24M"><NovaArea series={DATA.varHistory.series} labels={DATA.varHistory.labels} height={260}/></NovaPanel>
        <NovaPanel title="Regional Flow" subtitle="Notional, USD m">
          <NovaRegionMap regions={DATA.tradesByRegion} height={160}/>
          <div style={{marginTop:10, display:'flex', flexDirection:'column', gap:4}}>
            {DATA.tradesByRegion.slice(0,5).map(r=>(
              <div key={r.code} style={{display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--line-faint)', fontSize:11}}>
                <span style={{color:'var(--ink-3)'}}>{r.name}</span>
                <span className="mono">{nfmt(r.value,0)}</span>
              </div>
            ))}
          </div>
        </NovaPanel>
      </div>

      <NovaPanel title="Strategy Funnel" subtitle="Pitched → P&L+">
        <NovaFunnel stages={DATA.pnlByStrat.stages} height={220}/>
      </NovaPanel>
    </div>
  );
}

function NovaEsg() {
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
        <NovaPanel title="ESG Score" subtitle="Weighted"><NovaGauge value={5.50} max={10} label="ESG" color="var(--c1)"/></NovaPanel>
        <NovaPanel title="Environmental" subtitle="Pillar"><NovaGauge value={4.21} max={10} label="E" color="var(--c2)"/></NovaPanel>
        <NovaPanel title="Social" subtitle="Pillar"><NovaGauge value={6.30} max={10} label="S" color="var(--c6)"/></NovaPanel>
        <NovaPanel title="Governance" subtitle="Pillar"><NovaGauge value={9.28} max={10} label="G" color="var(--c3)"/></NovaPanel>
      </div>

      <NovaPanel title="Sector Breakdown" subtitle="Weighted key issues by GICS sector">
        <div style={{overflow:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:11.5}}>
          <thead>
            <tr style={{color:'var(--ink-4)', fontSize:9.5, textTransform:'uppercase', letterSpacing:'0.05em', background:'var(--bg-sunken)'}}>
              <th style={nth}>GICS Sector</th><th style={nth}>Weight</th><th style={{...nth, textAlign:'right'}}>Key Issues</th><th style={{...nth, textAlign:'right'}}>E</th><th style={{...nth, textAlign:'right'}}>S</th><th style={{...nth, textAlign:'right'}}>G</th>
            </tr>
          </thead>
          <tbody>
            {DATA.sectorBreakdown.map((r,i)=>(
              <tr key={i} style={{borderTop:'1px solid var(--line-faint)'}}>
                <td style={ntd}>{r.sector}</td>
                <td style={{...ntd, width:200}}><NovaBarMini value={r.weight*100} color="var(--c1)"/></td>
                <td className="num" style={ntd}>{r.wk.toFixed(2)}</td>
                <td className="num" style={{...ntd, background: novaHeat(r.env-6.5, [-5,4]), fontWeight:500}}>{r.env.toFixed(2)}</td>
                <td className="num" style={{...ntd, background: novaHeat(r.soc-6.5, [-5,4]), fontWeight:500}}>{r.soc.toFixed(2)}</td>
                <td className="num" style={{...ntd, background: novaHeat(r.gov-6.5, [-5,4]), fontWeight:500}}>{r.gov.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </NovaPanel>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
        <NovaPanel title="ESG Trend" subtitle="Quarterly">
          <NovaBar groups={DATA.esgTrend.labels} series={DATA.esgTrend.bars} compareLine={DATA.esgTrend.line} height={240}/>
        </NovaPanel>
        <NovaPanel title="Climate Alignment" subtitle="Portfolio weight by bucket">
          <NovaBar groups={['1.5°C','<2°C','>2°C','>4°C','N/R']} series={[{name:'Weight', data:[8,42,20,18,12], color:'var(--c2)'}]} height={240} showLegend={false}/>
        </NovaPanel>
      </div>
    </div>
  );
}

function NovaIssuer() {
  const d = DATA.issuer;
  return (
    <div style={{flex:1, overflow:'auto', padding:24, display:'flex', flexDirection:'column', gap:16}}>
      <div style={{background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:14, padding:'20px 24px', display:'flex', alignItems:'center', gap:20, boxShadow:'var(--shadow-sm)'}}>
        <div style={{width:56, height:56, borderRadius:14, background:'var(--grad)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:18, fontFamily:'var(--font-mono)', boxShadow:'var(--shadow-glow)'}}>{d.ticker.slice(0,2)}</div>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'baseline', gap:12}}>
            <h2 style={{margin:0, fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>{d.name}</h2>
            <span className="mono" style={{fontSize:12, color:'var(--ink-3)'}}>{d.ticker} · {d.market}</span>
            <span style={{fontSize:10, padding:'3px 8px', background:'var(--pos-soft)', color:'var(--pos)', borderRadius:6, fontWeight:500}}>ESG AA</span>
          </div>
          <div style={{fontSize:12, color:'var(--ink-3)', marginTop:6, display:'flex', gap:18}}>
            <span>{d.sector}</span><span>🇺🇸 {d.country}</span><span>{d.mcap}</span>
          </div>
        </div>
        <button style={{padding:'8px 16px', background:'var(--grad)', color:'white', borderRadius:8, fontSize:12, fontWeight:500, boxShadow:'0 4px 12px -3px var(--accent-glow)'}}>Open Data Explorer →</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16}}>
        <NovaPanel title="ESG Rating" subtitle="Current">
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'20px 0'}}>
            <div className="mono grad-text" style={{fontSize:68, fontWeight:700, lineHeight:1, letterSpacing:'-0.04em'}}>{d.esg}</div>
            <div style={{fontSize:11, color:'var(--ink-3)', marginTop:6}}>Industry mode: <span style={{fontWeight:500, color:'var(--ink-2)'}}>B</span></div>
          </div>
        </NovaPanel>
        <NovaPanel title="ESG Score" subtitle="Weighted"><NovaGauge value={9.0} max={10} label="ESG" color="var(--accent)" large/></NovaPanel>
        <NovaPanel title="Pillar Scores">
          <div style={{display:'flex', flexDirection:'column', gap:14, padding:'4px'}}>
            <PillarRow label="E" value={d.e} color="var(--c2)"/>
            <PillarRow label="S" value={d.s} color="var(--c6)"/>
            <PillarRow label="G" value={d.g} color="var(--c3)"/>
          </div>
        </NovaPanel>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
        <NovaPanel title="Revenue & Exposure" subtitle="Quarterly, $M">
          <NovaBar groups={['Q1 23','Q2 23','Q3 23','Q4 23','Q1 24','Q2 24','Q3 24','Q4 24','Q1 25','Q2 25','Q3 25','Q4 25']} series={[{name:'Revenue', data: d.revenue, color:'var(--c1)'}]} compareLine={{name:'Exposure', data: d.revenue.map((_,i)=>2800 + i*50 + (i%3)*30), color:'var(--accent-2)'}} height={260}/>
        </NovaPanel>
        <NovaPanel title="Peer Comparison">
          <table style={{width:'100%', borderCollapse:'collapse', fontSize:11.5}}>
            <thead><tr style={{color:'var(--ink-4)', fontSize:9.5, textTransform:'uppercase', letterSpacing:'0.05em'}}><th style={nth}>Entity</th><th style={{...nth, textAlign:'right'}}>ESG</th><th style={{...nth, textAlign:'right'}}>E</th><th style={{...nth, textAlign:'right'}}>S</th><th style={{...nth, textAlign:'right'}}>G</th></tr></thead>
            <tbody>{d.peers.map((p,i)=>(
              <tr key={i} style={{borderTop:'1px solid var(--line-faint)', background: p.self?'var(--accent-soft)':''}}>
                <td style={{...ntd, fontWeight: p.self?600:400}}>{p.name}</td>
                <td className="num" style={ntd}>{p.score}</td>
                <td className="num" style={ntd}>{p.e}</td>
                <td className="num" style={ntd}>{p.s}</td>
                <td className="num" style={ntd}>{p.g}</td>
              </tr>
            ))}</tbody>
          </table>
        </NovaPanel>
      </div>
    </div>
  );
}

function PillarRow({label, value, color}) {
  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:4}}>
        <span style={{width:20, height:20, borderRadius:5, background:color, color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:10}}>{label}</span>
        <span style={{fontSize:11, color:'var(--ink-3)', flex:1}}>Score out of 100</span>
        <span className="mono" style={{fontWeight:600, fontSize:15}}>{value}</span>
      </div>
      <div style={{height:8, background:'var(--bg-sunken)', borderRadius:4, overflow:'hidden'}}>
        <div style={{width:`${value}%`, height:'100%', background:`linear-gradient(90deg, ${color}66, ${color})`, borderRadius:4}}/>
      </div>
    </div>
  );
}

Object.assign(window, { NovaHome, NovaPerf, NovaRisk, NovaEsg, NovaIssuer, HeroKpi });
