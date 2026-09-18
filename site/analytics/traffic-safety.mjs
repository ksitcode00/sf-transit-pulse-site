// 中文：Feature 7 只显示伤亡事故历史；不使用警方事件评分，不参与实时路线排名。
// English: Feature 7 displays injury-crash history, never police incident scores or live route ranking.
export const TRAFFIC_COPY = {
  en: {
    feature: 'Feature 7 · Traffic safety history', title: 'Understand the crash history along a route.',
    lead: 'Explore reported injury and fatal crashes near current Muni routes. These records describe the surrounding streets, not crashes necessarily involving Muni.',
    route: 'Choose a route', direction: 'Choose a direction', year: 'Choose a year', radius: 'Distance from route',
    all: 'All route corridors combined', both: 'Both directions', years: 'All available years', within: 'Within',
    loading: 'Loading traffic crash history…', failed: 'Traffic crash data could not be loaded. Reload the page to try again.',
    coverage: 'Accident dates', checked: 'Last data check', loaded: 'Official data loaded', updated: 'Checks weekly. New records appear only when the official source publishes them.',
    count: 'Distinct injury crashes', fatal: 'Fatal crashes', severe: 'Severe-injury crashes', people: 'Reported people killed / injured',
    disclaimer: 'Spatial context only. Longer and busier routes can have more nearby crashes. Counts are not risk rates, evidence of Muni involvement, or a personal safety prediction. Current route shapes may differ from past routes.',
    partial: 'The latest year is incomplete. Do not compare its count directly with complete years.',
    map: 'Crash locations and route lines', legend: 'Fatal · Severe injury · Other injury · Unknown severity',
    otherInjury: 'Other injury',
    trend: 'Crash counts by year', trendNote: 'Based on the selected route, direction and distance. The final year may be partial.',
    groups: 'Who was involved?', groupNote: 'Categories come from the official crash-group description. Pedestrian and cyclist involvement may overlap.',
    pedestrian: 'Crashes involving pedestrians', cyclist: 'Crashes involving cyclists', vehicle: 'Vehicle(s) only', unknown: 'Unknown / not stated',
    hotspots: 'Street locations with more reports', hotNote: 'Grouped by reported street pair, not a severity or risk ranking.',
    details: 'Crash details', date: 'Date', street: 'Street / intersection', severity: 'Highest injury severity', noData: 'No mapped crashes match these filters. This does not mean there is no risk.',
    shown: 'Table shows the 50 most recent matching crashes. KPIs and map use all matching crashes.',
    download: 'Download the traffic crash data', source: 'Read the official source', methodology: 'How this is calculated',
    method: 'One crash ID is counted once, even if it matches both directions or several routes. All routes combines their nearby corridors, not the whole city. Distance is measured to all current GTFS line segments using approximate local metres. Filters use 100 or 200 metres. Property-damage-only crashes are outside this dataset. Source dates and reporting delays are shown above.',
    FATAL: 'Fatal', SEVERE: 'Severe injury', VISIBLE: 'Other visible injury', PAIN: 'Complaint of pain', UNKNOWN: 'Unknown',
    mapUnavailable: 'The map could not load. Crash counts and the table are still available below.',
  },
  zh: {
    feature: '功能 7 · 交通事故历史', title: '了解公交沿线过去的伤亡事故。',
    lead: '查看当前 Muni 线路附近已报告的伤亡事故。这些记录描述周边街道的事故，不一定涉及 Muni 车辆。',
    route: '选择线路', direction: '选择方向', year: '选择年份', radius: '距线路的范围',
    all: '所有线路沿线合并', both: '两个方向合并', years: '所有可用年份', within: '以内',
    loading: '正在读取交通事故历史…', failed: '暂时无法读取交通事故数据，请重新加载页面再试。',
    coverage: '事故日期范围', checked: '最近检查数据', loaded: '官方数据载入时间', updated: '每周自动检查；只有官方发布新记录后，事故数据才会增加。',
    count: '去重后的伤亡事故', fatal: '死亡事故', severe: '重伤事故', people: '报告死亡人数／受伤人数',
    disclaimer: '只作空间背景。较长、较繁忙的线路可能有更多附近事故。数量不是风险率，不代表 Muni 涉事，也不能预测个人安全。当前线路走向可能与过去不同。',
    partial: '最新年份尚未完整，不能直接用事故数量与完整年份比较。',
    map: '事故位置与线路走向', legend: '死亡 · 重伤 · 其他受伤 · 严重程度未知',
    otherInjury: '其他受伤',
    trend: '按年份查看事故数', trendNote: '使用当前线路、方向和距离筛选。最后一年可能不完整。',
    groups: '涉及哪些交通参与者？', groupNote: '根据官方事故分类。行人和骑车者可能同时涉及同一事故，数量不应相加。',
    pedestrian: '涉及行人的事故', cyclist: '涉及骑车者的事故', vehicle: '仅涉及机动车的事故', unknown: '未知／未注明',
    hotspots: '报告较集中的街道位置', hotNote: '按记录中的两条街道分组，不是严重程度或风险排名。',
    details: '事故明细', date: '日期', street: '街道／交叉路口', severity: '最高伤害严重程度', noData: '筛选范围内没有匹配的事故记录。这不代表没有风险。',
    shown: '明细表显示最近 50 条匹配事故；统计卡片和地图使用全部匹配事故。',
    download: '下载交通事故数据', source: '查看官方数据来源', methodology: '这些结果如何计算？',
    method: '每个事故编号只数一次，即使它匹配两个方向或多条线路。所有线路合并指线路附近的范围，不代表全市。用近似局部米制距离，计算事故点到当前 GTFS 全部线路线段的最近距离，可选 100 或 200 米。仅财产损失事故不在数据范围内。上方显示来源日期与发布延迟。',
    FATAL: '死亡', SEVERE: '重伤', VISIBLE: '其他可见伤害', PAIN: '疼痛申诉', UNKNOWN: '未知',
    mapUnavailable: '地图暂时无法加载。下方仍可查看事故统计和明细。',
  },
};

