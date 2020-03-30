﻿import pol from "../lib/mapa.js";
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
    functions.httpsCallable('helloWorld')()
             .then(function(result){
                     ctx.publish('msg++fecha++1', result.data.message);
                   });
    functions.httpsCallable('getDate')()
             .then(function(result){                 
                     ctx.publish('msg++fecha++2', new Date(result.data.date));
                   });
  }

  function initEventListeners(target) {
    utils.addEventListeners(target, { });
    return target;
  }

  return component;

}
