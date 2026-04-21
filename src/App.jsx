import React, { useState, useEffect } from 'react';
import { NovaLeftNav, NovaFilterBar } from './components/shell.jsx';
import { NovaCmdK, NovaShare } from './components/modals.jsx';
import { useViewport } from './hooks/use-viewport.js';
import { LiveProvider } from './live.jsx';
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
  const { isMobile } = useViewport();

  useEffect(() => {
    localStorage.setItem('nova.screen', screen);
    // Move focus to the main content region on screen change so keyboard/SR
    // users don't remain stuck on the nav button that triggered the switch.
    // Skip on first mount (initial value), only fire on user-initiated change.
    const el = document.getElementById('main');
    if (el && document.activeElement !== document.body) {
      el.focus({ preventScroll: true });
    }
  }, [screen]);
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
    <LiveProvider>
    <div style={{minHeight:'100vh', display:'flex', background:'var(--bg)', alignItems:'flex-start'}}>
      <a className="skip-link" href="#main">Skip to content</a>
      <NovaLeftNav
        screen={screen}
        setScreen={setScreen}
        theme={theme}
        setTheme={setTheme}
        onCmdK={() => setCmdk(true)}
        onShare={() => setShare(true)}
      />
      <main id="main" tabIndex={-1} style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', outline:'none', paddingBottom: isMobile ? 'calc(56px + env(safe-area-inset-bottom, 0))' : 0}}>
        <NovaFilterBar
          title={TITLES[screen]}
          subtitle={SUBTITLES[screen]}
          filters={FILTERS[screen]}
          theme={theme}
          setTheme={setTheme}
          onCmdK={() => setCmdk(true)}
        />
        <div key={screen} className="screen-fade" style={{flex:1, minWidth:0, display:'flex', flexDirection:'column', minHeight:0}}>
          {screen === 'home'        && <Home openDash={setScreen}/>}
          {screen === 'performance' && <Performance/>}
          {screen === 'risk'        && <Risk/>}
          {screen === 'esg'         && <Esg/>}
          {screen === 'issuer'      && <Issuer/>}
        </div>
      </main>
      {cmdkOpen  && <NovaCmdK onClose={() => setCmdk(false)} onNav={setScreen}/>}
      {shareOpen && <NovaShare onClose={() => setShare(false)}/>}
    </div>
    </LiveProvider>
  );
}
