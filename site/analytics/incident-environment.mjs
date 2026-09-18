export function selectIncidents(data, {route='all',stop='all',month='all',category='all',period='all',radius=200} = {}) {
  const locations=new Set();
  for(const [stopIndex,location,distance] of data.matches) {
    const s=data.stops[stopIndex];
    if(distance<=radius && (route==='all'||s.routes.includes(route)) && (stop==='all'||s.stop_id===stop)) locations.add(location);
  }
  const categoryIndex=data.categories.indexOf(category);
  return data.incidents.filter(row=>locations.has(row[2]) && (month==='all'||row[1].startsWith(month))
    && (category==='all'||row[3].includes(categoryIndex))
    && (period==='all'||(6<=Number(row[1].slice(11,13))&&Number(row[1].slice(11,13))<18?'day':'night')===period));
}
export function summarizeIncidents(data, rows) {
  const categories=data.categories.map(()=>0);
  let day=0;
  for(const row of rows) {if(6<=Number(row[1].slice(11,13))&&Number(row[1].slice(11,13))<18)day++;for(const i of row[3])categories[i]++;}
  return {count:rows.length,day,night:rows.length-day,categories};
}
export function normalizeFilters(data, filters) {
  const next={...filters};
  if(next.route!=='all'&&!data.stops.some(stop=>stop.routes.includes(next.route)))next.route='all';
  if(next.stop!=='all'&&!data.stops.some(stop=>stop.stop_id===next.stop&&(next.route==='all'||stop.routes.includes(next.route))))next.stop='all';
  if(next.month!=='all'&&!data.incidents.some(row=>row[1].startsWith(next.month)))next.month='all';
  if(next.category!=='all'&&!data.categories.includes(next.category))next.category='all';
  return next;
}
export function groupMapLocations(locations, counts, zoom) {
  const groups=new Map(),size=256*2**zoom;
  for(const [index,count]of counts){
    const [lat,lon]=locations[index],sin=Math.sin(lat*Math.PI/180);
    const x=(lon+180)/360*size,y=(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*size;
    const key=zoom>=16?String(index):`${Math.floor(x/32)}:${Math.floor(y/32)}`;
    const g=groups.get(key)||{lat:0,lon:0,count:0,locations:0};
    g.lat+=lat*count;g.lon+=lon*count;g.count+=count;g.locations++;groups.set(key,g);
  }
  return [...groups.values()].map(g=>({...g,lat:g.lat/g.count,lon:g.lon/g.count}));
}

// 中文：类别保持官方含义；“非刑事事件”和“遗失物品”也可能出现，不把所有报告叫犯罪。
// English: Preserve source meanings. Non-criminal and lost-property reports are not all crimes.
const CATEGORY_ZH={
  'Arson':'纵火','Assault':'袭击相关','Burglary':'入室盗窃','Case Closure':'案件结案',
  'Civil Sidewalks':'人行道管理','Courtesy Report':'协助记录','Disorderly Conduct':'扰乱秩序',
  'Drug Offense':'毒品相关违法','Drug Violation':'毒品相关违规','Embezzlement':'侵占财物',
  'Fire Report':'火情报告','Forgery And Counterfeiting':'伪造与假冒','Fraud':'欺诈','Gambling':'赌博',
  'Homicide':'杀人案件','Human Trafficking (A), Commercial Sex Acts':'人口贩运（商业性剥削）',
  'Human Trafficking (B), Involuntary Servitude':'人口贩运（强迫劳动）',
  'Human Trafficking, Commercial Sex Acts':'人口贩运（商业性剥削）',
  'Larceny Theft':'财物被盗','Liquor Laws':'酒类管理违规','Lost Property':'遗失物品',
  'Malicious Mischief':'恶意损坏财物','Miscellaneous Investigation':'其他调查','Missing Person':'失踪人员相关',
  'Motor Vehicle Theft':'机动车被盗','Motor Vehicle Theft?':'机动车被盗（官方类别带问号）',
  'Non-Criminal':'非刑事事件','Offences Against The Family And Children':'家庭与儿童相关违法',
  'Other':'其他','Other Miscellaneous':'其他杂项','Other Offenses':'其他违法',
  'Prostitution':'卖淫相关','Rape':'强奸案件','Recovered Vehicle':'车辆寻回','Robbery':'抢劫',
  'Sex Offense':'性相关违法','Stolen Property':'赃物相关','Suicide':'自杀相关',
  'Suspicious':'可疑情况','Suspicious Occ':'可疑情况记录','Traffic Collision':'交通碰撞报告',
  'Traffic Violation Arrest':'交通违法拘捕','Unknown / not stated':'未知／未注明','Vandalism':'破坏财物',
  'Vehicle Impounded':'车辆被扣押','Vehicle Misplaced':'车辆位置不明','Warrant':'令状相关',
  'Weapons Carrying Etc':'携带武器等','Weapons Offence':'武器相关违法','Weapons Offense':'武器相关违法',
};
const COPY={
 en:{feature:'Feature 8 · Historical incident environment',title:'Explore the reported history around a stop.',
  lead:'Look at police incident reports near current Muni stops. Reports include non-criminal events and may contain several categories; they are not findings of guilt or predictions of personal risk.',
  route:'Near stops on route',stop:'Choose a stop',month:'Choose a month',category:'Choose a category',period:'Time of day',radius:'Approximate distance from stop',
  allRoutes:'All Muni stop areas combined',allStops:'All stops in this selection',allMonths:'All available months',allCategories:'All categories',both:'Day and night',day:'Day · 06:00–17:59',night:'Night · 18:00–05:59',
  loading:'Loading incident history…',failed:'Incident history could not load. Reload the page to try again.',
  retained:'The latest check failed. Showing the previously loaded history.',
  count:'Distinct incident reports',locations:'Mapped report locations',dayCount:'Daytime reports',nightCount:'Nighttime reports',
  coverage:'Incident dates',checked:'Last data check',updated:'Checks daily. Records depend on official publication and may be revised.',partial:'The first and last months may be incomplete. Do not compare their counts directly with complete months.',
  boundary:'Locations are anonymous nearby intersections, not exact incident addresses. Distance is approximate straight-line distance, not walking distance. More reports do not establish a higher personal risk.',
  map:'Approximate report locations',mapNote:'Nearby locations are grouped when zoomed out. Circle size shows report count; zoom in to separate locations. Blue dots show selected stops.',mapFailed:'The map could not load. Counts and charts remain available.',grouped:'mapped locations in this group',
  types:'Which categories were reported?',typesNote:'The ten most common categories in this selection. One report can have several categories, so counts can overlap and should not be added.',
  trend:'Reported incidents by month',trendNote:'Months marked * are incomplete within this data window. Reporting delays and revisions can change the totals.',
  stopCounts:'Nearby reports by stop',stopNote:'The ten stops with more matching reports in this selection. Nearby stops overlap; do not add these counts or treat them as a safety ranking.',
  methodTitle:'How this is calculated',method:'One incident ID is counted once. Category rows are combined without discarding their labels. A route uses the union of buffers around its current GTFS stops, not its entire line. Reported intersection coordinates are matched to stops within 100–400 metres using approximate local metres. Day/night uses the San Francisco local clock, not daylight or UTC. Coverage and population, reporting practices, and foot traffic differ, so raw counts are not risk rates. Police traffic-collision reports can overlap conceptually with Feature 7; do not add the two datasets.',
  download:'Download the incident data',source:'Read the official source',noData:'No mapped reports match these filters. This does not mean nothing occurred or there is no risk.',reports:'distinct reports',
  stale:'The last successful check is over 3 days old. Showing cached history.',
 },
 zh:{feature:'功能 8 · 历史事件环境',title:'了解站点周边过去报告过什么。',
  lead:'查看当前 Muni 站点附近的警方事件报告。其中也包含非刑事事件，一份报告可有多个类别；报告不等于定罪，也不能预测个人风险。',
  route:'查看哪条线路的站点',stop:'选择站点',month:'选择月份',category:'选择事件类别',period:'发生时段',radius:'距站点的近似范围',
  allRoutes:'所有 Muni 站点周边合并',allStops:'当前范围内全部站点',allMonths:'所有可用月份',allCategories:'全部类别',both:'白天与夜间',day:'白天 · 06:00–17:59',night:'夜间 · 18:00–05:59',
  loading:'正在读取历史事件…',failed:'暂时无法读取历史事件，请重新加载页面再试。',retained:'最新读取失败，暂时显示此前已载入的历史数据。',
  count:'去重后的事件报告',locations:'有记录的地图位置',dayCount:'白天事件报告',nightCount:'夜间事件报告',
  coverage:'事件日期范围',checked:'最近检查数据',updated:'每天自动检查；记录取决于官方发布，也可能被修订。',partial:'首尾月份可能不完整，不能直接与完整月份比较数量。',
  boundary:'位置是匿名化后的附近路口，不是事件的精确地址。距离为近似直线距离，不是步行距离。报告较多不能证明个人风险较高。',
  map:'事件报告的近似位置',mapNote:'缩小时合并附近位置；圆点大小表示报告数。放大地图可展开路口位置，蓝点表示所选站点。',mapFailed:'地图暂时无法加载，下方统计和图表仍可查看。',grouped:'个地图位置合并显示',
  types:'过去报告过哪些类别？',typesNote:'显示当前筛选中最多的十类。一份报告可有多个类别，数量有重叠，不能相加。',
  trend:'按月份查看事件报告',trendNote:'带 * 的月份在这份数据中不完整。发布延迟和修订可能改变数量。',
  stopCounts:'各站点附近的报告数',stopNote:'显示当前筛选中记录较多的十个站点。附近站点的范围会重叠，不能相加，也不是安全排名。',
  methodTitle:'这些结果如何计算？',method:'同一事件编号只数一次，合并其全部类别。一条线路使用当前 GTFS 站点周边范围的并集，不是整条路线线段。将匿名路口坐标与站点匹配，按局部近似米制距离筛选 100–400 米。白天／夜间使用旧金山当地时钟，不是日照时段或 UTC。人口、报案方式与人流不同，原始数量不是风险率。警方交通碰撞报告与功能 7 的概念可能重叠，两份数据不能相加。',
  download:'下载历史事件数据',source:'查看官方数据来源',noData:'筛选范围内没有匹配的报告。这不代表没有发生事件或没有风险。',reports:'份去重报告',
  stale:'最近成功检查已超过 3 天，当前显示缓存历史数据。',
 }
};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function bootstrap(){
 const byId=id=>document.getElementById(id), controls=['route','stop','month','category','period','radius'];
 let data=null,map=null,layer=null,failed=false,busy=false,mapCounts=new Map(),mapStops=[];
 const filters={route:'all',stop:'all',month:'all',category:'all',period:'all',radius:200};
 const lang=()=>document.documentElement.lang.startsWith('zh')?'zh':'en';
 const t=key=>COPY[lang()][key],label=category=>lang()==='zh'?(CATEGORY_ZH[category]||category):category;
 const num=n=>new Intl.NumberFormat(lang()==='zh'?'zh-CN':'en-US').format(n);
 function bars(rows){const max=Math.max(1,...rows.map(r=>r[1]));return rows.length?`<div class="traffic-bars">${rows.map(([name,n])=>`<div class="traffic-bar-row"><span>${esc(name)}</span><div><i style="width:${n/max*100}%"></i></div><strong>${num(n)}</strong></div>`).join('')}</div>`:`<p>${t('noData')}</p>`;}
 function options(id,rows){byId(`incident-${id}`).innerHTML=rows.map(([value,name])=>`<option value="${esc(value)}">${esc(name)}</option>`).join('');byId(`incident-${id}`).value=String(filters[id]);}
 function partial(month){const end=new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),0)).getUTCDate();return data.coverage_start>`${month}-01`||data.coverage_end<`${month}-${end}`;}
 function render(){
  document.querySelectorAll('[data-incident-copy]').forEach(el=>el.textContent=t(el.dataset.incidentCopy));
  controls.forEach(id=>byId(`incident-${id}`).disabled=!data);
  byId('incident-map').setAttribute('aria-label',t('map'));
  if(!data){byId('incident-status').textContent=t(failed?'failed':'loading');return;}
  Object.assign(filters,normalizeFilters(data,filters));
  const months=[...new Set(data.incidents.map(row=>row[1].slice(0,7)))].sort();
  options('route',[['all',t('allRoutes')],...data.routes.map(row=>[String(row.route_id),`${row.route_short_name||row.route_id} — ${row.route_long_name||''}`]).sort((a,b)=>a[1].localeCompare(b[1],undefined,{numeric:true}))]);
  const stops=data.stops.filter(stop=>filters.route==='all'||stop.routes.includes(filters.route));
  if(!stops.some(stop=>stop.stop_id===filters.stop))filters.stop='all';
  options('stop',[['all',t('allStops')],...stops.map(stop=>[stop.stop_id,`${stop.name} · ${stop.stop_id}`]).sort((a,b)=>a[1].localeCompare(b[1]))]);
  options('month',[['all',t('allMonths')],...months.map(month=>[month,`${month}${partial(month)?' *':''}`])]);
  options('category',[['all',t('allCategories')],...data.categories.map(category=>[category,label(category)])]);
  options('period',[['all',t('both')],['day',t('day')],['night',t('night')]]);
  options('radius',[100,200,300,400].map(n=>[n,lang()==='zh'?`${n} 米以内`:`Within ${n} m`]));
  byId('incident-status').innerHTML=`<strong>${t('coverage')}: ${esc(data.coverage_start)} – ${esc(data.coverage_end)}</strong><p>${t('checked')}: ${esc(new Date(data.generated_at).toLocaleString(lang()==='zh'?'zh-CN':'en-US'))}</p><p>${t('updated')}</p><p>${t('partial')}</p>${failed?`<p>${t('retained')}</p>`:''}${Date.now()-Date.parse(data.generated_at)>3*86400000?`<p>${t('stale')}</p>`:''}`;
  const rows=selectIncidents(data,filters),stats=summarizeIncidents(data,rows),counts=new Map();
  for(const row of rows)counts.set(row[2],(counts.get(row[2])||0)+1);
  byId('incident-kpis').innerHTML=[['count',stats.count],['locations',counts.size],['dayCount',stats.day],['nightCount',stats.night]].map(([key,n])=>`<article class="metric-card"><strong>${num(n)}</strong><span>${t(key)}</span></article>`).join('');
  byId('incident-types').innerHTML=bars(data.categories.map((category,i)=>[label(category),stats.categories[i]]).filter(row=>row[1]>0).sort((a,b)=>b[1]-a[1]).slice(0,10));
  byId('incident-trend').innerHTML=bars(months.filter(month=>filters.month==='all'||filters.month===month).map(month=>[`${month}${partial(month)?' *':''}`,rows.filter(row=>row[1].startsWith(month)).length]));
  const stopCounts=new Map();
  for(const [s,location,distance]of data.matches){const stop=data.stops[s];if(distance<=filters.radius&&counts.has(location)&&(filters.route==='all'||stop.routes.includes(filters.route))&&(filters.stop==='all'||stop.stop_id===filters.stop))stopCounts.set(s,(stopCounts.get(s)||0)+counts.get(location));}
  byId('incident-stops').innerHTML=bars([...stopCounts].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([i,n])=>[`${data.stops[i].name} · ${data.stops[i].stop_id}`,n]));
  renderMap(counts,stops.filter(stop=>filters.stop==='all'||stop.stop_id===filters.stop));
 }
 function renderMap(counts,stops){
  if(!globalThis.L){byId('incident-map').textContent=t('mapFailed');return;}
  mapCounts=counts;mapStops=stops;
  if(!map){map=L.map('incident-map',{preferCanvas:true,scrollWheelZoom:false}).setView([37.765,-122.435],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);layer=L.layerGroup().addTo(map);map.on('zoomend',drawMarkers);}
  if(filters.route!=='all'||filters.stop!=='all'){
   if(stops.length===1)map.setView([stops[0].lat,stops[0].lon],16);
   else if(stops.length)map.fitBounds(stops.map(stop=>[stop.lat,stop.lon]),{padding:[20,20],maxZoom:15});
  }else map.setView([37.765,-122.435],12);
  drawMarkers();
  requestAnimationFrame(()=>map.invalidateSize());
 }
 function drawMarkers(){
  layer.clearLayers();
  for(const g of groupMapLocations(data.locations,mapCounts,map.getZoom()))L.circleMarker([g.lat,g.lon],{radius:Math.min(12,3+Math.log2(1+g.count)*.7),color:'#7b4a12',fillOpacity:.42,weight:1}).bindPopup(`<strong>${num(g.count)} ${t('reports')}</strong><br>${num(g.locations)} ${t('grouped')}<br>${t('boundary')}`).addTo(layer);
  if(filters.route!=='all'||filters.stop!=='all')for(const stop of mapStops)L.circleMarker([stop.lat,stop.lon],{radius:4,color:'#0066cc',fillOpacity:1}).bindPopup(esc(stop.name)).addTo(layer);
 }
 for(const id of controls)byId(`incident-${id}`).addEventListener('change',()=>{filters[id]=id==='radius'?Number(byId(`incident-${id}`).value):byId(`incident-${id}`).value;render();});
 byId('language-toggle').addEventListener('click',render);
 async function load(){
  if(busy)return;busy=true;
  try{const response=await fetch('../data/incident-environment.json',{cache:'no-store'});if(!response.ok)throw Error();const p=await response.json();if(p.status!=='available'||!p.incidents?.length||!p.stops?.length||!Array.isArray(p.matches)||!Array.isArray(p.locations)||!Array.isArray(p.categories))throw Error();data=p;failed=false;}
  catch{failed=true;}finally{busy=false;render();}
 }
 render();
 // 中文：历史文件按需下载，避免拖慢实时首页；直接打开功能锚点时立即加载。
 // English: Load history on demand, keeping the realtime homepage independent.
 if(location.hash==='#incident-environment')load();
 else if(globalThis.IntersectionObserver){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load();}},{rootMargin:'300px'});observer.observe(byId('incident-environment'));}
 else load();
 setInterval(()=>{if(data||failed)load();},30*60*1000);
}
if(typeof document!=='undefined')bootstrap();
