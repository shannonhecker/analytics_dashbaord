// Shell — sticky left icon rail + sticky sub-header + panel/chip primitives.
// Responsive: desktop/tablet use the 72px left rail; mobile switches to a
// fixed bottom tab bar, with utility buttons moved into the top header.
import React from 'react';
import { useViewport } from '../hooks/use-viewport.js';

// Runtime check — the global tokens.css rule neutralises transition-duration
// under reduced-motion but inline `transform: translateY(-1px)` snaps
// instantly without it. Hover handlers skip the translate when this is true.
const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// `label` is shown in the rail (short). `title` (passed as aria-label + hover)
// carries the full name so screen readers and tooltips aren't abbreviated.
const NAV_ITEMS = [
  { id: 'home',        label: 'Home',     title: 'Dashboards',     icon: <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/> },
  { id: 'performance', label: 'Perf.',    title: 'Performance',    icon: <path d="M3 17l6-6 4 4 8-8"/> },
  { id: 'risk',        label: 'Risk',     title: 'Risk',           icon: <path d="M12 2 2 22h20L12 2zM12 9v5M12 18v.01"/> },
  { id: 'esg',         label: 'ESG',      title: 'Sustainability', icon: <path d="M12 2a10 10 0 0 0-10 10c0 5 4 9 10 9s10-4 10-9A10 10 0 0 0 12 2z M7 13c2 3 5 5 10 5"/> },
  { id: 'issuer',      label: 'Issuer',   title: 'Issuer',         icon: <path d="M3 21h18M5 21V7l7-4 7 4v14"/> },
];

function NovaLogo() {
  return (
    <div title="analytics_dashbaord" style={{display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40, borderRadius:8, background:'var(--grad)'}}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20 Q 12 4 20 20" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round"/><circle cx="12" cy="12" r="2" fill="white"/></svg>
    </div>
  );
}

/**
 * Primary navigation. Desktop/tablet: left rail. Mobile: bottom tab bar.
 * Utility actions (search, share, theme, avatar) only render in the rail —
 * on mobile they move to the NovaFilterBar header so they're above-the-fold.
 */
export function NovaLeftNav({screen, setScreen, theme, setTheme, onCmdK, onShare}) {
  const { isMobile } = useViewport();
  if (isMobile) {
    return <MobileBottomNav screen={screen} setScreen={setScreen}/>;
  }
  return <DesktopRail screen={screen} setScreen={setScreen} theme={theme} setTheme={setTheme} onCmdK={onCmdK} onShare={onShare}/>;
}

