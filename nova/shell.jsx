// Shell — TradingView-style top text-nav, no left rail, no browser tabs.
const { useState: useNS, useEffect: useNE, useRef: useNR } = React;

const NAV_ITEMS = [
  { id: 'home',        label: 'Markets'        },
  { id: 'performance', label: 'Performance'    },
  { id: 'risk',        label: 'Risk'           },
  { id: 'esg',         label: 'Sustainability' },
  { id: 'issuer',      label: 'Issuer'         },
];

function NovaLogo() {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, paddingLeft:4}}>
      <div style={{width:28, height:28, borderRadius:6, background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 20 Q 12 4 20 20" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round"/><circle cx="12" cy="12" r="2" fill="white"/></svg>
      </div>
      <span style={{fontWeight:700, fontSize:15, letterSpacing:'-0.015em', color:'var(--ink)'}}>analytics_dashbaord</span>
    </div>
  );
}

function NovaTopBar({active, setActive, onCmdK, theme, setTheme, onShare}) {
  return (
    <div style={{background:'var(--bg-elev)', borderBottom:'1px solid var(--line)', position:'sticky', top:0, zIndex:20}}>
      <div style={{padding:'0 24px', height:56, display:'flex', alignItems:'center', gap:24}}>
        <NovaLogo/>
        <div style={{width:1, height:24, background:'var(--line)'}}/>
        {/* Primary text-nav (TradingView style) */}
        <nav style={{display:'flex', alignItems:'center', gap:4, height:'100%'}}>
          {NAV_ITEMS.map(it => (
            <NavLink key={it.id} active={active===it.id} onClick={()=>setActive(it.id)}>{it.label}</NavLink>
          ))}
        </nav>
        <div style={{flex:1}}/>
        {/* Search pill */}
        <button onClick={onCmdK} style={{display:'flex', alignItems:'center', gap:8, height:34, padding:'0 12px', border:'1px solid var(--line)', borderRadius:6, color:'var(--ink-3)', fontSize:13, background:'var(--bg-sunken)', minWidth:200}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{flex:1, textAlign:'left'}}>Search</span>
          <kbd style={{fontFamily:'var(--font-mono)', fontSize:10, padding:'2px 6px', border:'1px solid var(--line)', borderRadius:3, background:'var(--bg-elev)', color:'var(--ink-4)'}}>⌘K</kbd>
        </button>
        {/* Right actions */}
        <div style={{display:'flex', gap:2}}>
          <NovaIcon onClick={onShare} title="Share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/></NovaIcon>
          <NovaIcon onClick={()=>setTheme(theme==='dark'?'light':'dark')} title="Theme">
            {theme==='dark'
              ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>
              : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
          </NovaIcon>
          <NovaIcon title="Notifications"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></NovaIcon>
        </div>
        <button style={{padding:'0 16px', height:34, background:'var(--accent)', color:'white', borderRadius:6, fontSize:13, fontWeight:600}}>Get started</button>
        <div style={{width:30, height:30, borderRadius:'50%', background:'var(--grad)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600}}>MK</div>
      </div>
    </div>
  );
}

function NavLink({active, onClick, children}) {
  return (
    <button onClick={onClick} style={{
      position:'relative', height:56, padding:'0 14px',
      fontSize:14, fontWeight: active?600:500,
      color: active?'var(--ink)':'var(--ink-2)',
      display:'flex', alignItems:'center',
    }}
      onMouseEnter={e=>{if(!active) e.currentTarget.style.color='var(--accent)';}}
      onMouseLeave={e=>{if(!active) e.currentTarget.style.color='var(--ink-2)';}}
    >
      {children}
      {active && <span style={{position:'absolute', left:14, right:14, bottom:0, height:3, background:'var(--accent)', borderRadius:'3px 3px 0 0'}}/>}
    </button>
  );
}

function NovaIcon({children, onClick, title}) {
  return (
    <button onClick={onClick} title={title} style={{width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, color:'var(--ink-3)'}}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)';}}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </button>
  );
}

// Sub-page filter bar (used on Performance/Risk/ESG/Issuer screens)
function NovaFilterBar({title, subtitle, filters}) {
  return (
    <div style={{padding:'24px 32px 18px', borderBottom:'1px solid var(--line)', background:'var(--bg-elev)'}}>
      <div style={{display:'flex', alignItems:'flex-end', gap:16, maxWidth:1400, margin:'0 auto'}}>
        <div style={{flex:1}}>
          <h1 style={{margin:0, fontSize:26, fontWeight:700, letterSpacing:'-0.02em', color:'var(--ink)'}}>{title}</h1>
          {subtitle && <div style={{fontSize:13, color:'var(--ink-3)', marginTop:4}}>{subtitle}</div>}
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {filters.map((f,i)=><NovaFilter key={i} {...f}/>)}
          <button style={{height:34, padding:'0 16px', background:'var(--accent)', color:'white', borderRadius:6, fontSize:12.5, fontWeight:600}}>Export</button>
        </div>
      </div>
    </div>
  );
}

function NovaFilter({label, value}) {
  return (
    <button style={{display:'flex', alignItems:'center', gap:8, height:34, padding:'0 12px', background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:6, fontSize:12.5}}>
      <span style={{color:'var(--ink-4)'}}>{label}</span>
      <span style={{color:'var(--ink)', fontWeight:500}}>{value}</span>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--ink-4)'}}><path d="M3 5l3 3 3-3"/></svg>
    </button>
  );
}

// Card panel (used on sub-screens — kept light-themed)
function NovaPanel({title, subtitle, actions, children, padded=true, glow, noHead, seeAll}) {
  return (
    <div style={{
      background:'var(--bg-elev)',
      border:'1px solid var(--line)',
      borderRadius:'var(--radius-lg)',
      boxShadow:'var(--shadow-sm)',
      display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0,
    }}>
      {!noHead && title && (
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'14px 18px 10px'}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:14, fontWeight:600, letterSpacing:'-0.01em', color:'var(--ink)'}}>{title}</div>
            {subtitle && <div style={{fontSize:11.5, color:'var(--ink-4)', marginTop:2}}>{subtitle}</div>}
          </div>
          {actions}
          {seeAll && <a href="#" style={{fontSize:12, color:'var(--accent)', fontWeight:500, textDecoration:'none'}}>See all →</a>}
        </div>
      )}
      <div style={{padding: padded ? (noHead?18:'0 18px 18px') : 0, flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
        {children}
      </div>
    </div>
  );
}

function NovaChip({children, active, onClick}) {
  return (
    <button onClick={onClick} style={{
      padding:'5px 11px', fontSize:11.5, borderRadius:4,
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? 'white' : 'var(--ink-3)',
      border:'1px solid ' + (active ? 'var(--accent)' : 'var(--line)'),
      fontWeight: active ? 600 : 500,
    }}>{children}</button>
  );
}

// Backwards-compatible: NovaLeftNav stub (no longer rendered, but referenced in main.jsx — make it return null gracefully)
function NovaLeftNav() { return null; }

Object.assign(window, { NovaTopBar, NovaLeftNav, NovaFilterBar, NovaFilter, NovaPanel, NovaIcon, NovaLogo, NovaChip });
