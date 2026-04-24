// 学習計画管理 - Service Worker (offline cache)
var CACHE='study-planner-v1';
var ASSETS=['./study-planner.html','./manifest.json','./icon.svg'];

self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}));
  self.skipWaiting();
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch',function(e){
  var u=e.request.url;
  // Never cache Google APIs / auth endpoints — they need fresh network
  if(u.indexOf('googleapis.com')>=0||u.indexOf('google.com')>=0||u.indexOf('gstatic.com')>=0)return;
  if(e.request.method!=='GET')return;
  e.respondWith(
    fetch(e.request).then(function(r){
      var rc=r.clone();
      caches.open(CACHE).then(function(c){c.put(e.request,rc);});
      return r;
    }).catch(function(){return caches.match(e.request);})
  );
});