function DesktopRail({screen, setScreen, theme, setTheme, onCmdK, onShare}) {
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <aside style={{
      width:72, background:'var(--bg-elev)', borderRight:'1px solid var(--line)',
      display:'flex', flexDirection:'column', alignItems:'center', padding:'14px 0',
      gap:6, flexShrink:0, position:'sticky', top:0, height:'100vh',
    }}>
      <NovaLogo/>
      <div style={{height:8}}/>
      <nav aria-label="Primary" style={{display:'flex', flexDirection:'column', alignItems:'center', gap:2, width:'100%'}}>
        {NAV_ITEMS.map(it => {
          const active = screen===it.id;
          return (
            <button
              key={it.id}
              onClick={()=>setScreen(it.id)}
              aria-label={it.title}
              aria-current={active ? 'page' : undefined}
              title={it.title}
              style={{
                width:56, height:52, borderRadius:8,
                background: active ? 'var(--accent-soft)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--ink-3)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
                border:'1px solid transparent',
                position:'relative', transition:'background 120ms, color 120ms',
              }}
              onMouseEnter={e=>{if(!active){e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink-2)';}}}
              onMouseLeave={e=>{if(!active){e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)';}}}
              onFocus={e=>{if(!active){e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink-2)';}}}
              onBlur={e=>{if(!active){e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)';}}}
            >
              {active && <span aria-hidden="true" style={{position:'absolute', left:-8, top:10, bottom:10, width:3, background:'var(--accent)', borderTopRightRadius:2, borderBottomRightRadius:2}}/>}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{it.icon}</svg>
              <span style={{fontSize:'var(--fs-xs)', fontWeight:active?600:500, letterSpacing:'0.01em', lineHeight:1}}>{it.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={{flex:1}}/>
      <RailIcon onClick={onCmdK} label="Search (⌘K)"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></RailIcon>
      <RailIcon onClick={onShare} label="Share"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/></RailIcon>
      <RailIcon onClick={()=>setTheme(theme==='dark'?'light':'dark')} label={themeLabel}>
        {theme==='dark'
          ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>
          : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
      </RailIcon>
      <div style={{height:6}}/>
      <button
        aria-label="Maya Klein — account menu"
        title="Maya Klein"
        style={{width:36, height:36, borderRadius:'50%', background:'var(--grad)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'var(--fs-xs)', fontWeight:700, transition:'filter 120ms'}}
        onMouseEnter={e=>{e.currentTarget.style.filter='brightness(1.1)';}}
        onMouseLeave={e=>{e.currentTarget.style.filter='brightness(1)';}}
        onFocus={e=>{e.currentTarget.style.filter='brightness(1.1)';}}
        onBlur={e=>{e.currentTarget.style.filter='brightness(1)';}}
      >MK</button>
    </aside>
  );
}

/**
 * Mobile bottom tab bar. Fixed to viewport bottom, safe-area-inset padding,
 * 5 nav items only (utility actions live in the top header on mobile).
 */
function MobileBottomNav({screen, setScreen}) {
  return (
    <nav
      aria-label="Primary"
      style={{
        position:'fixed', left:0, right:0, bottom:0, zIndex:50,
        background:'var(--bg-elev)', borderTop:'1px solid var(--line)',
        display:'grid', gridTemplateColumns:`repeat(${NAV_ITEMS.length}, 1fr)`,
        paddingBottom:'env(safe-area-inset-bottom, 0)',
      }}
    >
      {NAV_ITEMS.map(it => {
        const active = screen===it.id;
        return (
          <button
            key={it.id}
            onClick={()=>setScreen(it.id)}
            aria-label={it.title}
            aria-current={active ? 'page' : undefined}
            style={{
              minHeight:56, padding:'8px 4px',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:2,
              background:'transparent', border:0,
              color: active ? 'var(--accent)' : 'var(--ink-4)',
              position:'relative',
            }}
          >
            {active && <span aria-hidden="true" style={{position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:24, height:2, background:'var(--accent)', borderBottomLeftRadius:2, borderBottomRightRadius:2}}/>}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{it.icon}</svg>
            <span style={{fontSize:'var(--fs-2xs)', fontWeight: active ? 600 : 500, lineHeight:1}}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function RailIcon({children, onClick, label}) {
  const hover = (e) => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink)'; };
  const leave = (e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)'; };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center',
        borderRadius:8, color:'var(--ink-3)',
        transition:'background 120ms, color 120ms',
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onFocus={hover}
      onBlur={leave}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    </button>
  );
}

// Mobile header utility button (Cmd+K, theme toggle). 44×44 per iOS HIG
// touch target; desktop never renders these (utilities live in the rail).
function HeaderIcon({children, onClick, label}) {
  const hover = (e) => { e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink)'; };
  const leave = (e) => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-3)'; };
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      style={{
        width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center',
        borderRadius:'var(--radius)', color:'var(--ink-3)', background:'transparent', border:0,
        transition:'background 120ms, color 120ms',
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onFocus={hover}
      onBlur={leave}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
    </button>
  );
}

/**
 * Sticky sub-header. Responsive:
 *   - Desktop: title + subtitle + filter pills + Export, single row
 *   - Tablet/mobile: title row; filter pills scroll-horizontal; mobile
 *     adds the utility actions (Cmd+K, share, theme) in the title row.
 */
export function NovaFilterBar({title, subtitle, filters, theme, setTheme, onCmdK, onShare}) {
  const { isMobile } = useViewport();
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  if (isMobile) {
    return (
      <div style={{padding:'16px 16px 12px', borderBottom:'1px solid var(--line)', background:'var(--bg-elev)', position:'sticky', top:0, zIndex:10}}>
        <div style={{display:'flex', alignItems:'flex-start', gap:8}}>
          <div style={{flex:1, minWidth:0}}>
            <h1 style={{margin:0, fontSize:'var(--fs-xl)', fontWeight:700, letterSpacing:'-0.02em', color:'var(--ink)'}}>{title}</h1>
            {subtitle && <div style={{fontSize:'var(--fs-xs)', color:'var(--ink-3)', marginTop:4}}>{subtitle}</div>}
          </div>
          {onCmdK && <HeaderIcon onClick={onCmdK} label="Search (⌘K)"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></HeaderIcon>}
          {setTheme && (
            <HeaderIcon onClick={()=>setTheme(theme==='dark'?'light':'dark')} label={themeLabel}>
              {theme==='dark'
                ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>
                : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}
            </HeaderIcon>
          )}
        </div>
        <div style={{position:'relative'}}>
          <div style={{display:'flex', gap:'var(--gap-xs)', marginTop:'var(--gap-sm)', overflowX:'auto', paddingBottom:4, scrollbarWidth:'none'}}>
            {filters.map((f,i)=><NovaFilter key={i} {...f}/>)}
            <button
              style={{flexShrink:0, height:44, padding:'0 16px', background:'var(--accent)', color:'white', borderRadius:'var(--radius)', fontSize:'var(--fs-sm)', fontWeight:600, transition:'filter 120ms'}}
              onMouseEnter={e=>{e.currentTarget.style.filter='brightness(1.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.filter='brightness(1)';}}
              onFocus={e=>{e.currentTarget.style.filter='brightness(1.08)';}}
              onBlur={e=>{e.currentTarget.style.filter='brightness(1)';}}
            >Export</button>
          </div>
          <div aria-hidden="true" style={{position:'absolute', top:12, right:0, bottom:4, width:16, background:'linear-gradient(to right, transparent, var(--bg-elev))', pointerEvents:'none'}}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:'20px 28px 16px', borderBottom:'1px solid var(--line)', background:'var(--bg-elev)', position:'sticky', top:0, zIndex:10}}>
      <div style={{display:'flex', alignItems:'flex-end', gap:'var(--gap-md)', flexWrap:'wrap'}}>
        <div style={{flex:1, minWidth:0}}>
          <h1 style={{margin:0, fontSize:'var(--fs-h1)', fontWeight:700, letterSpacing:'-0.02em', color:'var(--ink)'}}>{title}</h1>
          {subtitle && <div style={{fontSize:'var(--fs-md)', color:'var(--ink-3)', marginTop:4}}>{subtitle}</div>}
        </div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', alignItems:'center'}}>
          {filters.map((f,i)=><NovaFilter key={i} {...f}/>)}
          <button
            style={{height:32, padding:'0 14px', background:'var(--accent)', color:'white', borderRadius:6, fontSize:'var(--fs-sm)', fontWeight:600, transition:'filter 120ms'}}
            onMouseEnter={e=>{e.currentTarget.style.filter='brightness(1.08)';}}
            onMouseLeave={e=>{e.currentTarget.style.filter='brightness(1)';}}
            onFocus={e=>{e.currentTarget.style.filter='brightness(1.08)';}}
            onBlur={e=>{e.currentTarget.style.filter='brightness(1)';}}
          >Export</button>
        </div>
      </div>
    </div>
  );
}

// Read-only context pill. Behaves like a labelled value, not a dropdown —
// visual chevron removed until real filter logic is wired up.
function NovaFilter({label, value}) {
  return (
    <div
      role="group"
      aria-label={`${label}: ${value}`}
      style={{
        display:'flex', alignItems:'center', gap:8, height:32, padding:'0 12px',
        background:'var(--bg-elev)', border:'1px solid var(--line)', borderRadius:6,
        fontSize:'var(--fs-sm)', flexShrink:0, whiteSpace:'nowrap',
      }}
    >
      <span style={{color:'var(--ink-4)'}}>{label}</span>
      <span style={{color:'var(--ink)', fontWeight:600}}>{value}</span>
    </div>
  );
}

export function NovaPanel({title, subtitle, actions, children, padded=true, noHead, seeAll, onSeeAll, interactive=false, raised=false, subtle=false, onClick, as='h2'}) {
  // Default = flat outline (transparent bg, --line-faint border, no shadow).
  // Gives each section a clear boundary without the card-lift feel.
  // `raised` opts back into solid card chrome (bg + --line + shadow).
  // `subtle` kept as a no-op alias for backwards compat.
  const flat = !raised;
  const Root = interactive ? 'button' : 'div';
  return (
    <Root
      {...(interactive ? { onClick, type:'button' } : {})}
      style={{
        background: flat ? 'transparent' : 'var(--bg-elev)',
        border: flat ? '1px solid var(--line-faint)' : '1px solid var(--line)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: flat ? 'none' : 'var(--shadow-sm)',
        display:'flex', flexDirection:'column', overflow:'hidden', minHeight:0,
        textAlign: interactive ? 'left' : undefined,
        width: interactive ? '100%' : undefined,
        cursor: interactive ? 'pointer' : undefined,
        transition: interactive ? 'border-color 150ms, box-shadow 150ms, transform 150ms' : undefined,
      }}
      {...(interactive ? {
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = 'var(--line-strong)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          if (!prefersReducedMotion()) e.currentTarget.style.transform = 'translateY(-1px)';
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = 'var(--line)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'none';
        },
        onFocus: (e) => {
          e.currentTarget.style.borderColor = 'var(--line-strong)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          if (!prefersReducedMotion()) e.currentTarget.style.transform = 'translateY(-1px)';
        },
        onBlur: (e) => {
          e.currentTarget.style.borderColor = 'var(--line)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'none';
        },
      } : {})}
    >
      {!noHead && title && (
        <div style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'14px 18px 10px',
          borderBottom: flat ? '1px solid var(--line-faint)' : 'none',
        }}>
          <div style={{flex:1, minWidth:0}}>
            {React.createElement(as, {style:{margin:0, fontSize:'var(--fs-md)', fontWeight:600, letterSpacing:'-0.01em', color:'var(--ink)'}}, title)}
            {subtitle && <div style={{fontSize:'var(--fs-xs)', color:'var(--ink-4)', marginTop:2}}>{subtitle}</div>}
          </div>
          {actions}
          {seeAll && (
            <button
              onClick={onSeeAll}
              style={{fontSize:'var(--fs-sm)', color:'var(--accent)', fontWeight:500, background:'none', border:0, padding:0, transition:'color 120ms'}}
              onMouseEnter={e=>{e.currentTarget.style.color='var(--accent-2)';}}
              onMouseLeave={e=>{e.currentTarget.style.color='var(--accent)';}}
              onFocus={e=>{e.currentTarget.style.color='var(--accent-2)';}}
              onBlur={e=>{e.currentTarget.style.color='var(--accent)';}}
            >
              See all →
            </button>
          )}
        </div>
      )}
      <div style={{padding: padded ? (noHead?18:'0 18px 18px') : 0, flex:1, minHeight:0, display:'flex', flexDirection:'column'}}>
        {children}
      </div>
    </Root>
  );
}

export function NovaChip({children, active, onClick}) {
  const hover = (e) => {
    if (active) { e.currentTarget.style.filter = 'brightness(1.08)'; return; }
    e.currentTarget.style.background = 'var(--bg-hover)';
    e.currentTarget.style.color = 'var(--ink)';
  };
  const leave = (e) => {
    if (active) { e.currentTarget.style.filter = 'brightness(1)'; return; }
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = 'var(--ink-3)';
  };
  return (
    <button
      onClick={onClick}
      aria-pressed={active || undefined}
      style={{
        padding:'5px 10px', fontSize:'var(--fs-xs)', borderRadius:4,
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? 'white' : 'var(--ink-3)',
        border:'1px solid ' + (active ? 'var(--accent)' : 'var(--line)'),
        fontWeight: active ? 600 : 500,
        transition:'background 120ms, color 120ms, filter 120ms',
      }}
      onMouseEnter={hover}
      onMouseLeave={leave}
      onFocus={hover}
      onBlur={leave}
    >{children}</button>
  );
}
