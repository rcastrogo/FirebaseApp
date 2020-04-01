import pol from "../lib/mapa.js";
import utils from "../lib/utils.js";

const html_content = require('./menu.component.template');

export default function(ctx){

  let component =  {
    root   : {},
    id     : 'menu.component.ref',
    init   : function(){
    },
    render : function() {
      this.root = pol.build('div', html_content, true);
      return this.root;
    },
    mounted: function(){
      initAll();
    },
    eventHandlers : { 
      sync : syncMenuItem
    }
  };

  function initAll() {
    utils.addEventListeners(component.root, 
                            component.eventHandlers, { 
                              router      : ctx.router,
                              toggleMenu  : toggleMenu,
                              hideMenu    : hideMenu
                            });
    ctx.subscribe(ctx.topics.AUTH_CHANGE, syncMenu);
  }

  function syncMenu(message, user) {
    let links = pol.$('[route-link]', component.root);
    links.map(link => {
      let route = ctx.router
                     .routes
                     .where({ name : link.dataset.key })[0];
      link.style.display = route ? '' : 'none';
    });
  }

  function syncMenuItem(e, data) {
    hideMenu();
    if (data.name === e.href.split('/').lastItem())
      e.classList.add('selected');
    else
      e.classList.remove('selected');
  }

  let dropdownContent;
  function toggleMenu(e) {
    dropdownContent = e.nextElementSibling;
    dropdownContent.classList.toggle('w3-show');
  }
  
  function hideMenu(e) {
    if (dropdownContent){
      dropdownContent.classList.remove('w3-show');
    }
  }

  return component;

}
