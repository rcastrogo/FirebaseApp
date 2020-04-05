import pol from "../lib/mapa.js";
import utils from '../lib/utils';
import {auth, messaging}  from '../lib/firebase';

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
      initAll();
    }
  };

  function initAll(){ 
    setState(ctx.currentUser ? 'logged' : 'login');
    utils.addEventListeners(component.root, {
      initCreate    : () => setState('create'),
      cancelCreate  : () => setState('login'),
      createAccount : createAccount,
      login         : initSession,
      logout        : closeSession
    });
  }

  function setState(state) {
    let states = {
      create: () => {
        pol.templates.fill(component.root, {
          state    : state,
          email    : '',
          password : ''
        })  
      },
      login: () => {
        pol.templates.fill(component.root, {
          state    : state,
          email    : localStorage.getItem('lastUserLoggedEmail') || '',
          password : ''
        }) 
      },
      logged: () => {
        pol.templates.fill(component.root, {
          state    : state,
          email    : ctx.currentUser.email,
          password : 'xxxxxxxxxxx'
        }) 
      }
    }
    states[state]();
    component.root.style.opacity = '';
  }

  function createAccount() {
    // ============================================================================
    // Validaciones
    // ============================================================================
    let email     = pol.$('#txt-email', component.root)[0].value;
    let password1 = pol.$('#txt-password', component.root)[0].value;
    let password2 = pol.$('#txt-password-check', component.root)[0].value;
    if (!email) {
      return ctx.publish(ctx.topics.NOTIFICATION, { 
        message : 'El correo electrónico es obligatorio'
      });
    }
    if (!password1 || !password2) {
      return ctx.publish(ctx.topics.NOTIFICATION, { 
        message : 'Debes introducir las contraseñas'
      });
    }
    if (password1 != password2) {
      return ctx.publish(ctx.topics.NOTIFICATION, { 
        message : 'Las contraseñas no son iguales'
      });
    }
    // ============================================================================
    // Crear cuenta
    // ============================================================================
    component.root.style.opacity = '.4';
    auth.createUserWithEmailAndPassword(email, password1)
        .then( result => {
          setTimeout(() => setState('login'), 100);
          ctx.publish(ctx.topics.NOTIFICATION, { 
            message : 'Ya puedes iniciar sesión, la cuenta se ha creado correctamente'
          });
        })
        .catch(function(error) {
          component.root.style.opacity = '';
          let message = '{code}<br>{message}'.format(error);
          ctx.publish(ctx.topics.NOTIFICATION, { message });
        });
  }

  function initSession() {
    // ============================================================================
    // Validaciones
    // ============================================================================
    let email    = pol.$('#txt-login-email', component.root)[0].value;
    let password = pol.$('#txt-login-password', component.root)[0].value;
    if (!email) {
      return ctx.publish(ctx.topics.NOTIFICATION, { 
        message : 'El correo electrónico es obligatorio'
      });
    }
    if (!password) {
      return ctx.publish(ctx.topics.NOTIFICATION, { 
        message : 'Debes introducir la contraseña'
      });
    }
    component.root.style.opacity = '.4';
    auth.signInWithEmailAndPassword(email, password)
        .then( result => {
          setTimeout(() => setState('logged'), 100);
        })
        .catch(function(error) {
          component.root.style.opacity = '';
          let message = '{code}<br>{message}'.format(error);
          ctx.publish(ctx.topics.NOTIFICATION, { message });
        });
  }

  function closeSession() {
    component.root.style.opacity = '.4';
    auth.signOut()
      .then(() => {
        setTimeout(() => setState('login'), 100);
      })
      .catch(function(error) {
        component.root.style.opacity = '';
        let message = '{code}<br>{message}'.format(error);
        ctx.publish(ctx.topics.NOTIFICATION, { message });
      });
  }

  return component;

}
