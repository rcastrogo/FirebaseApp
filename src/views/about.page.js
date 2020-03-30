import pol from "../lib/mapa.js";

const html_content = require('./about.page.template');

export default function(){

  let component = {
    root   : {},
    init   : function(){ },
    render : function(){
      this.root = pol.build('div', html_content, true);
      return this.root;
    },
    mounted : function(){
      //this.root
      //    .querySelector('[about-btn-back]')
      //    .onclick = () => {        
      //      history.back();
      //    };
    }
  };

  return component;

}
