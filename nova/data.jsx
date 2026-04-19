// Seeded data for all screens
const rng = (seed) => { let s=seed; return () => { s = (s*9301 + 49297) % 233280; return s/233280; }; };

function series(n, base=0, vol=1, seed=1, drift=0) {
  const r = rng(seed);
  const out = [];
  let v = base;
  for (let i=0;i<n;i++) {
    v += (r()-0.5)*vol + drift;
    out.push(v);
  }
  return out;
}

function months(n=12, startM=1, startY=24) {
  const out = [];
  let m=startM, y=startY;
  for (let i=0;i<n;i++) { out.push(`${String(m).padStart(2,'0')}/${y}`); m++; if (m>12){m=1;y++;} }
  return out;
}

const DATA = {
  portfolios: [
    { name:'JPM US Aggregate',     ccy:'USD', mv:1257631011.32, pct:100.00, pnl: 3.10, bm: 3.13, excess: -0.03, ytd: 5.18, ytdbm: 3.55, ytdx: 2.13, spark: series(24, 100, 1.2, 4, 0.3)},
    { name:'Equity Global I',      ccy:'GBP',  mv:430951591.32, pct:100.00, pnl: 3.17, bm: 3.35, excess: -0.18, ytd: 8.85, ytdbm: 9.88, ytdx: -1.03, spark: series(24, 100, 2.1, 5, 0.4)},
    { name:'Hedge Funds B',        ccy:'USD',  mv:257631011.32, pct:100.00, pnl: 5.53, bm: 0.77, excess: 4.77, ytd:16.10, ytdbm: 2.30, ytdx:14.00, spark: series(24, 100, 0.8, 6, 0.6)},
    { name:'Fixed Income Corp. C', ccy:'EUR',  mv:275000000.00, pct:100.00, pnl: 1.42, bm: 1.42, excess: 0.00, ytd: 0.14, ytdbm: 0.25, ytdx: -0.11, spark: series(24, 100, 0.4, 7, 0.05)},
    { name:'Fixed Income Govt. B', ccy:'USD',  mv:228031702.11, pct:100.00, pnl: 1.74, bm: 1.76, excess: -0.02, ytd:-0.20, ytdbm: 0.21, ytdx: -0.41, spark: series(24, 100, 0.3, 8, 0)},
    { name:'Fixed Income Corp. A', ccy:'USD',  mv:215222349.55, pct:100.00, pnl: 1.73, bm: 1.74, excess: -0.63, ytd: 0.24, ytdbm: 0.21, ytdx: 0.03, spark: series(24, 100, 0.45, 9, 0.1)},
    { name:'Private Equity B',     ccy:'USD',  mv:163723940.81, pct:100.00, pnl: 0.13, bm: 0.17, excess: -0.04, ytd:-0.07, ytdbm: 2.30, ytdx: -2.37, spark: series(24, 100, 2.5, 10, 1.0)},
    { name:'Private Equity C',     ccy:'USD',  mv:156652851.24, pct:100.00, pnl: 0.60, bm: 0.30, excess: 0.10, ytd: 1.14, ytdbm: 1.30, ytdx: -0.16, spark: series(24, 100, 2.8, 11, 0.8)},
    { name:'EM Sovereign Debt',    ccy:'USD',  mv:142180003.10, pct:100.00, pnl: 2.14, bm: 1.98, excess: 0.16, ytd: 4.72, ytdbm: 4.30, ytdx: 0.42, spark: series(24, 100, 1.1, 12, 0.3)},
    { name:'Commodities Alpha',    ccy:'USD',  mv:98420113.44,  pct:100.00, pnl:-1.22, bm:-0.91, excess:-0.31, ytd:-3.48, ytdbm:-2.20, ytdx: -1.28, spark: series(24, 100, 3.0, 13, -0.4)},
  ],
  dimBreakdown: [
    { dim:'Total',            mv: 992518.89, ret1m: 3.10, ret3m: -5.68, ytd: 2.56, ret5y: 2.56 },
    { dim:'Equities',         mv: 404947.71, ret1m: 3.10, ret3m: -6.04, ytd: 2.30, ret5y: 2.30 },
    { dim:'Corporate Bonds',  mv: 248129.72, ret1m: 1.70, ret3m: -2.03, ytd: 1.80, ret5y: 1.80 },
    { dim:'Government Bonds', mv: 124060.80, ret1m: 3.10, ret3m: -7.68, ytd: -0.14, ret5y: -0.14 },
    { dim:'Private Equity',   mv: 87250.43,  ret1m: 0.40, ret3m: 1.20, ytd: 2.10, ret5y: 3.40 },
    { dim:'Hedge Funds',      dim2:'',       mv: 82100.11, ret1m: 1.80, ret3m: 2.60, ytd: 4.90, ret5y: 5.80 },
    { dim:'Real Estate',      mv: 45050.22,  ret1m: -0.90, ret3m: -1.80, ytd: 0.50, ret5y: 1.60 },
    { dim:'Other',            mv: 215378.60, ret1m: 1.03, ret3m: 2.34, ytd: 2.34, ret5y: 2.34 },
  ],
  allocationHistory: {
    labels: Array.from({length:24},(_,i)=>`'${String(2*i+1).padStart(2,'0')}`),
    series: [
      { name:'Equities',     data: series(24, 40, 1.6, 21, -0.05), color:'var(--c1)'},
      { name:'Corp Bonds',   data: series(24, 25, 0.8, 22, 0.1),   color:'var(--c3)'},
      { name:'Govt Bonds',   data: series(24, 18, 0.6, 23, 0),     color:'var(--c6)'},
      { name:'Private Eq',   data: series(24, 10, 0.8, 24, 0.05),  color:'var(--c5)'},
      { name:'Hedge Funds',  data: series(24, 8,  0.5, 25, 0.02),  color:'var(--c2)'},
    ]
  },
  riskSummary: [
    { view:'Aggregate', mv:1000000000, mvpct:100,  var95:46267109, var95p:4.63, var99:54217109, var99p:4.83, mvar:46267109, mvarp:4.42, cvar:56701898, cvarp:5.67 },
    { view:'Fund 1',    mv:300000000, mvpct:30.0, var95:5285535, var95p:1.76, var99:13285199, var99p:3.94, mvar:2635057, mvarp:0.88, cvar:6421080, cvarp:2.14 },
    { view:'Fund 2',    mv:550000000, mvpct:55.0, var95:28511057, var95p:4.35, var99:35441261, var99p:4.78, mvar:31045069, mvarp:4.91, cvar:38551095, cvarp:5.98 },
    { view:'Fund 3',    mv:50000000, mvpct:5.0,  var95:3119515, var95p:6.24, var99:2210856, var99p:4.90, mvar:2576556, mvarp:5.36, cvar:3771842, cvarp:7.54 },
    { view:'Fund 4',    mv:80000000, mvpct:8.0,  var95:2915040, var95p:3.64, var99:3280130, var99p:4.10, mvar:2550050, mvarp:3.19, cvar:3811120, cvarp:4.76 },
    { view:'Fund 5',    mv:20000000, mvpct:2.0,  var95:1085001, var95p:5.43, var99:1241220, var99p:6.21, mvar:980500, mvarp:4.90, cvar:1495201, cvarp:7.48 },
  ],
  mvByCurrency: {
    labels: ['USD','EUR','GBP','JPY','CAD','AUD','CHF','HKD','SGD'],
    data: [
      { name:'Bonds',          data: [62, 18, 12,  8,  5,  4,  3,  2, 1], color:'var(--c3)'},
      { name:'Equity',         data: [24, 22, 20, 14,  8,  6,  5,  3, 2], color:'var(--c1)'},
      { name:'Private Assets', data: [15, 14, 10,  8,  6,  4,  3,  2, 1], color:'var(--c5)'},
    ]
  },
  riskContribution: {
    labels: ['VaR MC 95','FX Risk','Equity Risk','Rate Risk','Issuer','Vega'],
    data: [
      { name:'Aggregate',      data:[100, 100, 100, 100, 100, 100], color:'var(--c1)'},
      { name:'Bonds',          data:[34, 12, 8, 62, 38, 15],        color:'var(--c3)'},
      { name:'Equity',         data:[42, 28, 70, 8, 22, 38],        color:'var(--c4)'},
      { name:'Private Assets', data:[24, 16, 18, 24, 40, 32],       color:'var(--c5)'},
    ]
  },
  topIssuers: {
    labels: Array.from({length:10},(_,i)=>`Issuer ${i+1}`),
    data: [
      { name:'Bonds',   data:[6.8, 5.6, 5.1, 4.4, 4.1, 3.7, 3.3, 2.9, 2.3, 1.9], color:'var(--c3)'},
      { name:'Equity',  data:[3.2, 2.8, 4.1, 3.4, 2.1, 2.6, 1.9, 1.4, 0.9, 0.6], color:'var(--c1)'},
    ]
  },
  varHistory: {
    labels: months(24, 1, 24),
    series: [
      { name:'VaR 95% Actual',    data: series(24, 3.5, 0.35, 31, 0.02), color:'var(--c1)' },
      { name:'VaR 95% Portfolio', data: series(24, 3.3, 0.32, 32, 0.02), color:'var(--c3)' },
      { name:'VaR 95% Benchmark', data: series(24, 3.0, 0.28, 33, 0.02), color:'var(--c2)', dots:true },
    ]
  },
  returnsByAccount: {
    labels: ['1M','3M','YTD','1Y','3Y','5Y'],
    data: [
      { name:'Equity Global I',  data:[1.42, -6.04, 2.30, 4.80, 8.20, 9.10], color:'var(--c1)' },
      { name:'MSCI World (Net)', data:[1.55, -5.22, 2.60, 5.30, 8.90, 9.80], color:'var(--c3)' },
    ],
    line: { name:'Excess', data:[-0.13, -0.82, -0.30, -0.50, -0.70, -0.70], color:'var(--c5)' }
  },
  esgAccounts: [
    { name:'Total',            mv:94164911, covered:73094058, nav:93144911, pos:789, iss:780, wa: 5.55, e: 6.75, s:3.21, g:0.30, gov:6.28 },
    { name:'Demo (Equities)',  mv:29079138, covered:20072035, nav:30074198, pos:160, iss: 50, wa: 0.00, e: 4.17, s:8.05, g:1.01, gov:0.00 },
    { name:'Demo (Corp Bonds)', mv:28891677, covered:22885715, nav:27891677, pos:135, iss: 122, wa: 6.05, e: 6.79, s:7.52, g:3.21, gov:8.65 },
    { name:'Demo (Govt Bonds)', mv:35572096, covered:31538315, nav:34572096, pos:299, iss: 299, wa: 5.10, e: 6.90, s:4.37, g:4.01, gov:9.13 },
  ],
  sectorBreakdown: [
    { sector:'Information Tech',  weight: 0.22, wk:7.10, env:9.25, soc:8.10, gov:7.19 },
    { sector:'Financials',        weight: 0.18, wk:6.95, env:7.52, soc:5.57, gov:5.87 },
    { sector:'Health Care',       weight: 0.14, wk:6.88, env:10.0, soc:7.50, gov:8.20 },
    { sector:'Industrials',       weight: 0.11, wk:5.57, env:5.74, soc:1.53, gov:5.87 },
    { sector:'Consumer Disc.',    weight: 0.09, wk:5.73, env:4.95, soc:6.22, gov:5.42 },
    { sector:'Energy',            weight: 0.08, wk:5.28, env:4.75, soc:4.80, gov:3.40 },
    { sector:'Materials',         weight: 0.06, wk:4.20, env:5.14, soc:4.67, gov:5.32 },
    { sector:'Utilities',         weight: 0.05, wk:3.80, env:3.32, soc:4.09, gov:5.74 },
    { sector:'Real Estate',       weight: 0.04, wk:3.10, env:3.20, soc:3.50, gov:4.10 },
    { sector:'Consumer Staples',  weight: 0.03, wk:4.10, env:4.30, soc:5.60, gov:6.20 },
  ],
  esgTrend: {
    labels: ['Q1','Q2','Q3','Q4'],
    bars: [
      { name:'E', data:[6.2, 7.8, 7.5, 7.9], color:'var(--c2)' },
      { name:'S', data:[5.8, 6.1, 6.4, 6.7], color:'var(--c3)' },
      { name:'G', data:[6.5, 6.8, 6.9, 7.1], color:'var(--c5)' },
    ],
    line: { name:'ESG', data:[6.2, 6.9, 6.9, 7.2], color:'var(--c1)' }
  },
  issuer: {
    name:'Meridian Industries',
    ticker:'MRDI',
    sector:'Industrials / Aerospace',
    country:'US',
    market:'NYSE',
    mcap:'Mega',
    esg: 'AA',
    score: 90,
    e: 95, s: 75, g: 100,
    desc: 'Diversified industrial manufacturer with aerospace, defense, and climate technology business lines. Headquartered in Chicago.',
    peers: [
      { name:'Apex Systems',     score:99, e:97, s:100, g:99 },
      { name:'Calder Industries', score:97, e:99, s:100, g:97 },
      { name:'Meridian',         score:90, e:95, s:75,  g:100, self:true },
      { name:'Orion Holdings',    score:85, e:85, s:85,  g:85 },
      { name:'Sable & Co.',       score:82, e:80, s:80,  g:90 },
    ],
    ratingHistory: {
      labels: ['Q1 23','Q2 23','Q3 23','Q4 23','Q1 24'],
      data: [ {rating:'BB', score:65}, {rating:'BB', score:68}, {rating:'BBB', score:75}, {rating:'A', score:82}, {rating:'AA', score:90} ]
    },
    exposure: series(24, 42, 4, 41, 0.2),
    revenue: series(12, 2800, 120, 42, 80),
  },
  varTrend: {
    labels: months(12, 4, 25),
    series:[
      { name:'Real Estate C (Fund)',     data: [-2.5, 1.5, -0.2, -1.7, 0.8, 5.2, -2.8, 7.3, -1.5, -2.1, 1.6, 0.7], color:'var(--c1)' },
      { name:'Fund Index (Benchmark)',   data: [-3.5, 1.1, 0.1, -2.3, 1.4, 4.8, -3.5, 5.9, -1.8, -2.5, 1.3, 1.1], color:'var(--c3)' },
    ],
    line: { name:'Excess', data: [2.2, -1.8, 2.4, -2.5, 1.0, 2.2, 1.0, 2.1, 0.7, 0.8, -1.3, -1.8], color:'var(--c5)', dots:true }
  },
  tradesByRegion: [
    { code:'NA',  name:'N. America', value:4210, x:0.18, y:0.36 },
    { code:'EU',  name:'Europe',     value:2890, x:0.46, y:0.28 },
    { code:'UK',  name:'UK',         value:1110, x:0.40, y:0.22 },
    { code:'JP',  name:'Japan',      value:1420, x:0.88, y:0.32 },
    { code:'CN',  name:'China',      value:1780, x:0.78, y:0.34 },
    { code:'AU',  name:'Australia',  value:510, x:0.85, y:0.70 },
    { code:'BR',  name:'LatAm',      value:420, x:0.25, y:0.72 },
  ],
  pnlByStrat: {
    stages:[
      { label:'Pitched',   value: 100 },
      { label:'Qualified', value: 72,  color:'var(--c2)' },
      { label:'Traded',    value: 48,  color:'var(--c3)' },
      { label:'Settled',   value: 41,  color:'var(--c5)' },
      { label:'P&L+',      value: 29,  color:'var(--c1)' },
    ]
  },
  flow: {
    left: [
      { label:'Equities',        value:400, color:'var(--c1)' },
      { label:'Bonds',           value:250, color:'var(--c3)' },
      { label:'Private Assets',  value:180, color:'var(--c5)' },
      { label:'Cash',            value:80,  color:'var(--c6)' },
    ],
    right: [
      { label:'US',    value:350, color:'var(--c1)' },
      { label:'EU',    value:240, color:'var(--c3)' },
      { label:'APAC',  value:180, color:'var(--c5)' },
      { label:'EM',    value:90,  color:'var(--c6)' },
      { label:'Other', value:50,  color:'var(--c2)' },
    ],
    links: [
      {from:0,to:0, value:180}, {from:0,to:1, value:120}, {from:0,to:2, value:80}, {from:0,to:3, value:20},
      {from:1,to:0, value:100}, {from:1,to:1, value:80}, {from:1,to:2, value:40}, {from:1,to:4, value:30},
      {from:2,to:0, value:60},  {from:2,to:1, value:40}, {from:2,to:2, value:60}, {from:2,to:3, value:20},
      {from:3,to:0, value:10},  {from:3,to:3, value:50}, {from:3,to:4, value:20},
    ]
  },
};

Object.assign(window, { DATA });
