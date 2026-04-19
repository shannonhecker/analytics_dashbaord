// Nova shell — airy top bar, pill nav, gradient logo
const { useState: useNS, useEffect: useNE, useRef: useNR } = React;

function NovaLogo() {
  return (
    <div style={{display:'flex', alignItems:'center', gap:10, paddingLeft:4}}>
      <div style={{width:28, height:28, borderRadius:8, background:'var(--grad)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-glow)'}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 20 Q 12 4 20 20" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round"/><circle cx="12" cy="12" r="2" fill="white"/></svg>
      </div>
      <div style={{display:'flex', flexDirection:'column', lineHeight:1.1}}>
        <span style={{fontWeight:600, fontSize:14, letterSpacing:'-0.015em'}}>Helix</span>
        <span style={{fontSize:9.5, color:'var(--ink-4)', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:500}}>Nova</span>
      </div>
    </div>
  );
}

function NovaTopBar({tabs, active, setActive, closeTab, onCmdK, theme, setTheme, onShare}) {
  return (
    <div style={{background:'var(--bg-elev)', borderBottom:'1px solid var(--line)'}}>
      {/* Single unified header row — logo, search, actions */}
      <div style={{padding:'0 18px', height:56, display:'flex', alignItems:'center', gap:12}}>
        <NovaLogo/>
        <div style={{display:'flex', gap:2, marginLeft:8}}>
          <NovaIcon title="Back"><path d="M15 18l-6-6 6-6"/></NovaIcon>
          <NovaIcon title="Forward"><path d="M9 18l6-6-6-6"/></NovaIcon>
          <NovaIcon title="Refresh"><path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/></NovaIcon>
        </div>
        <button onClick={onCmdK} style={{flex:1, display:'flex', alignItems:'center', gap:10, height:34, padding:'0 14px', border:'1px solid var(--line)', borderRadius:18, color:'var(--ink-3)', fontSize:12, background:'var(--bg-sunken)'}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <span style={{color:'var(--ink-4)', fontFamily:'var(--font-mono)', fontSize:11}}>helix.nova/</span>
          <span style={{color:'var(--ink-2)', fontFamily:'var(--font-mono)', fontSize:11}}>{tabs.find(t=>t.id===active)?.id||'home'}</span>
          <span style={{flex:1}}/>
          <kbd style={{fontFamily:'var(--font-mono)', fontSize:10, padding:'2px 6px', border:'1px solid var(--line-strong)', borderRadius:4, background:'var(--bg-elev-2)'}}>⌘K</kbd>
        </button>
        <div style={{display:'flex', gap:2}}>
          <NovaIcon onClick={onShare} title="Share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/></NovaIcon>
          <NovaIcon onClick={()=>setTheme(theme==='dark'?'light':'dark')} title="Theme">
            {theme==='dark'
              ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>
              : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
          </NovaIcon>
          <NovaIcon title="Notifications"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></NovaIcon>
        </div>
        <div style={{width:1, height:22, background:'var(--line)'}}/>
        <div style={{width:30, height:30, borderRadius:8, background:'var(--grad)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600}}>MK</div>
      </div>
      {/* Tabs row — sits below search, attached to content */}
      <div style={{background:'var(--bg-sunken)', borderTop:'1px solid var(--line)', display:'flex', alignItems:'flex-end', padding:'6px 14px 0', gap:2, height:40, marginBottom:-1}}>
        {tabs.map(t => {
          const isActive = active===t.id;
          return (
            <div key={t.id} onClick={()=>setActive(t.id)} style={{
              height:34, padding:'0 14px', minWidth:120, maxWidth:200,
              display:'flex', alignItems:'center', gap:8, fontSize:12, cursor:'pointer',
              color: isActive?'var(--ink)':'var(--ink-3)', fontWeight: isActive?500:400,
              background: isActive?'var(--bg)':'transparent',
              borderTopLeftRadius:10, borderTopRightRadius:10,
              border: isActive?'1px solid var(--line)':'1px solid transparent',
              borderBottom: isActive?'1px solid var(--bg)':'1px solid transparent',
              marginBottom: isActive?-1:0, marginRight:2,
              transition:'background 120ms, color 120ms',
            }}
              onMouseEnter={e=>{if(!isActive) e.currentTarget.style.background='var(--bg-hover)';}}
              onMouseLeave={e=>{if(!isActive) e.currentTarget.style.background='transparent';}}
            >
              {t.dot
                ? <span style={{width:7, height:7, borderRadius:'50%', background:t.dot, flexShrink:0, boxShadow: isActive?`0 0 8px ${t.dot}`:'none'}}/>
                : <span style={{width:12, height:12, borderRadius:3, background:'var(--grad)', flexShrink:0, opacity: isActive?1:0.7}}/>
              }
              <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.title}</span>
              {t.closeable!==false && (
                <span onClick={(e)=>{e.stopPropagation(); closeTab(t.id);}} style={{
                  width:16, height:16, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center',
                  opacity: isActive?0.6:0, color:'var(--ink-3)', fontSize:11,
                }}
                  onMouseEnter={e=>{e.currentTarget.style.opacity=1; e.currentTarget.style.background='var(--bg-hover)';}}
                  onMouseLeave={e=>{e.currentTarget.style.opacity=isActive?0.6:0; e.currentTarget.style.background='transparent';}}
                >✕</span>
              )}
            </div>
          );
        })}
        <button style={{height:28, width:28, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-4)', borderRadius:6, marginLeft:4, marginBottom:3, fontSize:15}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink-2)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-4)';}}
        >+</button>
      </div>
    </div>
  );
}

function NovaBrowserTabs({tabs, active, setActive, closeTab}) {
  // Logo sits "in" the window, at the far left, like a pinned app identity.
  return (
    <>
      <div style={{display:'flex', alignItems:'center', gap:10, paddingLeft:6, paddingRight:14, height:34, alignSelf:'center'}}>
        <NovaLogo/>
      </div>
      <div style={{display:'flex', alignItems:'flex-end', flex:1, gap:0, minWidth:0, overflow:'hidden'}}>
        {tabs.map(t => {
          const isActive = active===t.id;
          return (
            <div key={t.id} onClick={()=>setActive(t.id)} style={{
              position:'relative',
              height: isActive ? 38 : 32,
              padding:'0 14px',
              minWidth: 120, maxWidth: 200,
              display:'flex', alignItems:'center', gap:8,
              fontSize:12,
              cursor:'pointer',
              color: isActive ? 'var(--ink)' : 'var(--ink-3)',
              fontWeight: isActive ? 500 : 400,
              background: isActive ? 'var(--bg-elev)' : 'transparent',
              borderTopLeftRadius: 10, borderTopRightRadius: 10,
              border: isActive ? '1px solid var(--line)' : '1px solid transparent',
              borderBottom: isActive ? '1px solid var(--bg-elev)' : '1px solid transparent',
              marginBottom: isActive ? -1 : 0,
              marginRight: 2,
              transition: 'background 120ms, color 120ms',
            }}
              onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='var(--bg-hover)'; }}
              onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}
            >
              {t.dot
                ? <span style={{width:7, height:7, borderRadius:'50%', background:t.dot, flexShrink:0, boxShadow: isActive?`0 0 8px ${t.dot}`:'none'}}/>
                : <span style={{width:12, height:12, borderRadius:3, background:'var(--grad)', flexShrink:0, opacity: isActive?1:0.7}}/>
              }
              <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.title}</span>
              {t.closeable!==false && (
                <span onClick={(e)=>{e.stopPropagation(); closeTab(t.id);}} style={{
                  width:16, height:16, borderRadius:4, display:'flex', alignItems:'center', justifyContent:'center',
                  opacity: isActive?0.6:0, color:'var(--ink-3)', fontSize:11,
                  transition:'opacity 120ms, background 120ms',
                }}
                  onMouseEnter={e=>{e.currentTarget.style.opacity=1; e.currentTarget.style.background='var(--bg-hover)';}}
                  onMouseLeave={e=>{e.currentTarget.style.opacity=isActive?0.6:0; e.currentTarget.style.background='transparent';}}
                >✕</span>
              )}
            </div>
          );
        })}
        <button style={{height:32, width:32, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-4)', borderRadius:8, marginLeft:4, fontSize:16}}
          onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink-2)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-4)';}}
        >+</button>
      </div>
    </>
  );
}

