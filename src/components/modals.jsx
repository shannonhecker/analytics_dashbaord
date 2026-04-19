// Command palette + share modal + tweaks panel.
import React, { useState, useEffect } from 'react';

export function NovaCmdK({onClose, onNav}) {
  const [q, setQ] = useState('');
  useEffect(()=>{
    const h=(e)=>{if(e.key==='Escape') onClose();};
    window.addEventListener('keydown', h);
    return ()=>window.removeEventListener('keydown', h);
  },[onClose]);
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
  const f = items.filter(i=>!q || i.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(5,7,12,0.7)', zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:140, backdropFilter:'blur(8px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:600, background:'var(--bg-elev-2)', border:'1px solid var(--line-strong)', borderRadius:14, boxShadow:'var(--shadow-pop)', overflow:'hidden'}}>
        <div style={{display:'flex', alignItems:'center', gap:12, padding:'16px 18px', borderBottom:'1px solid var(--line)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'var(--ink-4)'}}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search or run command…" style={{flex:1, background:'none', border:0, outline:0, fontSize:14}}/>
          <kbd style={{fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 7px', border:'1px solid var(--line-strong)', borderRadius:5, color:'var(--ink-4)'}}>Esc</kbd>
        </div>
        <div style={{maxHeight:400, overflowY:'auto', padding:'8px 0'}}>
          {['nav','act','iss'].map(type=>{
            const g = f.filter(i=>i.type===type); if(!g.length) return null;
            return (
              <div key={type}>
                <div style={{fontSize:10, letterSpacing:'0.1em', color:'var(--ink-4)', padding:'10px 18px 6px', fontWeight:600, textTransform:'uppercase'}}>{type==='nav'?'Navigate':type==='act'?'Actions':'Issuers'}</div>
                {g.map((it,i)=>(
                  <button key={i} onClick={()=>{if(it.type==='nav') onNav(it.id); onClose();}} style={{display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 18px', fontSize:12.5, background:'transparent'}}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{color:'var(--ink-4)', width:16}}>{type==='nav'?'→':type==='act'?'⚡':'◈'}</span>
                    <span style={{flex:1, textAlign:'left'}}>{it.label}</span>
                    <span style={{color:'var(--ink-4)', fontSize:11}}>{it.hint}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function NovaShare({onClose}) {
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(5,7,12,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:480, background:'var(--bg-elev-2)', border:'1px solid var(--line-strong)', borderRadius:14, boxShadow:'var(--shadow-pop)', overflow:'hidden'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center'}}>
          <h3 style={{margin:0, fontSize:14, fontWeight:600}}>Share or Export</h3>
          <button onClick={onClose} style={{marginLeft:'auto', color:'var(--ink-4)', background:'none', border:0, cursor:'pointer'}}>✕</button>
        </div>
        <div style={{padding:20, display:'flex', flexDirection:'column', gap:18}}>
          <div>
            <div style={{fontSize:10.5, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, fontWeight:500}}>Link</div>
            <div style={{display:'flex', gap:8}}>
              <input readOnly value="https://analytics_dashbaord/w/performance" style={{flex:1, background:'var(--bg-sunken)', border:'1px solid var(--line)', borderRadius:8, padding:'8px 12px', fontSize:11.5, fontFamily:'var(--font-mono)'}}/>
              <button style={{padding:'0 16px', background:'var(--accent)', color:'white', borderRadius:8, fontSize:12, fontWeight:500, border:0, cursor:'pointer'}}>Copy</button>
            </div>
          </div>
          <div>
            <div style={{fontSize:10.5, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, fontWeight:500}}>Export</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
              {['PDF','XLSX','PNG','CSV','PPTX','API'].map(l=>(<button key={l} style={{padding:'10px', background:'var(--bg-sunken)', border:'1px solid var(--line)', borderRadius:8, fontSize:11.5, cursor:'pointer'}}>{l}</button>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
