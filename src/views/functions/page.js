import pol from "../../lib/mapa";
import utils from "../../lib/utils";
import {functions} from "../../lib/firebase";

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
      goToHome          : () => ctx.router.navigateTo(''),
      callHelloWorld    : () => {
        functions.httpsCallable('helloWorld')()
                 .then(function(result){
                         ctx.publish('msg__helloworld', result.data.message);
                       })
                 .catch(function(error) {
                    ctx.publish('msg__helloworld', error);
                 });
      },
      callGetServerTime : () => {
        functions.httpsCallable('getDate')()
                 .then(function(result){                 
                         ctx.publish('msg__getdate', new Date(result.data.date));
                       })
                 .catch(function(error) {
                    ctx.publish('msg__getdate', error);
                 });
        
      }
    });
  }

  return component;

}