export function selectCrashes(data, route = 'all', direction = 'all', year = 'all', radius = 100) {
  const indices = new Set();
  for (const [r, d, index, distance] of data.matches) {
    if ((route === 'all' || r === route) && (direction === 'all' || d === direction) && distance <= radius) indices.add(index);
  }
  return [...indices].map(i => data.crashes[i]).filter(row => row && (year === 'all' || row.date.startsWith(year)));
}

export function crashStats(rows) {
  return {count: rows.length, fatal: rows.filter(r => r.severity === 'FATAL').length,
    severe: rows.filter(r => r.severity === 'SEVERE').length,
    killed: rows.reduce((n, r) => n + r.killed, 0), injured: rows.reduce((n, r) => n + r.injured, 0)};
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function bootstrap() {
  const byId = id => document.getElementById(id);
  let data = null, map = null, layer = null, loadFailed = false;
  const lang = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
  const copy = key => TRAFFIC_COPY[lang()][key];
  const date = value => value ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleString(lang() === 'zh' ? 'zh-CN' : 'en-US', value.length === 10 ? {year:'numeric',month:'short',day:'numeric'} : {}) : '—';
  const number = value => new Intl.NumberFormat(lang() === 'zh' ? 'zh-CN' : 'en-US').format(value);
  function bars(rows) {
    const max = Math.max(1, ...rows.map(r => r[1]));
    return `<div class="traffic-bars">${rows.map(([label, n]) => `<div class="traffic-bar-row"><span>${esc(label)}</span><div><i style="width:${n/max*100}%"></i></div><strong>${number(n)}</strong></div>`).join('')}</div>`;
  }
  function render() {
    document.querySelectorAll('[data-traffic-copy]').forEach(el => el.textContent = copy(el.dataset.trafficCopy));
    byId('traffic-map').setAttribute('aria-label', copy('map'));
    byId('traffic-source-link').href = data?.source_url || 'https://data.sf.gov/d/ubvf-ztfx';
    if (!data) { byId('traffic-status').textContent = copy(loadFailed ? 'failed' : 'loading'); return; }
    const routeNode = byId('traffic-route'), yearNode = byId('traffic-year'), directionNode = byId('traffic-direction');
    const route = routeNode.value || 'all', year = yearNode.value || 'all', direction = directionNode.value || 'all';
    const routeNames = [...new Map(data.route_directions.map(row => [row.route_id, row])).values()].sort((a,b) => a.label.localeCompare(b.label, undefined, {numeric:true}));
    routeNode.innerHTML = `<option value="all">${copy('all')}</option>${routeNames.map(row => `<option value="${esc(row.route_id)}">${esc(row.label)} — ${esc(row.long_name)}</option>`).join('')}`;
    routeNode.value = route;
    directionNode.innerHTML = `<option value="all">${copy('both')}</option><option value="0">${lang()==='zh'?'方向':'Direction'} 0</option><option value="1">${lang()==='zh'?'方向':'Direction'} 1</option>`;
    directionNode.value = direction;
    const years = [...new Set(data.crashes.map(row => row.date.slice(0,4)))].sort();
    yearNode.innerHTML = `<option value="all">${copy('years')}</option>${years.map(y => `<option>${y}</option>`).join('')}`; yearNode.value = year;
    byId('traffic-radius').innerHTML = [100,200].map(r=>`<option value="${r}">${lang()==='zh'?`${r} 米以内`:`Within ${r} m`}</option>`).join('');
    byId('traffic-radius').value = String(radiusValue);
    byId('traffic-status').innerHTML = `<strong>${copy('coverage')}: ${esc(date(data.coverage_start))} – ${esc(date(data.coverage_end))}</strong><p>${copy('checked')}: ${esc(date(data.generated_at))}<br>${copy('loaded')}: ${esc(date(data.source_loaded_at?.slice(0,10)))}</p><p>${copy('updated')}</p>${data.coverage_end.slice(5) !== '12-31' ? `<p>${copy('partial')}</p>` : ''}${Date.now()-Date.parse(data.generated_at)>10*86400000?`<p>${lang()==='zh'?'最近检查已超过 10 天，当前显示缓存历史数据。':'The last check was over 10 days ago. Showing cached history.'}</p>`:''}`;
    const rows = selectCrashes(data, route, direction, year, radiusValue), stats = crashStats(rows);
    byId('traffic-kpis').innerHTML = [['count',stats.count],['fatal',stats.fatal],['severe',stats.severe],['people',`${number(stats.killed)} / ${number(stats.injured)}`]].map(([key,n]) => `<article class="metric-card"><strong>${typeof n==='number'?number(n):n}</strong><span>${copy(key)}</span></article>`).join('');
    byId('traffic-trend').innerHTML = bars(years.filter(y=>year==='all'||y===year).map(y => [y,rows.filter(row=>row.date.startsWith(y)).length]));
    byId('traffic-groups').innerHTML = bars([['pedestrian',rows.filter(r=>r.pedestrian).length],['cyclist',rows.filter(r=>r.cyclist).length],['vehicle',rows.filter(r=>r.group==='Vehicle(s) Only Involved').length],['unknown',rows.filter(r=>r.group==='Unknown/Not Stated').length]].map(([key,n])=>[copy(key),n]));
    const pairs = new Map(); for (const row of rows) {const pair = [row.street,row.cross_street].filter(Boolean).sort().join(' / ') || copy('unknown');pairs.set(pair,(pairs.get(pair)||0)+1);}
    byId('traffic-hotspots').innerHTML = bars([...pairs].sort((a,b)=>b[1]-a[1]).slice(0,8));
    const recent = [...rows].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,50);
    byId('traffic-table').innerHTML = rows.length ? `<table><thead><tr><th>${copy('date')}</th><th>${copy('street')}</th><th>${copy('severity')}</th></tr></thead><tbody>${recent.map(row=>`<tr><td>${esc(row.date)}</td><td>${esc([row.street,row.cross_street].filter(Boolean).join(' / '))}</td><td>${copy(row.severity)}</td></tr>`).join('')}</tbody></table>` : `<p>${copy('noData')}</p>`;
    renderMap(rows, route, direction);
  }
  function renderMap(rows, route, direction) {
    if (!globalThis.L) {byId('traffic-map').textContent = copy('mapUnavailable'); return;}
    if (!map) {
      map = L.map('traffic-map', {preferCanvas:true,scrollWheelZoom:false}).setView([37.765,-122.435],12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);
      layer = L.layerGroup().addTo(map);
    }
    layer.clearLayers();
    const shapes = data.route_directions.filter(r => (route==='all'||r.route_id===route)&&(direction==='all'||r.direction_id===direction)).flatMap(r=>r.shapes);
    if (route !== 'all') for (const shape of shapes) L.polyline(shape,{color:'#0066cc',weight:3,opacity:0.7}).addTo(layer);
    const colors = {FATAL:'#9e1424',SEVERE:'#b65b00',VISIBLE:'#0066cc',PAIN:'#0066cc',UNKNOWN:'#636366'};
    for (const row of rows) L.circleMarker([row.lat,row.lon],{radius:row.severity==='FATAL'?6:4,color:colors[row.severity],fillOpacity:0.65,weight:1}).bindPopup(`<strong>${esc(row.date)} · ${copy(row.severity)}</strong><br>${esc([row.street,row.cross_street].join(' / '))}`).addTo(layer);
    if (route !== 'all' && shapes.length) map.fitBounds(L.latLngBounds(shapes.flat()),{padding:[15,15],maxZoom:15});
    else map.setView([37.765,-122.435],12);
    requestAnimationFrame(()=>map.invalidateSize());
  }
  let radiusValue = 100;
  for (const id of ['traffic-route','traffic-year','traffic-direction']) byId(id).addEventListener('change',render);
  byId('traffic-radius').addEventListener('change',()=>{radiusValue=Number(byId('traffic-radius').value);render();});
  byId('language-toggle').addEventListener('click',render);
  async function load() {
    try { const response=await fetch('../data/traffic-safety.json',{cache:'no-store'});if(!response.ok)throw Error();const payload=await response.json();if(payload.status!=='available'||!Array.isArray(payload.matches)||!Array.isArray(payload.crashes))throw Error();data=payload;loadFailed=false; }
    catch {loadFailed=true;}
    render();
  }
  // 中文：只有滚动到 Feature 7 才下载较大的历史文件，保护手机首页加载速度。
  // English: Load the history only as Feature 7 comes into view to protect mobile startup.
  render();
  if (location.hash === '#traffic-safety') load();
  else if (globalThis.IntersectionObserver) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect();load(); }
    }, {rootMargin:'300px'});
    observer.observe(byId('traffic-safety'));
  } else load();
  setInterval(()=>{if(data||loadFailed)load();},30*60*1000);
}
if (typeof document !== 'undefined') bootstrap();
