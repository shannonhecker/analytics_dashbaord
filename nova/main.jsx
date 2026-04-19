// Nova main
const NOVA_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": 265,
  "density": "comfortable",
  "theme": "dark"
}/*EDITMODE-END*/;

function NovaApp() {
  const [screen, setScreen] = React.useState(localStorage.getItem('nova.screen') || 'home');
  const [tweaks, setTweaks] = React.useState(()=>{
    try { return {...NOVA_DEFAULTS, ...JSON.parse(localStorage.getItem('nova.tweaks')||'{}')}; }
    catch { return NOVA_DEFAULTS; }
  });
  const [cmdkOpen, setCmdk] = React.useState(false);
  const [shareOpen, setShare] = React.useState(false);
  const [editMode, setEdit] = React.useState(false);
  const [tabs, setTabs] = React.useState([
    {id:'home', title:'Home', closeable:false},
    {id:'performance', title:'Performance', dot:'var(--c1)'},
    {id:'risk', title:'Risk', dot:'var(--c4)'},
    {id:'esg', title:'Sustainability', dot:'var(--c2)'},
  ]);

  React.useEffect(()=>localStorage.setItem('nova.screen', screen), [screen]);
  React.useEffect(()=>localStorage.setItem('nova.tweaks', JSON.stringify(tweaks)), [tweaks]);
  React.useEffect(()=>{
    // shift hue for accent swatch changes
    const h = tweaks.accent;
    document.documentElement.style.setProperty('--accent-h', h);
    document.documentElement.style.setProperty('--accent', `oklch(68% 0.20 ${h})`);
    document.documentElement.style.setProperty('--accent-2', `oklch(78% 0.16 ${(h+55)%360})`);
    document.documentElement.style.setProperty('--accent-soft', `oklch(30% 0.08 ${h} / 0.35)`);
    document.documentElement.style.setProperty('--accent-glow', `oklch(68% 0.22 ${h} / 0.4)`);
    document.documentElement.style.setProperty('--grad', `linear-gradient(135deg, oklch(68% 0.22 ${h}), oklch(78% 0.18 ${(h+55)%360}))`);
    document.documentElement.setAttribute('data-density', tweaks.density);
    document.documentElement.setAttribute('data-theme', tweaks.theme);
  }, [tweaks]);

  React.useEffect(()=>{
    const h = (e)=>{
      if ((e.metaKey||e.ctrlKey) && e.key==='k') { e.preventDefault(); setCmdk(o=>!o); }
    };
    window.addEventListener('keydown', h);
    return ()=>window.removeEventListener('keydown', h);
  },[]);

  React.useEffect(()=>{
    const onMsg = (e)=>{
      const d=e.data||{};
      if (d.type==='__activate_edit_mode') setEdit(true);
      if (d.type==='__deactivate_edit_mode') setEdit(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({type:'__edit_mode_available'}, '*');
    return ()=>window.removeEventListener('message', onMsg);
  },[]);

  const applyTweaks = (patch)=>{
    setTweaks(t=>({...t, ...patch}));
    window.parent.postMessage({type:'__edit_mode_set_keys', edits:patch}, '*');
  };

  const openScreen = (id)=>{
    setScreen(id);
    if (!tabs.find(t=>t.id===id)) {
      const titles = {performance:'Performance',risk:'Risk',esg:'Sustainability',issuer:'Issuer Detail'};
      const dots = {performance:'var(--c1)',risk:'var(--c4)',esg:'var(--c2)',issuer:'var(--c5)'};
      setTabs([...tabs, {id, title:titles[id]||id, dot:dots[id]}]);
    }
  };
  const closeTab = (id)=>{
    const next = tabs.filter(t=>t.id!==id);
    setTabs(next);
    if (screen===id) setScreen(next[next.length-1]?.id||'home');
  };

  const filters = {
    performance:[{label:'Period', value:'Monthly'},{label:'Currency', value:'GBP'},{label:'Benchmark', value:'Primary'},{label:'As of', value:'Dec 2024'}],
    risk:[{label:'Period', value:'1D/10D'},{label:'Confidence', value:'95% · 99%'},{label:'As of', value:'Dec 2024'}],
    esg:[{label:'Benchmark', value:'MSCI World'},{label:'As of', value:'01 Jan 2024'}],
    issuer:[{label:'Peer group', value:'Industrials'},{label:'Date', value:'01 Jan 2024'}],
    home:[{label:'Account', value:'All workspaces'},{label:'As of', value:'Live'}],
  };

  const title = {performance:'Performance', risk:'Risk', esg:'Sustainability', issuer:'Meridian Industries', home:'Dashboards'};
  const sub = {
    performance:'Returns, attribution, and benchmark comparison',
    risk:'VaR · CVaR · exposure · stress scenarios',
    esg:'ESG scoring, climate alignment, sector contribution',
    issuer:'Industrials / Aerospace · Single-name deep dive',
    home:'Your analytics overview',
  };

  return (
    <div style={{height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)'}}>
      <NovaTopBar tabs={tabs} active={screen} setActive={setScreen} closeTab={closeTab} onCmdK={()=>setCmdk(true)} theme={tweaks.theme} setTheme={(t)=>applyTweaks({theme:t})} onShare={()=>setShare(true)}/>
      {screen !== 'home' && <NovaFilterBar title={title[screen]} subtitle={sub[screen]} filters={filters[screen]}/>}
      <div style={{flex:1, display:'flex', minHeight:0}}>
        <NovaLeftNav screen={screen} setScreen={openScreen}/>
        <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column'}} data-screen-label={`screen-${screen}`}>
          {screen==='home' && <NovaHome openDash={openScreen}/>}
          {screen==='performance' && <NovaPerf/>}
          {screen==='risk' && <NovaRisk/>}
          {screen==='esg' && <NovaEsg/>}
          {screen==='issuer' && <NovaIssuer/>}
        </div>
      </div>
      {cmdkOpen && <NovaCmdK onClose={()=>setCmdk(false)} onNav={openScreen}/>}
      {shareOpen && <NovaShare onClose={()=>setShare(false)}/>}
      {editMode && <NovaTweaks tweaks={tweaks} setTweaks={applyTweaks} onClose={()=>setEdit(false)}/>}
    </div>
  );
}

function NovaCmdK({onClose, onNav}) {
  const [q, setQ] = React.useState('');
  React.useEffect(()=>{
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

function NovaShare({onClose}) {
  return (
    <div onClick={onClose} style={{position:'fixed', inset:0, background:'rgba(5,7,12,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)'}}>
      <div onClick={e=>e.stopPropagation()} style={{width:480, background:'var(--bg-elev-2)', border:'1px solid var(--line-strong)', borderRadius:14, boxShadow:'var(--shadow-pop)', overflow:'hidden'}}>
        <div style={{padding:'16px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center'}}>
          <h3 style={{margin:0, fontSize:14, fontWeight:600}}>Share or Export</h3>
          <button onClick={onClose} style={{marginLeft:'auto', color:'var(--ink-4)'}}>✕</button>
        </div>
        <div style={{padding:20, display:'flex', flexDirection:'column', gap:18}}>
          <div>
            <div style={{fontSize:10.5, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, fontWeight:500}}>Link</div>
            <div style={{display:'flex', gap:8}}>
              <input readOnly value="https://helix.nova/w/performance" style={{flex:1, background:'var(--bg-sunken)', border:'1px solid var(--line)', borderRadius:8, padding:'8px 12px', fontSize:11.5, fontFamily:'var(--font-mono)'}}/>
              <button style={{padding:'0 16px', background:'var(--grad)', color:'white', borderRadius:8, fontSize:12, fontWeight:500}}>Copy</button>
            </div>
          </div>
          <div>
            <div style={{fontSize:10.5, color:'var(--ink-4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:8, fontWeight:500}}>Export</div>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8}}>
              {['PDF','XLSX','PNG','CSV','PPTX','API'].map(l=>(<button key={l} style={{padding:'10px', background:'var(--bg-sunken)', border:'1px solid var(--line)', borderRadius:8, fontSize:11.5}}>{l}</button>))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NovaTweaks({tweaks, setTweaks, onClose}) {
  const swatches = [{h:265,n:'Violet'},{h:210,n:'Cyan'},{h:160,n:'Teal'},{h:320,n:'Pink'},{h:30,n:'Amber'},{h:12,n:'Coral'}];
  return (
    <div style={{position:'fixed', right:20, bottom:20, width:280, background:'var(--bg-elev-2)', border:'1px solid var(--line-strong)', borderRadius:14, boxShadow:'var(--shadow-pop)', padding:18, zIndex:50}}>
      <div style={{display:'flex', alignItems:'center', marginBottom:14}}>
        <div style={{fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase'}}>Tweaks</div>
        <button onClick={onClose} style={{marginLeft:'auto', color:'var(--ink-4)'}}>✕</button>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10.5, color:'var(--ink-4)', marginBottom:8, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:500}}>Accent Hue</div>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          {swatches.map(s=>(<button key={s.h} title={s.n} onClick={()=>setTweaks({accent:s.h})} style={{width:32, height:32, borderRadius:8, background:`linear-gradient(135deg, oklch(68% 0.22 ${s.h}), oklch(78% 0.18 ${(s.h+55)%360}))`, border: tweaks.accent===s.h?'2px solid var(--ink)':'2px solid transparent'}}/>))}
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10.5, color:'var(--ink-4)', marginBottom:8, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:500}}>Density</div>
        <div style={{display:'flex', background:'var(--bg-sunken)', borderRadius:8, padding:3}}>
          {['comfortable','compact'].map(d=>(<button key={d} onClick={()=>setTweaks({density:d})} style={{flex:1, padding:'6px 10px', borderRadius:6, fontSize:11.5, background: tweaks.density===d?'var(--bg-elev-2)':'transparent', fontWeight: tweaks.density===d?500:400, textTransform:'capitalize'}}>{d}</button>))}
        </div>
      </div>
      <div>
        <div style={{fontSize:10.5, color:'var(--ink-4)', marginBottom:8, letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:500}}>Theme</div>
        <div style={{display:'flex', background:'var(--bg-sunken)', borderRadius:8, padding:3}}>
          {['dark','light'].map(t=>(<button key={t} onClick={()=>setTweaks({theme:t})} style={{flex:1, padding:'6px 10px', borderRadius:6, fontSize:11.5, background: tweaks.theme===t?'var(--bg-elev-2)':'transparent', fontWeight: tweaks.theme===t?500:400, textTransform:'capitalize'}}>{t}</button>))}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<NovaApp/>);
