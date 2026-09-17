const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// 中文：合成数据仅用于测试，不发布为生产准确度结果。
// English: Synthetic fixtures are test-only, never production accuracy evidence.
function page() {
  const nodes = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {
      value: 'all', innerHTML: '', textContent: '',
      setAttribute() {}, addEventListener() {},
      insertAdjacentHTML(_, html) { this.innerHTML += html; }
    });
    return nodes.get(id);
  };
  const context = vm.createContext({
    URL, Intl, Date, Set, Map, Number, String, Array,
    location: {href: 'https://example.test/analytics/?lang=en', hash: ''},
    localStorage: {getItem() {return null;}, setItem() {}}, history: {replaceState() {}},
    document: {documentElement: {}, getElementById: node, querySelector: node, querySelectorAll() {return [];}},
    fetch() {return new Promise(() => {});}, setInterval() {}, requestAnimationFrame() {}
  });
  vm.runInContext(fs.readFileSync('site/analytics/analytics.js', 'utf8'), context);
  return {context, node};
}

test('analytics has complete bilingual copy and never invents pending accuracy', () => {
  const {context, node} = page();
  assert.match(node('research-status').innerHTML, /not available yet/);
  assert.match(node('accuracy-results').innerHTML, /Waiting for observed arrivals/);
  assert.doesNotMatch(node('accuracy-results').innerHTML, /0 min/);
  assert.equal(vm.runInContext('JSON.stringify(Object.keys(COPY.en).sort()) === JSON.stringify(Object.keys(COPY.zh).sort())', context), true);
  vm.runInContext("language='zh';render()", context);
  assert.match(node('research-status').innerHTML, /暂无准确度结果/);
  assert.equal((node('feature-catalog').innerHTML.match(/class="feature-card/g)||[]).length, 8);
});

test('analytics filters selected routes and shows source-computed matched statistics', () => {
  const {context, node} = page();
  vm.runInContext(`analysis={status:'available',service_date_start:'2026-09-16',service_date_end:'2026-09-16',summary:[
    {route_short_name:'30',prediction_horizon_bucket:'00–05 min',prediction_count:2,trip_stop_instance_count:1,median_absolute_error_min:1.5,p90_absolute_error_min:1.9,median_signed_error_min:-1.5}
  ]};renderResults()`, context);
  assert.match(node('accuracy-results').innerHTML, /1\.5 min/);
  node('eta-route').value = '45';
  vm.runInContext('renderResults()', context);
  assert.match(node('accuracy-results').innerHTML, /does not mean zero/);
});

test('capture excludes other routes and predictions outside the snapshot window', () => {
  const {context, node} = page();
  vm.runInContext(`live={meta:{status:'live',generated_at:'2026-09-16T15:00:00Z'},routes:[],trip_predictions:[
    {route_id:'30',trip_id:'test',stops:[{stop_id:'a',arrival_time:1789570860},{stop_id:'b',arrival_time:1789572900}]},
    {route_id:'38R',trip_id:'other',stops:[{stop_id:'c',arrival_time:1789570860}]}
  ]};renderCapture()`, context);
  assert.match(node('capture-status').innerHTML, /<strong>1<\/strong> future stop predictions/);
  node('eta-route').value = '1';
  vm.runInContext('renderCapture()', context);
  assert.match(node('capture-status').innerHTML, /<strong>0<\/strong>/);
});
