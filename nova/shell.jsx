// Shell — institutional-style left icon rail (sticky) + sticky sub-header.
// No global top bar; nav lives in the rail.
const { useState: useNS, useEffect: useNE, useRef: useNR } = React;

function NovaLogo() {
  return (
    <div title="analytics_dashbaord" style={{display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:8, background:'var(--grad)'}}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 20 Q 12 4 20 20" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round"/><circle cx="12" cy="12" r="2" fill="white"/></svg>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'home',        label: 'Dashboards',     icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/> },
  { id: 'performance', label: 'Performance',    icon: <path d="M3 17l6-6 4 4 8-8"/> },
  { id: 'risk',        label: 'Risk',           icon: <path d="M12 2 2 22h20L12 2zM12 9v5M12 18v.01"/> },
  { id: 'esg',         label: 'Sustainability', icon: <path d="M12 2a10 10 0 0 0-10 10c0 5 4 9 10 9s10-4 10-9A10 10 0 0 0 12 2z M7 13c2 3 5 5 10 5"/> },
  { id: 'issuer',      label: 'Issuer',         icon: <path d="M3 21h18M5 21V7l7-4 7 4v14"/> },
];

function NovaLeftNav({screen, setScreen, theme, setTheme, onCmdK, onShare}) {
  return (
    <aside style={{
      width:72, background:'var(--bg-elev)', borderRight:'1px solid var(--line)',
      display:'flex', flexDirection:'column', alignItems:'center', padding:'14px 0',
      gap:6, flexShrink:0, position:'sticky', top:0, height:'100vh',
    }}>
      <NovaLogo/>
      <div style={{height:8}}/>
      {NAV_ITEMS.map(it => {
        const active = screen===it.id;
        return (
          <button key={it.id} onClick={()=>setScreen(it.id)} title={it.label} style={{
            width:54, height:54, borderRadius:8,
            background: active ? 'var(--accent-soft)' : 'transparent',
            color: active ? 'var(--accent)' : 'var(--ink-3)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
            border: active ? '1px solid transparent' : '1px solid transparent',
            position:'relative', transition:'background 120ms, color 120ms',
          }}
          onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink-2)';}}}
          onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)';}}}
          >
            {active && <span style={{position:'absolute', left:0, top:8, bottom:8, width:3, background:'var(--accent)', borderTopRightRadius:2, borderBottomRightRadius:2}}/>}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
            <span style={{fontSize:9, fontWeight:600, letterSpacing:'0.02em'}}>{it.label}</span>
          </button>
        );
      })}

      <div style={{flex:1}}/>

      {/* Bottom utilities */}
      <NovaRailIcon onClick={onCmdK} title="Search (⌘K)"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></NovaRailIcon>
      <NovaRailIcon onClick={onShare} title="Share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/></NovaRailIcon>
      <NovaRailIcon onClick={()=>setTheme(theme==='dark'?'light':'dark')} title="Theme">
        {theme==='dark'
          ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>
          : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
      </NovaRailIcon>
      <div style={{height:6}}/>
      <button title="Maya Klein" style={{width:36, height:36, borderRadius:'50%', background:'var(--grad)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700}}>MK</button>
    </aside>
  );
}

function NovaRailIcon({children, onClick, title}) {
  return (
    <button onClick={onClick} title={title} style={{
      width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center',
      borderRadius:8, color:'var(--ink-3)',
    }}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)';}}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </button>
  );
}

// Sticky sub-header — title + filters + Export
function NovaFilterBar({title, subtitle, filters}) {
  return (
    <div style={{padding:'20px 28px 16px', borderBottom:'1px solid var(--line)', background:'var(--bg-elev)', position:'sticky', top:0, zIndex:10}}>
      <div style={{display:'flex', alignItems:'flex-end', gap:16}}>
        <div style={{flex:1, minWidth:0}}>
          <h1 style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:'-0.02em', color:'var(--ink)'}}>{title}</h1>
          {subtitle && <div style={{fontSize:13, color:'var(--ink-3)', marginTop:4}}>{subtitle}</div>}
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {filters.map((f,i)=><NovaFilter key={i} {...f}/>)}
          <button style={{height:32, padding:'0 14px', background:'var(--accent)', color:'white', borderRadius:6, fontSize:12, fontWeight:600}}>Export</button>
        </div>
      </div>
    </div>
  );
}

function NovaFilter({label, value}) {
  return (
    <button style={{display:'flex', alignItems:'center', gap:8, height:32, padding:'0 12px', background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:6, fontSize:12}}>
      <span style={{color:'var(--ink-4)'}}>{label}</span>
      <span style={{color:'var(--ink)', fontWeight:600}}>{value}</span>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--ink-4)'}}><path d="M3 5l3 3 3-3"/></svg>
    </button>
  );
}

// Card panel — used everywhere for chart/data containers
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
            <div style={{fontSize:13.5, fontWeight:600, letterSpacing:'-0.01em', color:'var(--ink)'}}>{title}</div>
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
      padding:'5px 10px', fontSize:11.5, borderRadius:4,
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? 'white' : 'var(--ink-3)',
      border:'1px solid ' + (active ? 'var(--accent)' : 'var(--line)'),
      fontWeight: active ? 600 : 500,
    }}>{children}</button>
  );
}

// NovaTopBar / NovaIcon kept as no-op stubs in case anything imports them.
function NovaTopBar() { return null; }
function NovaIcon() { return null; }

Object.assign(window, { NovaTopBar, NovaLeftNav, NovaFilterBar, NovaFilter, NovaPanel, NovaIcon, NovaLogo, NovaChip });
