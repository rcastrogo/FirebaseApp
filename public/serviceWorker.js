
const cacheName = 'firebase-v1';

const staticAssets = [
  './',
  './notes',
  './about',
  './index.html',
  './404.html',
  './assets/css/styles.css',
  './assets/css/font-awesome.min.css',
  './assets/css/w3.css',
  './assets/icons/icon-32.png',
  './assets/icons/icon-64.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-168.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-256.png',
  './assets/icons/icon-512.png',
  './assets/imag/logo.png'
];

self.addEventListener('install', async event => {
  const cache = await caches.open(cacheName);
  cache.addAll(staticAssets);
});

self.addEventListener('activate', (event) => {
  var cacheKeeplist = [cacheName];

  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (cacheKeeplist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );

});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === location.url) {
      event.respondWith(cacheFirst(req));
  } else {
      event.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req) {
  const cachedResponse = caches.match(req);
  return cachedResponse || fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(cacheName);

  try {
      const res = await fetch(req);
      if(req.method == 'GET') cache.put(req, res.clone());
      return res;
  } catch (error) {
      return await cache.match(req);
  }
}

// ============================================================================================
// Notificaciones
// ============================================================================================

function isClientFocused() {
  let targets = [];
  return clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then((windowClients) => {
    let isFocused = false;
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.focused) {
        isFocused = true;
      }
      targets.push(client)
    }
    return {isFocused, targets};
  });
}

self.addEventListener('message', function(event) { 

});

let count = 0;
self.addEventListener('push', function(event) {

  const {notification, data} = JSON.parse(event.data.text());

  event.waitUntil(
    self.registration
      .getNotifications()
      .then(list => {
        if (list.length == 0) {
          count = 1;
        } else {
          count++;
          notification.title = `${count} mensajes de ${notification.title}`;
        }
        list.forEach(notif => notif.close());
        return isClientFocused();
      })
      .then( result => {
        notification.actions = JSON.parse(data['gcm.notification.actions']);
        notification.data    = JSON.parse(data['gcm.notification.data']);
        // ===================================================================
        // Informar a la App siempre
        // ===================================================================
        result.targets
              .forEach( client => {
                client.postMessage({ name : 'notification', notification });
              });
        // ===================================================================
        // Lanzar notificación si la app no esta activa
        // ===================================================================
        if (result.isFocused){
          count = 0;
          return new Promise((resolve) => undefined );
        } else {
          return self.registration
                      .showNotification(notification.title, notification);
        }
      })
    );                       
});

self.addEventListener('notificationclick', function(event) {
  //console.log(event);
  //let notification = {
  //  title  : event.notification.title,
  //  body   : event.notification.body,
  //  tag    : event.notification.tag,
  //  action : event.action || ''
  //}

  event.notification.close();

  //clients.matchAll({ type: 'window'})
  //       .then(clients => {
  //         clients.forEach( c => {
  //           c.postMessage({ name : 'clickEvent', notification });
  //         });
           
  //       });

  //var promise = new Promise(function(resolve) {
  //  setTimeout(resolve, 2000);
  //}).then(function() {
  //  return clients.openWindow('https://notas-app.firebaseapp.com/messages');
  //});

  //event.waitUntil(promise);


      event.waitUntil(async function () {
        const allClients = await clients.matchAll({
            includeUncontrolled: true
        });
        let chatClient;
        let appUrl = 'https://notas-app.firebaseapp.com';
        for (const client of allClients) {
            if(client['url'].indexOf(appUrl) >= 0) 
            {
                client.focus();
                chatClient = client;
                break;
            }
        }
        if (!chatClient) {
            chatClient = await clients.openWindow(appUrl);
        }
    }());


});