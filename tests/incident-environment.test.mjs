import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {selectIncidents,summarizeIncidents,normalizeFilters,groupMapLocations} from '../site/analytics/incident-environment.mjs';

const data={categories:['Assault','Larceny Theft'],stops:[{stop_id:'S',routes:['30']},{stop_id:'T',routes:['30']},{stop_id:'U',routes:['1']}],
  locations:[[37.76,-122.45],[37.77,-122.45]],matches:[[0,0,50],[1,0,70],[2,1,150]],
  incidents:[['A','2026-09-01T18:00',0,[0,1]],['B','2026-09-02T05:59',0,[1]],['C','2026-09-03T06:00',1,[0]]]};

test('overlapping stops and multi-category records do not duplicate report totals',()=>{
  const rows=selectIncidents(data,{route:'30',radius:100});
  assert.equal(rows.length,2);
  assert.deepEqual(summarizeIncidents(data,rows),{count:2,day:0,night:2,categories:[1,2]});
});
test('stop, month, category and SF local clock filters combine correctly',()=>{
  assert.deepEqual(selectIncidents(data,{stop:'S',category:'Assault',month:'2026-09',period:'night',radius:100}).map(r=>r[0]),['A']);
  assert.deepEqual(selectIncidents(data,{route:'1',period:'day',radius:200}).map(r=>r[0]),['C']);
  assert.equal(selectIncidents(data,{route:'1',radius:100}).length,0);
});

test('the incident page shows loading rather than misleading zero report counts',()=>{
  const nodes=new Map();
  const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'all',textContent:'',innerHTML:'',disabled:false,setAttribute(){},addEventListener(){}});return nodes.get(id);};
  const context=vm.createContext({Set,Map,Date,Intl,Number,String,Math,Array,
    document:{documentElement:{lang:'en'},getElementById:node,querySelectorAll:()=>[]},
    location:{hash:''},fetch:()=>new Promise(()=>{}),setInterval(){},requestAnimationFrame(){}});
  vm.runInContext(fs.readFileSync('site/analytics/incident-environment.mjs','utf8').replaceAll('export ',''),context);
  assert.match(node('incident-status').textContent,/Loading/);
  assert.equal(node('incident-kpis').innerHTML,'');
  assert.equal(node('incident-route').disabled,true);
});

test('rolling data resets expired months and stops outside the selected route',()=>{
  assert.deepEqual(normalizeFilters(data,{route:'30',stop:'U',month:'2025-01',category:'Expired category',period:'night',radius:300}),
    {route:'30',stop:'all',month:'all',category:'all',period:'night',radius:300});
});

test('zoomed-out map groups nearby locations without changing report totals',()=>{
  const points=[[37.76,-122.45],[37.76001,-122.45001],[37.78,-122.48]];
  const groups=groupMapLocations(points,new Map([[0,2],[1,3],[2,7]]),12);
  assert.equal(groups.length,2);
  assert.equal(groups.reduce((n,g)=>n+g.count,0),12);
  assert.equal(groups.find(g=>g.count===5).locations,2);
  assert.equal(groupMapLocations(points,new Map([[0,2],[1,3],[2,7]]),16).length,3);
});
