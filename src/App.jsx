import React, { useState, useEffect } from 'react';
import { NovaLeftNav, NovaFilterBar } from './components/shell.jsx';
import { NovaCmdK, NovaShare } from './components/modals.jsx';
import { Home } from './screens/Home.jsx';
import { Performance } from './screens/Performance.jsx';
import { Risk } from './screens/Risk.jsx';
import { Esg } from './screens/Esg.jsx';
import { Issuer } from './screens/Issuer.jsx';

const DEFAULTS = { theme: 'light' };

const TITLES = {
  home: 'Dashboards',
  performance: 'Performance',
  risk: 'Risk',
  esg: 'Sustainability',
  issuer: 'Meridian Industries',
};
const SUBTITLES = {
  home: 'Your analytics overview',
  performance: 'Returns, attribution, and benchmark comparison',
  risk: 'VaR · CVaR · exposure · stress scenarios',
  esg: 'ESG scoring, climate alignment, sector contribution',
  issuer: 'Industrials / Aerospace · Single-name deep dive',
};
const FILTERS = {
  home:        [{label:'Account', value:'All workspaces'},{label:'As of', value:'Live'}],
  performance: [{label:'Period', value:'Monthly'},{label:'Currency', value:'GBP'},{label:'Benchmark', value:'Primary'},{label:'As of', value:'Dec 2024'}],
  risk:        [{label:'Period', value:'1D/10D'},{label:'Confidence', value:'95% · 99%'},{label:'As of', value:'Dec 2024'}],
  esg:         [{label:'Benchmark', value:'MSCI World'},{label:'As of', value:'01 Jan 2024'}],
  issuer:      [{label:'Peer group', value:'Industrials'},{label:'Date', value:'01 Jan 2024'}],
};

export function App() {
  const [screen, setScreen] = useState(() => localStorage.getItem('nova.screen') || 'home');
  const [theme, setTheme] = useState(() => localStorage.getItem('nova.theme') || DEFAULTS.theme);
  const [cmdkOpen, setCmdk] = useState(false);
  const [shareOpen, setShare] = useState(false);

  useEffect(() => { localStorage.setItem('nova.screen', screen); }, [screen]);
  useEffect(() => {
    localStorage.setItem('nova.theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdk(o => !o);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <div style={{minHeight:'100vh', display:'flex', background:'var(--bg)', alignItems:'flex-start'}}>
      <NovaLeftNav
        screen={screen}
        setScreen={setScreen}
        theme={theme}
        setTheme={setTheme}
        onCmdK={() => setCmdk(true)}
        onShare={() => setShare(true)}
      />
      <main style={{flex:1, minWidth:0, display:'flex', flexDirection:'column'}}>
        <NovaFilterBar title={TITLES[screen]} subtitle={SUBTITLES[screen]} filters={FILTERS[screen]}/>
        {screen === 'home'        && <Home openDash={setScreen}/>}
        {screen === 'performance' && <Performance/>}
        {screen === 'risk'        && <Risk/>}
        {screen === 'esg'         && <Esg/>}
        {screen === 'issuer'      && <Issuer/>}
      </main>
      {cmdkOpen  && <NovaCmdK onClose={() => setCmdk(false)} onNav={setScreen}/>}
      {shareOpen && <NovaShare onClose={() => setShare(false)}/>}
    </div>
  );
}
