import pol from "../lib/mapa.js";
import pubsub from "../lib/pubSub.Service";

const TOPICS     = pubsub.TOPICS;

export default function(ctx){

  let component = {
    root   : {},
    init   : function(){ },
    render : function() {
      let options = { 
        id        : "app-content-container",
        innerHTML : '',
        className : 'w3-container',
        style     : { 
          minHeight : '440px',
          padding   : '0 0 60px 0'
        }
      }
      this.root = pol.build('section', options);
      return this.root;
    },
    mounted: function(){
      initScroll();  
    }
  };

  return component;

}

// ==========================================================================
// Scroll
// ==========================================================================
function initScroll(){
    
  function debounce(func, wait, immediate) {
	  var timeout;
	  return function() {
		  var context = this, args = arguments;
		  var later = function() {
			  timeout = null;
			  if (!immediate) func.apply(context, args);
		  };
		  var callNow = immediate && !timeout;
		  clearTimeout(timeout);
		  timeout = setTimeout(later, wait);
		  if (callNow) func.apply(context, args);
	  };
  };                     
      
  function initScroll(){        
    var navbar = document.getElementById("appMenu");
    if(navbar.className.includes('sticky')) return;
    var sticky = navbar.offsetTop;          
    window.onscroll = function myFunction() {
      if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky");
      } else {
        navbar.classList.remove("sticky");
      }
      pubsub.publish(TOPICS.WINDOW_SCROLL, window);
    };
    pubsub.publish(TOPICS.WINDOW_RESIZE, window);
  }
  window.addEventListener("resize", debounce(initScroll, 150), false);
  initScroll();
};