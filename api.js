// FilmCollector 远程爬虫 (TVBox / CatVod 协议, type=2)
// 纯前端运行：自行读取同目录 data.json，完成 首页/分类/搜索/详情/播放。
// 零服务器、零后端，丢到任意静态托管即用。BASE 由发布工具一次性注入。
var BASE = "https://lidawei1985.github.io/filmcollector-pages/";
var CACHE = null;

function request(url) {
  // TVBox/CatVod 引擎提供同步 request；此处为兜底（测试/特殊环境）。
  if (typeof __request__ === 'function') return __request__(url);
  throw new Error('request() 不可用');
}

function loadData() {
  if (CACHE) return CACHE;
  var raw = request(BASE + 'data.json');
  CACHE = JSON.parse(raw);
  return CACHE;
}

function classes() {
  var seen = {}, out = [];
  (loadData().list || []).forEach(function (v) {
    var t = v.type_name || '电影';
    if (!seen[t]) { seen[t] = 1; out.push({ type_id: t, type_name: t }); }
  });
  return out;
}

function home() {
  // TVBox 协议：home() 必须直接返回「平铺的影片列表」，不要分组/嵌套。
  var d = loadData();
  return JSON.stringify({ class: classes(), list: d.list || [], page: 1, pageCount: 1, total: (d.list || []).length, limit: (d.list || []).length });
}
function homeVod() { return home(); }
function homeContent() { return home(); }

function category(tid, pg, filter, extend) {
  var d = loadData();
  var list = (d.list || []).filter(function (v) { return !tid || (v.type_name || '') === tid; });
  return JSON.stringify({ class: classes(), list: list, page: 1, pageCount: 1, total: list.length });
}
function categoryContent(tid, pg, filter, extend) { return category(tid, pg, filter, extend); }

function detail(id) {
  var d = loadData();
  var v = (d.list || []).filter(function (x) { return String(x.vod_id) === String(id); })[0];
  return JSON.stringify({ list: v ? [v] : [] });
}

function search(wd) {
  wd = (wd || '').toLowerCase();
  var d = loadData();
  var list = (d.list || []).filter(function (v) {
    return (v.vod_name || '').toLowerCase().indexOf(wd) >= 0
      || (v.vod_actor || '').toLowerCase().indexOf(wd) >= 0
      || (v.vod_director || '').toLowerCase().indexOf(wd) >= 0
      || (v.type_name || '').toLowerCase().indexOf(wd) >= 0;
  });
  return JSON.stringify({ list: list, page: 1, pageCount: 1, total: list.length });
}

// 播放：传入的 id 为某个候选直链；在其所属影片的候选列表里逐个探测，返回首个可用地址。
// archive.org 某个 CDN 节点临时不可达时，自动切到同片的备用直链，单点故障不影响观看。
function probe(u) {
  try {
    var r = request({ url: u, method: 'HEAD' });
    if (r && (r.code === 200 || r.code === 206 || r.code === 0 || !r.code)) return true;
  } catch (e) {}
  try { return !!request(u); } catch (e) { return false; }
}
function play(flag, id, flags) {
  try {
    var d = loadData();
    for (var i = 0; i < (d.list || []).length; i++) {
      var v = d.list[i];
      var alts = v.vod_play_urls || [v.vod_play_url];
      var idx = alts.indexOf(id);
      if (idx >= 0) {
        var ordered = alts.slice(idx).concat(alts.slice(0, idx));
        for (var k = 0; k < ordered.length; k++) {
          if (probe(ordered[k])) return JSON.stringify({ url: ordered[k] });
        }
        return JSON.stringify({ url: id }); // 探测不支持则原样返回，让播放器自行尝试
      }
    }
  } catch (e) {}
  return JSON.stringify({ url: id });
}
function proxy(opt) { return ''; }

var rule = { title: 'FilmCollector 公共片库', host: BASE, timeout: 5000, ua: 'Mozilla/5.0 FilmCollector' };
function init() { return JSON.stringify(rule); }
