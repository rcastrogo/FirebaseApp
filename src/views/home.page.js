import pol from "../lib/mapa.js";
import utils from '../lib/utils';
import {functions}  from '../lib/firebase';

const html_content = require('./home.page.template');

export default function(ctx){

  let component = {
    root   : {},
    init   : function(){ },
    render : function(){
      this.root = pol.build('div', html_content, true);
      return initEventListeners(this.root);
    },
    mounted : function(){
      initAll();
    },
    dispose : function(){ }
  };

  function initAll(){

  }

  function initEventListeners(target) {
    return pol.templates
              .fill( target, {
                addEventListeners : utils.addEventListeners,
                mustLogin : ctx.currentUser ? false : true,
                login     : () => ctx.router.navigateTo('auth')
              });
  }

  return component;

}
