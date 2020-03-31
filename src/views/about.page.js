import pol from "../lib/mapa.js";

const html_content = require('./about.page.template');

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
          .querySelector('[about-btn]')
          .onclick = () => {        
            ctx.router.navigateTo('');
          };
    }
  };

  return component;

}