function NovaIcon({children, onClick, title}) {
  return (
    <button onClick={onClick} title={title} style={{width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:8, color:'var(--ink-3)', border:'1px solid transparent'}}
      onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink)';}}
      onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)';}}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </button>
  );
}

function NovaLeftNav({screen, setScreen}) {
  const items = [
    { id: 'home', label: 'Dashboards', icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/> },
    { id: 'performance', label: 'Performance', icon: <path d="M3 17l6-6 4 4 8-8"/> },
    { id: 'risk', label: 'Risk', icon: <path d="M12 2 2 22h20L12 2zM12 9v5M12 18v.01"/> },
    { id: 'esg', label: 'Sustainability', icon: <path d="M12 2a10 10 0 0 0-10 10c0 5 4 9 10 9s10-4 10-9A10 10 0 0 0 12 2z M7 13c2 3 5 5 10 5"/> },
    { id: 'issuer', label: 'Issuer', icon: <path d="M3 21h18M5 21V7l7-4 7 4v14"/> },
  ];
  return (
    <div style={{width:72, background:'var(--bg-elev)', borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 0', gap:6, flexShrink:0}}>
      {items.map(it => {
        const active = screen===it.id;
        return (
          <button key={it.id} onClick={()=>setScreen(it.id)} title={it.label} style={{
            width:48, height:48, borderRadius:12,
            background: active ? 'var(--accent-soft)' : 'transparent',
            color: active ? 'var(--ink)' : 'var(--ink-3)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
            border: active ? '1px solid var(--accent)' : '1px solid transparent',
            boxShadow: active ? '0 0 20px -4px var(--accent-glow)' : 'none',
            position:'relative',
          }}
          onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink-2)';}}}
          onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)';}}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
            <span style={{fontSize:8.5, fontWeight:500}}>{it.label}</span>
          </button>
        );
      })}
      <div style={{flex:1}}/>
      <button style={{width:48, height:48, borderRadius:12, color:'var(--ink-4)', display:'flex', alignItems:'center', justifyContent:'center'}} title="Settings">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </button>
    </div>
  );
}

