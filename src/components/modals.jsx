// Command palette + share modal.
// Both dialogs: role=dialog, focus-trapped, Escape-dismissable, return focus on close.
import React, { useState, useEffect, useRef, useCallback } from 'react';

const FOCUSABLE = 'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])';

// Wrap Tab at dialog boundaries. Focus first element on mount; restore previous focus on unmount.
function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const dialog = ref.current;
    const prev = document.activeElement;

    const focusables = () => Array.from(dialog.querySelectorAll(FOCUSABLE)).filter(el => !el.disabled);
    if (document.activeElement === document.body || !dialog.contains(document.activeElement)) {
      focusables()[0]?.focus();
    }

    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0], last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    dialog.addEventListener('keydown', onKey);
    return () => {
      dialog.removeEventListener('keydown', onKey);
      if (prev instanceof HTMLElement) prev.focus();
    };
  }, [ref, active]);
}

// Inline 12px category icons for the command palette — replaces unicode glyphs.
const CMDK_ICONS = {
  nav: <path d="M3 6h12M9 2l4 4-4 4"/>,
  act: <path d="M7 1v5H3l6 8V9h4z"/>,
  iss: <><circle cx="8" cy="8" r="6"/><path d="M8 4v4l2 2"/></>,
};

export function NovaCmdK({onClose, onNav}) {
  const [q, setQ] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef(null);

  const items = [
    {type:'nav', label:'Dashboards', hint:'Home', id:'home'},
    {type:'nav', label:'Performance', hint:'Returns & attribution', id:'performance'},
    {type:'nav', label:'Risk', hint:'VaR, CVaR, exposure', id:'risk'},
    {type:'nav', label:'Sustainability', hint:'ESG / Climate', id:'esg'},
    {type:'nav', label:'Issuer Detail', hint:'Single-name', id:'issuer'},
    {type:'act', label:'Run: Monthly IPS Report', hint:'Export PDF'},
    {type:'act', label:'Toggle dark mode', hint:'View'},
    {type:'iss', label:'Meridian Industries (MRDI)', hint:'US · Industrials'},
    {type:'iss', label:'Apex Systems (APXS)', hint:'US · Tech'},
  ];
  const filtered = items.filter(i => !q || i.label.toLowerCase().includes(q.toLowerCase()));

  useFocusTrap(dialogRef, true);

  const activate = useCallback((item) => {
    if (!item) return;
    if (item.type === 'nav') onNav(item.id);
    onClose();
  }, [onNav, onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter')   { e.preventDefault(); activate(filtered[activeIndex]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, filtered, activeIndex, activate]);

  // Reset highlight when the filter result set shrinks.
  useEffect(() => { setActiveIndex(0); }, [q]);

  let runningIndex = -1;
  return (
    <div
      onClick={onClose}
      style={{position:'fixed', inset:0, background:'var(--scrim)', zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:140, backdropFilter:'blur(8px)'}}
    >
      <div
        ref={dialogRef}
        onClick={e=>e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        style={{width:600, background:'var(--bg-elev-2)', border:'1px solid var(--line-strong)', borderRadius:'var(--radius-xl)', boxShadow:'var(--shadow-pop)', overflow:'hidden'}}
      >
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'16px 18px', borderBottom:'1px solid var(--line)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{color:'var(--ink-4)'}} aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            autoFocus
            value={q}
            onChange={e=>setQ(e.target.value)}
            placeholder="Search or run command…"
            aria-label="Search commands"
            style={{flex:1, background:'none', border:0, outline:0, fontSize:'var(--fs-lg)'}}
          />
          <kbd style={{fontFamily:'var(--font-mono)', fontSize:'var(--fs-2xs)', padding:'3px 7px', border:'1px solid var(--line-strong)', borderRadius:5, color:'var(--ink-4)'}}>Esc</kbd>
        </div>
        <div role="listbox" aria-label="Commands" style={{maxHeight:400, overflowY:'auto', padding:'8px 0'}}>
          {['nav','act','iss'].map(type=>{
            const g = filtered.filter(i=>i.type===type);
            if (!g.length) return null;
            return (
              <div key={type}>
                <div style={{fontSize:'var(--fs-2xs)', letterSpacing:'0.1em', color:'var(--ink-4)', padding:'10px 18px 6px', fontWeight:600, textTransform:'uppercase'}}>
                  {type==='nav'?'Navigate':type==='act'?'Actions':'Issuers'}
                </div>
                {g.map((it)=>{
                  runningIndex += 1;
                  const idx = runningIndex;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={`${it.type}-${it.label}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={()=>activate(it)}
                      onMouseEnter={()=>setActiveIndex(idx)}
                      style={{
                        display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 18px',
                        fontSize:'var(--fs-sm)', textAlign:'left',
                        background: isActive ? 'var(--bg-hover)' : 'transparent',
                        color:'var(--ink)',
                      }}
                    >
                      <svg width="12" height="12" viewBox={it.type==='iss' ? '0 0 16 16' : '0 0 16 16'} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{color:'var(--ink-4)', flexShrink:0}} aria-hidden="true">
                        {CMDK_ICONS[it.type]}
                      </svg>
                      <span style={{flex:1}}>{it.label}</span>
                      <span style={{color:'var(--ink-4)', fontSize:'var(--fs-xs)'}}>{it.hint}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function NovaShare({onClose}) {
  const dialogRef = useRef(null);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{position:'fixed', inset:0, background:'var(--scrim)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)'}}
    >
      <div
        ref={dialogRef}
        onClick={e=>e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        style={{width:480, background:'var(--bg-elev-2)', border:'1px solid var(--line-strong)', borderRadius:'var(--radius-xl)', boxShadow:'var(--shadow-pop)', overflow:'hidden'}}
      >
        <div style={{padding:'16px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center'}}>
          <h3 id="share-title" style={{margin:0, fontSize:'var(--fs-lg)', fontWeight:600}}>Share or Export</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{marginLeft:'auto', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-4)', borderRadius:'var(--radius)', background:'transparent', border:0, transition:'background 120ms, color 120ms'}}
            onMouseEnter={e=>{e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-4)';}}
            onFocus={e=>{e.currentTarget.style.background='var(--bg-hover)'; e.currentTarget.style.color='var(--ink)';}}
            onBlur={e=>{e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--ink-4)';}}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{padding:20, display:'flex', flexDirection:'column', gap:18}}>
          <div>
            <div style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, fontWeight:600}}>Link</div>
            <div style={{display:'flex', gap:8}}>
              <input
                readOnly
                value="https://analytics_dashbaord/w/performance"
                aria-label="Shareable link"
                style={{flex:1, background:'var(--bg-sunken)', border:'1px solid var(--line)', borderRadius:8, padding:'8px 12px', fontSize:'var(--fs-xs)', fontFamily:'var(--font-mono)'}}
              />
              <button style={{padding:'0 16px', background:'var(--accent)', color:'white', borderRadius:8, fontSize:'var(--fs-sm)', fontWeight:500, border:0}}>Copy</button>
            </div>
          </div>
          <div>
            <div style={{fontSize:'var(--fs-2xs)', color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, fontWeight:600}}>Export</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
              {['PDF','XLSX','PNG','CSV','PPTX','API'].map(l=>(
                <button key={l} style={{padding:'10px', background:'var(--bg-sunken)', border:'1px solid var(--line)', borderRadius:8, fontSize:'var(--fs-xs)'}}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
