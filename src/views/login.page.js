import pol from "../lib/mapa.js";
import {auth}  from '../lib/firebase';

const html_content = require('./login.page.template');

export default function(ctx){

  let component = {
    root   : {},
    init   : function(){ },
    render : function(){
      this.root = pol.build('div', html_content, true);
      return this.root;
    },
    mounted : function(){
      this.root
          .querySelector('[register-btn]')
          .onclick = () => {
            let email    = pol.$('#txt-email', component.root)[0].value;
            let password = pol.$('#txt-password', component.root)[0].value;
            auth.createUserWithEmailAndPassword(email, password)
                .then( result => {
                  console.log(result);
                })
                .catch(function(error) {
                  let message = '{code}<br>{message}'.format(error);
                  ctx.publish(ctx.topics.NOTIFICATION, { message });
                });
          };
      this.root
          .querySelector('[login-btn]')
          .onclick = () => {
            let email    = pol.$('#txt-login-email', component.root)[0].value;
            let password = pol.$('#txt-login-password', component.root)[0].value;
            auth.signInWithEmailAndPassword(email, password)
                .then( result => {
                  console.log(result);
                })
                .catch(function(error) {
                  let message = '{code}<br>{message}'.format(error);
                  ctx.publish(ctx.topics.NOTIFICATION, { message });
                });
          };
       this.root
          .querySelector('[logout-btn]')
          .onclick = () => {
             auth.signOut()
                .then(() => {
                  console.log('Logged out!');
                })
                .catch(function(error) {
                  let message = '{code}<br>{message}'.format(error);
                  ctx.publish(ctx.topics.NOTIFICATION, { message });
                });
          };
    }
  };

  return component;

}
