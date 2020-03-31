import pol from "../lib/mapa.js";
import {database, auth, app as firebase} from '../lib/firebase';
import utils from "../lib/utils.js";

const html_content = require('./notes.page.template');

export default function(ctx){

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
    loadData().then(notas => {
                let context = { 
                  notas : notas,
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
              .catch(e => {
                console.log(e);
              });

  }

  function loadData() {
    return new Promise((resolve, reject) => {
      database.collection('notas')
              .get()
              .then(result => {
                let notas = result.docs.map( doc => {
                  return { id : doc.id, contenido : doc.data().contenido };
                });
                resolve(notas);
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
                                 .previousElementSibling
                                 .value })
        .then(function(ref) {
          button.id = 'save-{0}'.format(ref.id);
          button.parentNode
                .parentNode
                .parentNode.id = 'div-{0}'.format(ref.id)
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
    var currentUser = auth.currentUser;
    database.collection("notas")
            .doc(id)
            .update({ 
              contenido : component.root
                                   .querySelector('#div-{0} textarea'.format(id))
                                   .value,
              timestamp : firebase.firestore.FieldValue.serverTimestamp()
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
        contenido : 'Texto de la nota'
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