function NovaFilterBar({title, subtitle, filters}) {
  return (
    <div style={{padding:'20px 28px 16px', borderBottom:'1px solid var(--line)', background:'var(--bg-elev)'}}>
      <div style={{display:'flex', alignItems:'flex-end', gap:16}}>
        <div style={{flex:1}}>
          <h1 style={{margin:0, fontSize:22, fontWeight:600, letterSpacing:'-0.02em'}}>{title}</h1>
          {subtitle && <div style={{fontSize:12, color:'var(--ink-3)', marginTop:3}}>{subtitle}</div>}
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {filters.map((f,i)=><NovaFilter key={i} {...f}/>)}
          <button style={{height:32, padding:'0 14px', background:'var(--grad)', color:'white', borderRadius:8, fontSize:12, fontWeight:500, boxShadow:'0 4px 12px -3px var(--accent-glow)'}}>Export</button>
        </div>
      </div>
    </div>
  );
}

function NovaFilter({label, value}) {
  return (
    <button style={{display:'flex', alignItems:'center', gap:8, height:32, padding:'0 12px', background:'var(--bg-sunken)', border:'1px solid var(--line)', borderRadius:8, fontSize:11.5}}>
      <span style={{color:'var(--ink-4)'}}>{label}</span>
      <span style={{color:'var(--ink)', fontWeight:500}}>{value}</span>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--ink-4)'}}><path d="M3 5l3 3 3-3"/></svg>
    </button>
  );
}

function NovaPanel({title, subtitle, actions, children, padded=true, glow, noHead}) {
  return (
    <div style={{
      background:'var(--bg-elev)',
      border:'1px solid var(--line)',
      borderRadius:'var(--radius-lg)',
      boxShadow: glow ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
      display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0,
    }}>
      {!noHead && title && (
        <div style={{display:'flex', alignItems:'center', gap:10, padding:'14px 18px 10px'}}>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontSize:13, fontWeight:600, letterSpacing:'-0.01em'}}>{title}</div>
            {subtitle && <div style={{fontSize:11, color:'var(--ink-4)', marginTop:2}}>{subtitle}</div>}
          </div>
          {actions}
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
      padding:'4px 10px', fontSize:11, borderRadius:6,
      background: active ? 'var(--accent-soft)' : 'var(--bg-sunken)',
      color: active ? 'var(--ink)' : 'var(--ink-3)',
      border:'1px solid ' + (active ? 'var(--accent)' : 'var(--line)'),
      fontWeight: active ? 500 : 400,
    }}>{children}</button>
  );
}

Object.assign(window, { NovaTopBar, NovaLeftNav, NovaFilterBar, NovaFilter, NovaPanel, NovaIcon, NovaLogo, NovaChip });
