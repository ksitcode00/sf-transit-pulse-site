import test from 'node:test';
import assert from 'node:assert/strict';
import {TRAFFIC_COPY, selectCrashes, crashStats} from '../site/analytics/traffic-safety.mjs';

const data={crashes:[
  {crash_id:'A',date:'2026-01-01',severity:'FATAL',killed:1,injured:2},
  {crash_id:'B',date:'2025-01-01',severity:'SEVERE',killed:0,injured:1},
],matches:[['1','0',0,50],['1','1',0,60],['8','0',0,70],['1','0',1,150]]};
test('route and direction overlap never duplicates city crash totals',()=>{
  assert.equal(selectCrashes(data,'all','all','all',200).length,2);
  assert.deepEqual(crashStats(selectCrashes(data)),{count:1,fatal:1,severe:0,killed:1,injured:2});
});
test('route, year, radius and direction filters combine correctly',()=>{
  assert.equal(selectCrashes(data,'1','0','2025',100).length,0);
  assert.equal(selectCrashes(data,'1','0','2025',200).length,1);
  assert.equal(selectCrashes(data,'8','1','all',200).length,0);
});
test('traffic history has complete bilingual labels',()=>{
  assert.deepEqual(Object.keys(TRAFFIC_COPY.en).sort(),Object.keys(TRAFFIC_COPY.zh).sort());
  assert.match(TRAFFIC_COPY.en.disclaimer,/not risk rates/);
});
