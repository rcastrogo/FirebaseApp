import pol from "../lib/mapa.js";
import {database, loadUsers, app as firebase} from '../lib/firebase';
import utils from "../lib/utils.js";

const html_content     = require('./notes.page.template');
const SERVER_TIMESTAMP = firebase.firestore.FieldValue.serverTimestamp();

export default function(ctx){
  
  let users = [];

  let component = {
    root   : {},
    init   : function(){ },
    render : function(){
      this.root = pol.build('div', html_content, true);
      this.loadingBox    = this.root.querySelector('#loading-box');
      this.listContainer = this.root.querySelector('#list-container');
      this.itemTemplate  = this.root.querySelector('[template]').cloneNode(true);
      return this.root;
    },
    mounted : function(){
      initAll();
    }
  };

  function initAll() {
    component.loadingBox.style.display = 'block';
    loadUsers(ctx.accesstoken)
      .then(result => {
        users = result.data
                      .users
                      .map( user => {
                        user.email = user.email.split('@')[0];
                        return user;
                      })
                      .toDictionary('uid', 'email');
        return loadData();
      })
      .then(notas => {
        let context = { 
          notas : notas.map( nota => {
            nota.username = users[nota.uid];
            return nota;
          }),
          users : users,
          save  : function (button) {
            saveNote(button);
          },
          delete: function (button) {
            deleteNote(button);
          },
          add: function (button) {
            insertNote(button);
          }
        };
        pol.templates.fill(component.root, context);
        utils.addEventListeners(component.root, {}, context);
        component.loadingBox.style.display = 'none';
        component.listContainer.style.display = 'block';
      })
      .catch( error => {
        console.log(error);
        let message = 'Error de inicialización: {0}'.format(error);
        ctx.publish(ctx.topics.NOTIFICATION, { message });
      });
  }

  function loadData() {
    return new Promise((resolve, reject) => {
      database.collection('notas')
              .get()
              .then(result => {
                resolve(
                  result.docs
                        .map( doc => {
                          let data = doc.data();
                          return { id        : doc.id, 
                                   contenido : data.contenido,
                                   uid       : data.userId,
                                   timestamp : data.timestamp.toDate()
                                 };
                        })
                        .orderBy('timestamp')
                        .reverse()
                );
              })
              .catch(e => reject(e));
    });
  }

  // ===============================================================
  // Save
  // ===============================================================
  function saveNote(button) {
    let id = button.id.split('-')[1];
    // =============================================================
    // Insert
    // =============================================================
    if (id == 'empty') {
      database.collection('notas')
        .add({ contenido : button.parentNode
                                 .parentNode
                                 .firstElementChild
                                 .value,
               userId    : ctx.currentUser.uid,
               timestamp : SERVER_TIMESTAMP})
        .then(function(ref) {
          button.id = 'save-{0}'.format(ref.id);
          button.nextElementSibling.id = 'delete-{0}'.format(ref.id);
          button.parentNode
                .parentNode
                .parentNode.id = 'div-{0}'.format(ref.id);
          // =======================================================
          // Mensaje de información
          // =======================================================
          //let msg = 'Nota grabada con el id: {0}'.format(ref.id);
          //ctx.publish(ctx.topics.NOTIFICATION, { message : msg }); 
        })
        .catch(function(error) {
          let msg = 'Error al insertar la nota: {0}'.format(error);
          ctx.publish(ctx.topics.NOTIFICATION, { message : msg });
        });
      return;
    }
    // ============================================================
    // Update
    // ============================================================
    let nota = pol.$('div-{0}'.format(id));
    nota.style = 'opacity:.6;';
    database.collection("notas")
            .doc(id)
            .update({ 
              contenido : component.root
                                   .querySelector('#div-{0} textarea'.format(id))
                                   .value,
              userId    : ctx.currentUser.uid,
              timestamp : SERVER_TIMESTAMP
            })
            .then(function() {
              nota.style.opacity = '';
              // =====================================================
              // Mensaje de información
              // =====================================================
              //ctx.publish(ctx.topics.NOTIFICATION, { 
              //  message : 'Nota grabada correctamente'
              //});
            }).catch(function(error) {
              nota.style.opacity = '';
              ctx.publish(ctx.topics.NOTIFICATION, { 
                message : 'Error al grabar la nota: {0}'.format(error)
              });
            });
  }

  // =============================================================
  // Delete
  // =============================================================
  function deleteNote(button) {
    let id   = button.id.split('-')[1];
    if(id == 'empty'){
      let nota = button.parentNode.parentNode.parentNode;
      nota.parentNode.removeChild(nota);
      return;
    }else {
      let nota = pol.$('div-{0}'.format(id));
      nota.style = 'opacity:.6;';
      database.collection("notas")
              .doc(id)
              .delete()
              .then(function(){
                // =====================================================
                // Quitar elemento de la lista
                // =====================================================
                nota.parentNode.removeChild(nota);
                // =====================================================
                // Mensaje de información
                // =====================================================
                //ctx.publish(ctx.topics.NOTIFICATION, { 
                //  message : 'Nota borrada correctamente'
                //});
              }).catch(function(error) {
                nota.style.opacity = '';
                ctx.publish(ctx.topics.NOTIFICATION, { 
                  message : 'Error el borrar la nota: {0}'.format(error)
                });
              });
    }
  }

  // =============================================================
  // Insert
  // =============================================================
  function insertNote(button) {
    let context = { 
      notas  : [ { 
        id        : 'empty', 
        contenido : 'Texto de la nota',
        uid       : ctx.currentUser.uid,
        username  : users[ctx.currentUser.uid],
        timestamp : new Date()
      }],
      save   : saveNote,
      delete : deleteNote
    };
    let nota = pol.templates.fill(component.itemTemplate.cloneNode(true), context)
    utils.addEventListeners(nota, {}, context);
    component.listContainer
             .querySelector('div.w3-center')
             .insertAdjacentElement('afterend', nota);
  }

  return component;

}
