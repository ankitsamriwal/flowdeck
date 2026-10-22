var C='flowdeck-v3',A=['./','index.html','style.css','app.js','icon.svg','manifest.webmanifest','templates/index.json','templates/llm-model-build.json','templates/agent-harness.json','templates/platform-development.json','templates/d365-erp-implementation.json','templates/mobile-app-mvp.json'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(A)}));self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(function(res){if(res&&res.ok){var c=res.clone();caches.open(C).then(function(x){x.put(r,c)})}return res}).catch(function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||(r.mode==='navigate'?caches.match('index.html'):undefined)})}));
});
self.addEventListener('notificationclick',function(e){e.notification.close();e.waitUntil(self.clients.matchAll({type:'window'}).then(function(l){return l.length?l[0].focus():self.clients.openWindow('./')}))});
