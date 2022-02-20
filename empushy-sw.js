// importScripts('https://cdn.jsdelivr.net/npm/empushy@1.0.72/dist/public/empushy-sw.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const pushApp = firebase.initializeApp({
  apiKey: "AIzaSyBMOG6hg0Kg1KHdxEsHA9FcFcHooCa7A2s",
  authDomain: "empushy-311ed.firebaseapp.com",
  databaseURL: "https://empushy-311ed.firebaseio.com",
  projectId: "empushy-311ed",
  storageBucket: "empushy-311ed.appspot.com",
  messagingSenderId: "441470046302",
  appId: "1:441470046302:web:89075ab819beee5f4f24cf"
}, 'push');

const messaging = firebase.messaging(pushApp);

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload['data']['ticker'];
  const notificationOptions = {
    body: payload['data']['content'],
    icon: 'https://empushy.com/images/empushy_logo_64_64.png',
    data: {
      id: payload['data']['id']
    }
  };

  update_engagement({'notification': payload}, 'delivered')
  self.registration.showNotification(notificationTitle,
    notificationOptions);
});

messaging.onMessage((payload) => {
  console.log('Message received in foreground. ', payload);
  // ...
});

/*messaging.onMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload['data']['ticker'];
  const notificationOptions = {
    body: payload['data']['content'],
    icon: 'https://empushy.com/images/empushy_logo_64_64.png',
    data: {
      id: payload['data']['id']
    }
  };

  update_engagement({'notification': payload}, 'delivered')
  self.registration.showNotification(notificationTitle,
    notificationOptions);
});*/

/*self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  notification = event.data.json()
  const title = notification.title;

  // send request to update delivery metric for this notification..
  notification_data = { notification: { data: { notificationId: notification.id, userId: notification.userId } } }
  update_engagement(notification_data, 'delivered')

  var options = {}

  if(notification.imageURL!=''){
    options = {
      body: notification.message,
      badge: '/images/badge.png',
      icon: notification.icon,
      image: notification.imageURL,
      data: {
        notificationId: notification.id,
        userId: notification.userId
      },
      actions: [
        {
          action: 'read-later',
          title: '💾 Later',
          icon: 'https://pushdweb.github.io/images/ic_later.png'
        },
        {
          action: 'liked',
          title: '👍 Like',
          icon: 'https://pushdweb.github.io/images/ic_like.png'
        },
        {
          action: 'dismissed',
          title: 'Remove',
          icon: 'https://pushdweb.github.io/images/ic_like.png'
        }
      ]
    };
  }
  else {
    options = {
      body: notification.message,
      badge: '/images/badge.png',
      icon: notification.icon,
      data: {
        notificationId: notification.id,
        userId: notification.userId
      },
      actions: [
        {
          action: 'read-later',
          title: '💾 Later',
          icon: 'https://pushdweb.github.io/images/ic_later.png'
        },
        {
          action: 'liked',
          title: '👍 Like',
          icon: 'https://pushdweb.github.io/images/ic_like.png'
        },
        {
          action: 'dismissed',
          title: 'Remove',
          icon: 'https://pushdweb.github.io/images/ic_like.png'
        }
      ]
    };
  }

  event.waitUntil(self.registration.showNotification(title, options));
});*/

self.addEventListener('notificationclick', function(event) {
  console.log('notification clicked')
  update_engagement(event, 'opened')
  /*event.notification.close();

  if (!event.action) {
    // Was a normal notification click
    console.log('Notification Click.');
    update_engagement(event, 'clicked')
    if (clients.openWindow) {
      event.waitUntil(clients.openWindow('https://pushdweb.github.io/notification.html?p='+event.notification.data.userId+'&n='+event.notification.data.notificationId))
    }
    return;
  }

  switch (event.action) {
    case 'read-later':
      console.log('deliver notification later');
      update_engagement(event, 'later')
      break;
    case 'liked':
      console.log('Update like metrics for this notification');
      update_engagement(event, 'liked')
      break;
    case 'dismissed':
      console.log('Update dismiss metrics for this notification');
      update_engagement(event, 'dismissed')
      break;
    default:
      console.log(`Unknown action clicked: '${event.action}'`);
      update_engagement(event, 'unknown')
      break;
  }*/
});

/*self.addEventListener('notificationclose', function(event) {
  console.log('closed!')
});*/

/*self.addEventListener('message', event => {
    console.log(event.data);
    if(event.data=='closeNotification'){

    }
});*/

function update_engagement(event, engagement){
  console.log(event)
  var engageUrl = "https://5ekl4rlvd3.execute-api.eu-west-1.amazonaws.com/prod/web-push/notification-event";

  var formData = JSON.stringify({
    "id": event.notification.data.id,
    "task": engagement
  })

  fetch(engageUrl, {
    method: 'post',
    headers: {
      "Content-type": "application/json; charset=utf-8"
    },
    body: formData
  })
}