import pol from "../../lib/mapa";
import utils from "../../lib/utils";
import {messaging, loadUsers} from "../../lib/firebase";

const HTML_CONTENT       = require('./page.template');
const IID_GOOGLEAPIS_COM = 'https://iid.googleapis.com/iid/v1/{0}/rel/topics/{1}';
const SERVER_KEY         = 'AAAA2OhwMnw:APA91bH-S8C3khATw90FZMcZI6ORMxTYz3xh5EIlso5s0_uIwofeoWC6cP6xs_Ag' + 
                           '1DGXXxP-NoqFUjDzmnV4Jq67SOh07nAEY_hMAH0FYDm_bIXEZo8-1mhuMFrmAuLOToi2d1zkANi5' + 
                           '1Dn_VnjAZ10T9_ACVcO07A';

export default function(ctx){
  
  let subscriptions = [];
  let users         = {};
  let notifications = [];

  let component = {
    root   : {},
    init   : function(){ },
    render : function(){
      this.root = pol.build('div', HTML_CONTENT, false);
      return this.root;
    },
    mounted : function(){
      initAll();
    },
    dispose: function () {
      function doDispose() {
        let __last = notifications.slice(Math.max(notifications.length - 120, 0))
        localStorage.setItem('notifications', JSON.stringify(__last));
        subscriptions.forEach(id => ctx.unsubscribe(id));
      }
      setTimeout(doDispose, 100);
    }
  };

  function initAll() {
    // ============================================================
    // Inicializar la interfaz de usuario
    // ============================================================
    pol.templates.fill(component.root, {
      addEventListeners : function (e, scope){
        subscriptions = utils.addEventListeners(e, scope);
        console.log(subscriptions);
      },
      requestPermission :  () => {
        messaging.requestPermission()
                 .then(() => {
                   return messaging.getToken();
                 })
                 .then( result => {
                   localStorage.setItem('token', result);
                   pol.templates.fill(component.root, {});
                 })
                 .catch(error => {
                   let msg = 'Error : {0}'.format(error);
                   ctx.publish(ctx.topics.NOTIFICATION, { message : msg });
                 });
      },
      subscribeUnsubscribe : (sender, event, topic) => {
        addOrCancelSubscription(topic, sender.checked);
      },
      send        : sendMessage,
      showConfig  : showConfig,
      closeConfig : closeConfig,
      topics      : { 
        ciclistas       : localStorage.getItem('ciclistas')       ? true : false,
        programadores   : localStorage.getItem('programadores')   ? true : false,
        administradores : localStorage.getItem('administradores') ? true : false
      },
      fontSize : ~~(localStorage.getItem('config.fontsize') || '25'),
      onFontSizeChanged: function (target, emitter){
        localStorage.setItem('config.fontsize', emitter.value);
        target.style.fontSize = '{0}px'.format(emitter.value);
      },
      showElement: function (target, emitter) {
        target.style.display = 'block';
      }
    });   
    // ============================================================
    // Cargar usuarios
    // ============================================================
    loadUsers(ctx.accesstoken)
      .then(result => {
        users = result.data
                      .users
                      .map( user => {
                        user.email = user.email.split('@')[0];
                        return user;
                      })
                      .toDictionary('uid', 'email');
    });
    // ============================================================
    // Cargar las notificaciones almacenadas
    // ============================================================
    loadSavedMessages().then(result => {
      let html = notifications.map( n => getMessageBuilder('', n) )
                              .join('');
      ctx.publish('msg__on__message', html);
      ctx.publish('msg__on__panel__ready', {});
    });
    // ========================================================================
    // Subcripción a la entrada de nuevas notificaciones
    // ========================================================================
    subscriptions.add(ctx.subscribe('msg__notification_pushed', getMessageBuilder));
  }
  
  let __last = { user : '', day : '' };

  function loadSavedMessages() {
    return new Promise((resolve, reject) => {
      setTimeout(function(){
        notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        resolve(notifications);
      }, 10);
    });
  }

  function getMessageBuilder(msg, notification) {
    let date    = new Date();
    let message = '<div class="w3-clear" style="width:100%;">' +
                    '{fecha}' +
                    '<div class="w3-xxx w3-padding-small w3-round w3-border w3-{color} w3-{align}" style="width: fit-content;max-width:95%;margin-bottom:2px;">' + 
                      '<div class="w3-bold">{username}</div>' +
                      '<div style="overflow-wrap:break-word;">{body}</div>' + 
                      '<div class="w3-right-align w3-small">{hour|paddingLeft,00}:{minutes|paddingLeft,00}</div>' +
                    '</div>' +
                  '</div>';
    let current           = notification.data.uid == ctx.currentUser.uid;
    notification.day      = notification.day  || date.format();
    notification.hour     = notification.hour || date.getHours().toString();
    notification.minutes  = notification.minutes || date.getMinutes().toString();
    notification.username = notification.username || users[notification.data.uid] || '';
    let context = { 
      body     : notification.body,
      hour     : notification.hour,
      minutes  : notification.minutes,
      username : notification.data.uid == __last.user ? '' : notification.username,
      align    : current ? 'right' : 'left',
      color    : current ? 'pale-yellow' : 'white',
      fecha    : notification.day == __last.day 
                    ? '' 
                    : ('<div class="w3-center w3-margin">' + 
                          '<span class="w3-border w3-margin w3-round w3-padding-small w3-white">{day}</span>' + 
                        '</div>').format(notification)
    };
    __last.user = notification.data.uid;
    __last.day  = notification.day;
    let html = message.format(context);
    if (msg) {
      // =====================================================
      // Mensaje local recibido desde la nube. Ya en la lista.
      // =====================================================
      if (msg === 'msg__notification_pushed' &&
          notification.data.uid == ctx.currentUser.uid){
        return;
      }
      notifications.push(notification);
      ctx.publish('msg__on__message', html);
    }
    return html;
  }

  let textarea;
  function sendMessage() {
    textarea = textarea || pol.$('textarea[xbind]', component.root)[0];
    let text = textarea.value.trim();
    if(!text) return;
    let topic = pol.$('select', component.root)[0].value;
    let url   = 'https://fcm.googleapis.com/fcm/send';
    let body  = {
      to           : '/topics/{0}'.format(topic),
      notification : {
        body         : text,
        title        : "Firebase App",
        click_action : "https://notas-app.firebaseapp.com",
        icon         : "./assets/icons/icon-512.png",
        image        : "./assets//img/logo.png",
        tag          : "",
        data         : { uid : ctx.currentUser.uid },
        actions      : [ 
          { "action" : "cmd_send"  , "title" : "Responder" },
          { "action" : "cmd_cancel", "title" : "Descartar" }
        ]
      },
      data : { uid: ctx.currentUser.uid }
    }
    // =============================================================
    // Mensaje local
    // =============================================================
    getMessageBuilder('local', body.notification);
    textarea.value = '';
    // =============================================================
    // Mensaje al resto
    // =============================================================
    pol.ajax
       .post(url, JSON.stringify(body), req => {
         req.setRequestHeader('Content-Type', 'application/json');
         req.setRequestHeader('Authorization', 'key=' + SERVER_KEY);
       })
       .then(result => {
         //textarea.value = '';
       })
       .catch( e => {
         ctx.publish(ctx.topics.NOTIFICATION, { message : e });
       });
  }

  function addOrCancelSubscription(topic, add) {  
    let token = localStorage.getItem('token');
    let url   = IID_GOOGLEAPIS_COM.format(token, topic);
    // ===============================================================
    // Add topic
    // ===============================================================
    let request;
    if (add) {
      pol.ajax
         .post(url, '', req => {
           request = req;
           req.setRequestHeader('Content-Type', 'application/json');
           req.setRequestHeader('Authorization', 'key=' + SERVER_KEY);
         })
         .then(result => {
           if (request.status == 200) {
             localStorage.setItem(topic, true);
           } else if (request.status == 400) {
             throw new Error(result);
           } else if (request.status == 0) {
             throw new Error('Error de red');
           }
         })
         .catch( e => {
           localStorage.setItem(topic, '');
           ctx.publish(ctx.topics.NOTIFICATION, { message : e });
         });
      return;
    } 
    // ===============================================================
    // Remove topic
    // ===============================================================
    pol.ajax
       .delete(url, '', req => {
         request = req;
         req.setRequestHeader('Content-Type', 'application/json');
         req.setRequestHeader('Authorization', 'key=' + SERVER_KEY);
       })
       .then(result => {
         if (request.status == 200) {
           localStorage.setItem(topic, '');
         } else if (request.status == 400) {
           throw new Error(result);
         } else if (request.status == 0) {
           throw new Error('Error de red');
         }
       })
       .catch( e => {
         localStorage.setItem(topic, true);
         ctx.publish(ctx.topics.NOTIFICATION, { message : e });
       });
  }

  function showConfig() {
    let item = pol.$('config-panel');
    item.style.height = '260px';
    item.style.opacity = '1';
  }

  function closeConfig() {
    let item = pol.$('config-panel');
    item.style.height = '0';
    item.style.opacity = '0';
  }

  return component;

}
