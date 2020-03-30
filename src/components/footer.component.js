import pol from "../lib/mapa.js";

const __template = `<p>{text}</p>`;

export default function(){
  return {
    text   : '© Rafael Castro Gómez, 2020',
    init   : function(){},
    render : function(){
      let options = { 
        id        : "appFooter",
        innerHTML : __template.format(this),
        className : 'w3-container w3-center'
      }
      return pol.build('footer', options);
    },
    mounted: function(){
      
    }
  };
}
