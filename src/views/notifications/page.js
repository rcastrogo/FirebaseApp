import pol from "../../lib/mapa";
import utils from "../../lib/utils";
import {messaging} from "../../lib/firebase";

const html_content = require('./page.template');

export default function(ctx){

  let component = {
    root   : {},
    init   : function(){ },
    render : function(){
      this.root = pol.build('div', html_content, true);
      return this.root;
    },
    mounted : function(){
      initAll();
    }
  };

  function initAll() {
    pol.templates.fill(component.root, {
      addEventListeners : utils.addEventListeners,
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
      send : sendMessage
    });
  }

  function sendMessage() {
    let text  = pol.$('textarea[message]', component.root)[0].value;
    let token = localStorage.getItem('token');
    let url   = 'https://fcm.googleapis.com/fcm/send';
    let key   = 'AAAA2OhwMnw:APA91bH-S8C3khATw90FZMcZI6ORMxTYz3xh5EIlso5s0_uIwofeoWC6cP6xs_Ag1DGXXxP-NoqFUjDzmnV4Jq67SOh07nAEY_hMAH0FYDm_bIXEZo8-1mhuMFrmAuLOToi2d1zkANi51Dn_VnjAZ10T9_ACVcO07A';
    let body  = {
      to : "/topics/ciclistas",
      notification: {
        body         : text,
        title        : "Firebase App",
        click_action : "http://localhost:8081/about",
        icon         : ".//assets//icons//icon-512.png"
      }
    }
    pol.ajax
        .post(url, JSON.stringify(body), req => {
          req.setRequestHeader('Content-Type', 'application/json');
          req.setRequestHeader('Authorization', 'key=' + key);
        })
        .then(result => {
          ctx.publish('msg__info', result);
        })
        .catch( e => {
          ctx.publish('msg__info', 'error ' + e);
        });

  }

  function addOrCancelSubscription(topic, add) {

    if (add) {
      let token = localStorage.getItem('token');
      let url   = 'https://iid.googleapis.com/iid/v1/{0}/rel/topics/{1}'.format(token, topic);
      let key   = 'AAAA2OhwMnw:APA91bH-S8C3khATw90FZMcZI6ORMxTYz3xh5EIlso5s0_uIwofeoWC6cP6xs_Ag1DGXXxP-NoqFUjDzmnV4Jq67SOh07nAEY_hMAH0FYDm_bIXEZo8-1mhuMFrmAuLOToi2d1zkANi51Dn_VnjAZ10T9_ACVcO07A';
      pol.ajax
         .post(url, '', req => {
           req.setRequestHeader('Content-Type', 'application/json');
           req.setRequestHeader('Authorization', 'key=' + key);
         })
         .then(result => {
           ctx.publish('msg__info', result);
         })
         .catch( e => {
           ctx.publish('msg__info', 'error ' + e);
         });
    } else {
      let token = localStorage.getItem('token');
      let url   = 'https://iid.googleapis.com/iid/v1/web/iid/v1:batchRemove';
      let key   = 'AAAA2OhwMnw:APA91bH-S8C3khATw90FZMcZI6ORMxTYz3xh5EIlso5s0_uIwofeoWC6cP6xs_Ag1DGXXxP-NoqFUjDzmnV4Jq67SOh07nAEY_hMAH0FYDm_bIXEZo8-1mhuMFrmAuLOToi2d1zkANi51Dn_VnjAZ10T9_ACVcO07A';
      let body  = { to : '/topics/' + topic,
                    registration_tokens : [token] };
      pol.ajax
         .post(url, JSON.stringify(body), req => {
           req.setRequestHeader('Content-Type', 'application/json');
           req.setRequestHeader('Authorization', 'key=' + key);
         })
         .then(result => {
           ctx.publish('msg__info', result);
         })
         .catch( e => {
           ctx.publish('msg__info', 'error ' + e);
         });
    }
  }
  return component;

}
