import pol from "../lib/mapa.js";

const __template = `<h1>{title}</h1>`;

export default function(ctx){
  return {
    root   : {},
    title  : 'Firebase App',
    init   : function(){},
    render : function(){
      let options = { 
        id        : 'appHeader',
        innerHTML : __template.format(this),
        className : 'w3-container w3-firebase'
      }
      this.root = pol.build('header', options);
      return this.root;
    },
    mounted: function(){
      
    }
  };
}
