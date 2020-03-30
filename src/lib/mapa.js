
let __module = {};
(function(module, name){

  var _module =  module[name] = { apply : function apply(o, c, d){
                                            if (d) apply(o, d);
                                            if (o && c && typeof c == 'object'){
                                              for (var p in c){                                  
                                                if (typeof c[p] == 'object'){
                                                  apply(o[p], c[p] )        
                                                }else{
                                                  o[p] = c[p];
                                                }                                                 
                                              }
                                            }
                                            return o;
                                          }};      
  // ========================================================================================
  // Utils
  // ========================================================================================
  (function(module){
    module.apply(module,{ 
      toArray     : function(v){return Array.prototype.slice.call(v); },
      isNull      : function(v){return v === null; },
      isArray     : function(v){return Array.isArray(v); },
      isString    : function(v){return typeof v == 'string';},
      isBoolean   : function(v){return typeof v == 'boolean';},
      isNumber    : function(v){return typeof v == 'number';},
      isFunction  : function(v){return typeof v == 'function';},
      isObject    : function(v){return v && typeof v == 'object';},
      clone       : function(o) {
        if(module.isArray(o))             return o.slice(0);
        if(module.isObject(o) && o.clone) return o.clone();
        if(module.isObject(o)){               
          return Object.keys(o).reduce( function(a, k){
            a[k] = module.clone(o[k]);
            return a;
          }, {});
        }
        return o;
      },        
      join        : function(items, property, separator){
        return items.reduce(function(a, o){ return a.append(o[property || 'id']); }, [])
                    .join(separator === undefined ? '-' : (separator || '')); 
      },
      stringBuilder : function(s){
          return { value      : s || '',
                   append     : function(s){ this.value = this.value + s; return this;},
                   appendLine : function(s){ this.value = this.value + (s || '') + '\n'; return this;}}
      },
      build : function(tagName, o, firstElementChild){
        let options = module.isString(o) ? { innerHTML : o } : o;
        let e = _module.apply(document.createElement(tagName), options)
        return firstElementChild ? e.firstElementChild : e;
      },
      $ : function(e, control){ 
        return (typeof e === 'string') ? document.getElementById(e) || 
                                         module.toArray((control || document).querySelectorAll(e) || [])
                                       : e;
      },
      parseQueryString : function (){
        return location.search
                       .slice(1)
                       .split('&').reduce( (o, a) => { 
                         o[a.split('=')[0]] = a.split('=')[1] || '';
                         return o;
                       }, {})
      }
    });
  }(_module));
  // ========================================================================================
  // Strings
  // ========================================================================================
  (function(module){
    module.apply(String, {
      stringBuilder : module.stringBuilder,
      leftPad       : function (val, size, ch) {
        var result = '' + val;
        if (ch === null || ch === undefined || ch === '') ch = ' ';            
        while (result.length < size) result = ch + result;            
        return result;
      },
      trimValues : function (values){ return values.map(function(s){return s.trim();});}
    });
    module.apply(String.prototype, {
      replaceAll  : function(pattern, replacement) { return this.split(pattern).join(replacement); },
      repeat      : String.prototype.repeat     || function(a) { return new Array(a + 1).join(this); },
      contains    : String.prototype.includes   || function(t, start) { return this.indexOf(t) >= (start || 0); },
      startsWith  : String.prototype.startsWith || function(t){ return this.indexOf(t) == 0; },                             
      toFloat     : function(){ return this.trim().replaceAll('.', '').replaceAll(',', '.') },
      fixDate     : function(separator){ return this.split(separator || ' ')[0]; },
      fixTime     : function(separator){ return this.split(separator || ' ')[1]; },
      fixYear     : function(){ return this.fixDate().split('/')[2];},
      trimSeconds : function(){ return this.split(':')[0] + ':' + this.split(':')[1] ; },
      paddingLeft : function(paddingValue){ return (paddingValue + this).slice(-paddingValue.length); },
      format      : function(){
        var __arg     = arguments;
        var __context = __arg[__arg.length - 1] || self; 
        var __call_fn = function (fn, params, base) {
          var _args = String.trimValues(params)
                            .reduce(function (a, p) {                          
                              a.push(p.charAt(0) == '@' ? module.templates
                                                                .getValue(p.slice(1), __context)
                                                        : p);
                              return a;
                            }, base);
          return fn.apply(__context, _args);
        }

        return this.replace(/\{(\d+|[^{]+)\}/g, function(m, k){
          let [key, fnName] = String.trimValues(k.split(':'));
          let value;
          if(/^\d+/.test(key)){
            let tokens = String.trimValues(key.split('|'));
            let index  = tokens[0];
            let name   = tokens.length == 0 ? 'data'
                                            : ['data'].concat(tokens.slice(1))
                                                      .join('|');
            let scope  = { data : __arg[index], outerScope : __context };
            value = module.templates.getValue(name, scope);
          }else{
            value = module.templates.getValue(key, __context);
          }
          // fn(scope.Other, 'A', '5')
          // fnName:@window.location.href;A;5
          if(module.isFunction(value)){
            return __call_fn(value, 
                             fnName ? fnName.split(/\s|\;/) 
                                    : [], 
                             []);
          }
          // Data.toUpper(value, scope.Other, 'A', '5')
          // name:Data.toUpper=>@Other;A;5
          if(fnName){          
            let [name, params] = String.trimValues(fnName.split(/=>/));
            params = params ? params.split(/\s|\;/)
                            : [];
            return __call_fn(module.templates
                                   .getValue(name, __context), 
                             params,
                             [value]);          
          }
          return value;
        });
      },
      htmlDecode  : function () {
        return new DOMParser().parseFromString(this, "text/html")
                              .documentElement
                              .textContent;
      }
    });      
  }(_module));      

  (function(module){
    module.apply(Date.prototype, {
      format: function (fmt) {
        if (fmt == 'yyyymmdd') {
          return '{2|paddingLeft,0000}/{1|paddingLeft,00}/{0|paddingLeft,00}'.format(
                    this.getDate().toString(),
                    (this.getMonth() + 1).toString(),
                    this.getFullYear().toString());
        }
        return '{0|paddingLeft,00}/{1|paddingLeft,00}/{2|paddingLeft,0000}'.format(
                  this.getDate().toString(),
                  (this.getMonth() + 1).toString(),
                  this.getFullYear().toString());
      }
    });
  })(_module);
  // ========================================================================================
  // Array
  // ========================================================================================
  (function(module){
    module.apply(Array.prototype, {          
      remove   : function(o) {
        var index = this.indexOf(o);
        if (index != -1) this.splice(index, 1);
        return this;
      },
      add      : function(o) {
        this.push(o);
        return o;
      },
      append   : function(o) {
        this.push(o);
        return this;
      },
      item     : function(propName, value, def){
        return arguments==1 ? this.filter( function(v){return v['id'] == propName || v['_id'] == propName})[0] || def
                            : this.filter( function(v){return v[propName] == value})[0] || def;
      },
      contains : function(propName,value){ return this.item(propName,value); },
      lastItem : function() { return this[this.length - 1]; },
      select   : function(sentence){ return this.map(sentence) },   
      where    : function(sentence){ 
        if(module.isFunction(sentence)) return this.filter(sentence);
        if(module.isObject(sentence)){
          return this.filter(new Function('a', Object.keys(sentence)
                                                     .reduce(function(a, propname, i){
                                                               return a + (i > 0 ? ' && ' : '')
                                                                        +  (function(){
                                                                             var __value = sentence[propname];
                                                                             if(__value instanceof RegExp) return '{1}.test(a.{0})'.format(propname, __value);
                                                                             if(module.isString(__value)) return 'a.{0} === \'{1}\''.format(propname, __value);
                                                                             return 'a.{0} === {1}'.format(propname, __value);
                                                                            }());                                        
                                                             }, 'return ')));
        }
        return this;
      },
      sortBy      : function(propname, desc){
        var __order = [];
        var __names = propname.split(',').map( function(token,i){ 
          var __pair = token.split(' ');
          __order[i] = (__pair[1] && (__pair[1].toUpperCase()=='DESC')) ? -1 : 1;      
          return __pair[0];    
        });
        __order[0] = (desc ? -1 : 1)
        this.sort(function(a, b){
                    var i = 0;                 
                    var __fn = function(a, b){
                      var __x = a[__names[i]];
                      var __y = b[__names[i]];
                      if(__x < __y) return -1 * __order[i];
                      if(__x > __y) return  1 * __order[i];
                      i++;
                      if(i < __names.length) return __fn(a,b);       
                      return 0;               
                    }
                    return __fn(a,b);                                  
                  });
        return this;    
      },
      orderBy     : function(sentence){
        var __sentence = sentence;    
        if(module.isString(sentence)) __sentence = function(a){ return a[sentence]; }
        return this.map(function(e){return e})
                   .sort(function(a, b){
                      var x = __sentence(a);
                      var y = __sentence(b);
                      return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                   });     
      },
      distinct    : function(sentence) {
        var __sentence = sentence;    
        if(module.isString(sentence)) __sentence = function(a){ return a[sentence]; }
        var r = [];
        this.forEach(function(item){
          var _value = __sentence(item);
          if(r.indexOf(_value)==-1) r.push(_value);
        });
        return r;
      },
      groupBy : function(sentence){
        var __sentence = sentence;    
        if(module.isString(sentence)) __sentence = function(a){ return a[sentence]; }
        return this.reduce(function(groups, item) {
          var val = __sentence(item);
          (groups[val] = groups[val] || []).push(item);
          return groups
        }, {})
      },
      toDictionary : function(prop, value){
        return this.reduce(function(a, d){
                             a[d[prop]] = value ? d[value] : d;
                             return a;
                           }, {});  
      }
    });       
  }(_module));
  // ========================================================================================
  // Include
  // ========================================================================================
  (function(module){ 
    var includes = [];
    module.Include = function(url){
      return new Promise( (resolve) => {
        function __resolve() {
          includes.push(url.toLowerCase());
          resolve();
        }
        if(includes.indexOf(url.toLowerCase())>-1){
          resolve();
          return;
        }
        var script = module.build('script', { type : 'text/javascript' })
        if (script.readyState){  
          script.onreadystatechange = function(){
            if(script.readyState=='loaded'||script.readyState=='complete'){
              script.onreadystatechange = null;
              __resolve();
            }
          };
        }else{ script.onload = function(){ __resolve(); };}
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);   
      });
    }
  }(_module));
  // =====================================================================================
  // Templates
  // =====================================================================================
  (function(module){

    function getValue(key, scope) { 
      return key.split(/\.|\[|\]/)
                .reduce( function(a, b){
                  if (b === '') return a;
                  if (b === 'this') return a;
                  let name = b;
                  // =====================================================
                  // Prototype libro.name|htmlDecode,p1,p2,...
                  // =====================================================
                  let apply_proto = b.indexOf('|') > -1;
                  let arg  = [];
                  if(apply_proto){
                    let tokens = String.trimValues(b.split('|'));
                    name = tokens[0];
                    arg  = String.trimValues(tokens[1].split(','));
                  }
                  let value = a[name];
                  // =====================================================
                  // Buscar la propiedad en un ambito superior si existe
                  // =====================================================
                  if (value === undefined && a.outerScope) {
                    value = getValue(name, a.outerScope);
                  }
                  // =====================================================
                  // Existe el valor. Se le aplica el prototipo si procede
                  // =====================================================
                  if (value != undefined) {
                    return apply_proto ? value.__proto__[arg[0]]
                                              .apply(value, arg.slice(1))
                                       : value;
                  }
                  // =====================================================
                  // window/self o cadena vacía
                  // =====================================================
                  return a === self ? '' : self;
                }, scope || self );    
    }

    function __getValue(key, scope, def) {
      let v = getValue(key,scope);
      return v == window ? def : v;
    }
   
    function merge(template, o, HTMLElemnt) {

      var __call_fn = function (fn, params, base) {
        var _args = String.trimValues(params)
                          .reduce(function (a, p) {                          
                            a.push(p.charAt(0) == '@' ? getValue(p.slice(1), o)
                                                      : p);
                            return a;
                          }, base);
        if(HTMLElemnt) _args.push(HTMLElemnt);
        return fn.apply(o, _args);
      }

      var __result = template.replace(/{([^{]+)?}/g, function (m, key) {
                       if(key.indexOf(':') > 0){
                         let tokens = String.trimValues(key.split(':'));                       
                         let value  = getValue(tokens[0], o);                      
                         let [name, params] = String.trimValues(tokens[1].split(/=>/));
                         let _params = params ? String.trimValues(params.split(/\s|\;/))
                                              : [];
                         return __call_fn(getValue(name, o), _params, [value]);
                       }
                       let [name, params] = String.trimValues(key.split(/=>/)); 
                       var value = getValue(name, o);
                       if(module.isFunction(value))
                         return __call_fn(value, params.split(/\s|\;/), []);
                       else
                         return value;                   
                     });     
      return __result;
    }

    function fillTemplate(e, scope) {
      var _root = module.$(e);
      // ==============================================================================
      // Elementos en este nivel
      // ==============================================================================
      var _repeaters = module.$('[xfor]', _root);
      var _repeatersElements = _repeaters.reduce((a, r) => {
        return a.concat(module.$('[xbind]', r));
      }, [..._repeaters]);
      var _elements = module.$('[xbind]', _root)
                            .filter(x => !_repeatersElements.includes(x));
      if (_root.attributes.xbind) _elements.push(_root);
      // ==============================================================================
      // Procesado de los elementos
      // ==============================================================================
      _elements.forEach(function (child) {
        // ============================================================================
        // Visibilidad del elemento. Ej: xif="index"
        // ============================================================================
        if (child.attributes.xif) {
          let fn = new Function('ctx','return {0};'.format(child.attributes.xif.value)
                                                   .replaceAll('@', 'this.'));
          child.style.display = fn.apply(scope) ? '' : 'none';
        }
        // ============================================================================
        // Atributos que es necesario procesar. Ej: id="txt-{index}"
        // ============================================================================
        module.toArray(child.attributes)
              .where({ value : /{[^{]+?}/g })
              .map(a => a.value = merge(a.value, scope));
        // ============================================================================
        // Nodos texto de este elemento
        // ============================================================================
        module.toArray(child.childNodes)
              .where({ nodeType    : 3 })
              .where({ textContent : /{[^{]+?}/g})
              .forEach(text => text.textContent = merge(text.textContent, scope, text));
        // ============================================================================
        // Propiedades que establecer
        // ============================================================================
        String.trimValues(child.attributes.xbind.value.split(';'))
              .forEach(function (token) {
          if (token === '') return;
          let [name, params] = String.trimValues(token.split(':'));
          let [prop_name, _params] = String.trimValues(params.split(/=>/));
          var _value = getValue(prop_name, scope);
          // ==========================================================================
          // _value es una función de transformación:
          // xbind="textContent:Data.toUpper => @Other A 5"
          // Que recibirá: Data.toUpper(scope.Other, 'A', '5', child)
          // ==========================================================================
          if (module.isFunction(_value)){
            var _args = String.trimValues(_params.split(/\s|#/))
                              .reduce(function (a, p){                                
                                a.push(p.charAt(0) == '@' ? getValue(p.slice(1), scope)
                                                          : p);
                                return a;
                              }, []);
            _args.push(child);
            _value = _value.apply(scope, _args);
          } 
          if(name) child[name] = _value;
        });
      });
      // ====================================================================
      // Procesado de los repeaters
      // ====================================================================
      _repeaters.map( repeater => {
        let [itemName, propname] = String.trimValues(repeater.attributes
                                                             .xfor
                                                             .value
                                                             .split(' in '));
        let data = getValue(propname, scope);
        if (data && data != window) {
          data.map( (d, i) => {
            let __scope = { index      : i,
                            outerScope : scope };
            __scope[itemName] = _module.clone(d);
            let node = fillTemplate(repeater.cloneNode(true), __scope);
            repeater.parentNode.insertBefore(node, repeater);
          }) 
        }
        return repeater;
      }).forEach( repeater => repeater.parentNode.removeChild(repeater) );

      return e;
    }

    function executeTemplate(e, values, dom) {
      var _template = module.$(e);
      var _result   = values.reduce( function(a, v, i){
        var _node = { index : i,
                      data  : v,
                      node  : fillTemplate(_template.cloneNode(true), v) };
        a.nodes.push(_node);
        if (!dom) a.html.push(_node.node.outerHTML.replace(/xbind="[^"]*"/g, ''));
        return a; 
      }, { nodes : [], html : [] });
      return dom ? _result.nodes : _result.html.join('');
    }
    
    module.templates = { getValue  : getValue,
                         merge     : merge,
                         execute   : executeTemplate,
                         fill      : fillTemplate };

  }(_module));

  // =================================================================================================
  // Ajax
  // =================================================================================================
  (function(module){  
    module.ajax = {};
    module.apply(module.ajax, {
      get  : function (url, interceptor) {
        return new Promise( (resolve, reject) => {
          var xml = this.createXMLHttpRequest();
          if(interceptor) interceptor(xml);
          xml.open('GET', url, true);
          xml.onreadystatechange = function () { 
            if (xml.readyState == 4){
              resolve(xml.responseText)
            }
          };
          xml.onerror = function(e) { reject(e); };
          xml.send(null);
        });

      },
      post : function(url, params, interceptor) {
        return new Promise( (resolve, reject) => {
          var xml = this.createXMLHttpRequest();
          xml.open('POST', url, true);
          if(interceptor){
            interceptor(xml);
          } else {
            xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset:ISO-8859-1');
          }
          xml.onreadystatechange = function() { if (xml.readyState == 4) resolve(xml.responseText) };
          xml.send(params);        
        });
      },
      callWebMethod : function(url, params, callBack) {
        var xml = this.createXMLHttpRequest();
        xml.open('POST', url, true);
        xml.onreadystatechange = function(){ if (xml.readyState == 4) callBack(xml.responseText) };
        xml.setRequestHeader('Content-type', 'application/json; charset=utf-8');
        xml.send(params);
      },
      createXMLHttpRequest : function(){ return new XMLHttpRequest(); }
    });  
  }(_module)); 
      
  // =================================================================================================
  // Tabbly
  // =================================================================================================
  (function (module){
      
    var __context;

    function __ExecuteCode(code){

      __context = { sections : [], groups : [], details : []};

      var __cur;
      var __func       = '';
      var __funcBody   = '';
      var __setState  = false;

      function __get(value){
        if(value && value.trim().startsWith('@')){
          return __context[value.trim().split('@')[1].trim()] || '';
        }else if(value){
          return value.trim();
        }
        return '';
      }  

      function __parse_properties(value){
        var __reg   =  /([a-zA-Z0-9_\-]*)\s*:\s*('[^']*'|[^\s]*)/g;
        var __o     = {};
        var __match = __reg.exec(value);
        while (__match != null) {
          __o[__match[1].trim()] = __get(__match[2].trim().replace(/^'([^']*)'$/g, '$1'));
          __match = __reg.exec(value);
        }
        return __o
      }

      function __parseLine(l, o){
        if(!__func && !l.trim()) return function(){};
        var __keys = /DEFINE|#|CREATE|SET|FUNCTION|END/;
        if(__keys.test(l)){
          if(/^#/.test(l)){
            return function(){};
          }else if(/^SET (\w.*)/.test(l)){  
            var __tokens = l.match(/^SET (\w.*)$/);
            __setState = true;
            __func      = __tokens[1].trim();
            __funcBody  = '';
            return function(){};
          }else if(/^FUNCTION (\w.*)/.test(l)){  
            var __tokens = l.match(/^FUNCTION (\w.*)$/);
            __setState  = false;
            __func       = __tokens[1].trim();
            __funcBody   = '';
            return function(){};
          }else if(/^END/.test(l)){      
            var __body = __funcBody;
            var __name = __func;
            __func = __funcBody = ''; 
            if(__setState){
              __setState = false;
              return function(){            
                return function(ctx){ __cur[__name] = __body.trim(); }
              }();
            }else{
              return function(){            
                return function(ctx){ ctx[__name] = new Function('ctx', __body); }
              }();
            }                 
          }else if(/^DEFINE\s\s*(\w.*)\s*=\s*(.*)$/.test(l)){
            var __tokens = l.match(/^DEFINE\s\s*([a-zA-Z0-9_\-]*)\s*=\s*(.*)$/);
            return function(){ 
              var tokens = __tokens;
              return function(ctx){ ctx[tokens[1].trim()] = tokens[2].trim(); }
            }();
          }else if(/^CREATE\s\s*(\w*) (.*)$/.test(l)){
            var __tokens = l.match(/^CREATE\s\s*(\w*) (.*)$/);
            if(__tokens[1]=='section'){
              return function(){ 
                var tokens = __tokens;
                return function(ctx){ 
                  ctx.sections.push(__parse_properties(tokens[2])); 
                  __cur = ctx.sections[ctx.sections.length - 1];}
              }();
            }
            else if(__tokens[1]=='group'){
              return function(){ 
                var tokens = __tokens;
                return function(ctx){ 
                  ctx.groups.push(__parse_properties(tokens[2]));
                  __cur = ctx.groups[ctx.groups.length - 1];}
              }();
            }else if(__tokens[1]=='detail'){
              return function(){ 
                var tokens = __tokens;
                return function(ctx){
                  ctx.details.push(__parse_properties(tokens[2]));
                  __cur = ctx.details[ctx.details.length - 1];}
              }();
            }
          }else{ throw new Error('Tabbly : Unrecognized text after DEFINE')}  
        }else{ 
          if(__func){
            __funcBody += o;
            __funcBody += '\n';
            return function(){};
          }
          throw new Error('Tabbly : Unrecognized text')
        }
      }

      code.split('\n').forEach(function(l){ 
        __parseLine(l.trim(),l)(__context); 
      });

      return { context : __context };

    }

    module.tabbly = { execute : __ExecuteCode };

  }(_module));
      
  // =================================================================================================
  // Reports
  // =================================================================================================
  (function(module) {

    module.ReportEngine                = {};      
    module.ReportEngine.generateReport = function(rd, data, mediator){
      mediator.message({ type : 'report.begin' });
      var __rd      = rd || module.ReportEngine.rd;
      // ===========================================================================================
      // Transformar los datos
      // ===========================================================================================
      var __dataSet = __rd.context.parseData ? __rd.context.parseData(__rd, data, mediator.message)
                                             : data;
      mediator.message({ type : 'report.log.message', text : 'Inicializando...' });
      console.time('Render');
      // ===========================================================================================
      // Inicializar funciones para la generación de contenido personalizado
      // ===========================================================================================
      function __initContentProviders(){
        [__rd.context.sections, __rd.context.details, __rd.context.groups]
        .reduce(function(a,b){ return a.concat(b); }, [])
        .map(function(s){
          if(s.valueProviderfn){
            s.valueProvider = module.templates.getValue(s.valueProviderfn, self); 
            delete s.valueProviderfn;             
          }
          if(s.footerValueProviderfn){
            s.footerValueProvider = module.templates.getValue(s.footerValueProviderfn, self); 
            delete s.footerValueProviderfn; 
          }
          if(s.headerValueProviderfn){
            s.headerValueProvider = module.templates.getValue(s.headerValueProviderfn, self); 
            delete s.headerValueProviderfn;
          }  
        });
      }
      // ===================================================================================================
      // Generación de las secciones de cabecera de las agrupaciones
      // ===================================================================================================
      var __MERGE_AND_SEND = function(t, p, fnkey){ mediator.send(module.templates.merge(t, p)); };
      function __groupsHeaders(){
        __groups.forEach(function(g, ii){
          if(ii < __breakIndex) return; 
          mediator.message({ type : 'report.sections.group.header', value : g.id });  
          if(g.definition.header) return __MERGE_AND_SEND(g.definition.header, g, 'compiled_headerfn');
          if(g.definition.headerValueProvider) return mediator.send(g.definition.headerValueProvider(g)); 
        });    
      }
      // ===================================================================================================
      // Generación de las secciones de resumen de las agrupaciones
      // ===================================================================================================
      function __groupsFooters(index){
        var __gg = __groups.map(function(g){return g;}); 
        if(index) __gg.splice(0, index);
        __gg.reverse().forEach( function(g){
          mediator.message({ type : 'report.sections.group.footer', value : g.id });          
          if(g.definition.footer) return __MERGE_AND_SEND(g.definition.footer, g, 'compiled_footerfn');
          if(g.definition.footerValueProvider) return mediator.send(g.definition.footerValueProvider(g));
        }); 
      } 
      // ===================================================================================
      // Generación de las secciones de detalle
      // ===================================================================================
      function __detailsSections(){
        __details.forEach(function(d){
          mediator.message({ type : 'report.sections.detail', value : d.id });
          if(d.template) return __MERGE_AND_SEND(d.template, d, 'compiledfn')
          if(d.valueProvider) return mediator.send(d.valueProvider(d));
        })            
      }
      // ===================================================================================
      // Generación de las secciones de total general
      // ===================================================================================
      function __grandTotalSections(){
        __totals.forEach(function(t){
          mediator.message({ type : 'report.sections.total', value : t.id });
          if(t.template) return __MERGE_AND_SEND(t.template, t, 'compiledfn')
          if(t.valueProvider) return mediator.send(t.valueProvider(t));
        })            
      } 
      // ===================================================================================
      // Generación de las secciones de cabecera del informe
      // ===================================================================================
      function __reportHeaderSections(){
        __headers.forEach(function(t){
          mediator.message({ type : 'report.sections.header', value : t });
          if(t.template) return __MERGE_AND_SEND(t.template, t, 'compiledfn')
          if(t.valueProvider) return mediator.send(t.valueProvider(t));
        })            
      } 
      // ===================================================================================
      // Inicializar el objeto que sirve de acumulador
      // ===================================================================================
      function __resolveSummaryObject(){
        var __summary = JSON.parse(__rd.context.summary || '{}');
        if(__rd.context.onInitSummaryObject) return __rd.context.onInitSummaryObject(__summary);      
        return __summary;
      }

      var __breakIndex = -1; 

      var __summary    = __resolveSummaryObject();
      var __headers    = (__rd.context.sections || []).where({ type : 'header' });
      var __totals     = (__rd.context.sections || []).where({ type : 'total' });
      var __footers    = (__rd.context.sections || []).where({ type : 'footer' });
      var __details    = __rd.context.details || [];
      var __groups     = __rd.context.groups 
                                     .map(function(g, i){
                                          return {  name       : 'G' + (i+1),
                                                    rd         : __rd,
                                                    definition : g,
                                                    current    : '', 
                                                    data       : module.clone(__summary),                         
                                                    init : function(value){
                                                            var __k = value[this.definition.key].toString();
                                                            var __Gx = self.BS[this.name];
                                                            __Gx.all[__k] = __Gx.all[__k] || [];
                                                            __Gx.all[__k].push(value);
                                                            __Gx.recordCount = 1;
                                                            if(this.__resume === false) return;
                                                            if(this.__resume){
                                                              module.ReportEngine.copy(value, this.data);
                                                              return
                                                            }
                                                            if(this.__resume = Object.keys(this.data).length > 0)                                                                                                                        
                                                              module.ReportEngine.copy(value, this.data); 
                                                    },
                                                    sum  : function(value){ 
                                                            var __k = value[this.definition.key].toString();
                                                            var __Gx = self.BS[this.name]; 
                                                            __Gx.all[__k] = __Gx.all[__k] || [];
                                                            __Gx.all[__k].push(value);
                                                            __Gx.recordCount += 1;
                                                            if(this.__resume === false) return;
                                                            module.ReportEngine.sum(value, this.data);
                                                    }, 
                                                    test : function(value){ 
                                                              return value[this.definition.key] == this.current;
                                                    }}           
                                    }) || [];                                   
      self.BS = { reportDefinition : __rd, mediator : mediator };              
      // ==============================================================================================
      // Ordenar los datos
      // ==============================================================================================
      if(__rd.context.iteratefn){
        mediator.message({ type : 'report.log.message', text : 'Inicializando elementos...' });
        __dataSet.forEach(__rd.context.iteratefn);
      }
      if(__rd.context.orderBy){
        mediator.message({ type : 'report.log.message', text : 'Ordenando datos...' });
        __dataSet.sortBy(__rd.context.orderBy, false);
      }
      // ==============================================================================================
      // Inicializar
      // ==============================================================================================
      self.BS = { recordCount      : 0, 
                  G0               : module.clone(__summary),
                  dataSet          : __dataSet,
                  reportDefinition : __rd, 
                  mediator         : mediator };
      __groups.forEach( function(g, i){                   
        g.current = (__dataSet && __dataSet[0]) ? __dataSet[0][g.definition.key] : '';
        self.BS[g.name] = { recordCount : 0, all : {} };
      });
      if(__rd.context.onStartfn) __rd.context.onStartfn(self.BS);
      __initContentProviders();
      mediator.message({ type : 'report.render.rows' });
      mediator.message({ type : 'report.log.message', text : 'Generando informe...' });
      // ==============================================================================
      // Cabeceras del informe
      // ==============================================================================
      __reportHeaderSections();
      // ==============================================================================
      // Cabeceras iniciales
      // ==============================================================================
      if(__dataSet.length > 0) __groupsHeaders(); 
      // ==============================================================================
      // Iterar sobre los elementos
      // ==============================================================================
      __dataSet.forEach(function(r, i){ 
        // ============================================================================
        // Procesar el elemento
        // ============================================================================         
        self.BS.recordCount++;
        self.BS.isLastRow        = __dataSet.length === self.BS.recordCount;
        self.BS.isLastRowInGroup = self.BS.isLastRow;
        self.BS.percent      = (self.BS.recordCount/__dataSet.length) * 100;  
        self.BS.previous     = self.BS.data || r;
        self.BS.data         = r; 
        __groups.forEach( function(g, i){ 
          self.BS[g.name].data  = Object.create(g.data);
        }); 
        module.ReportEngine.sum(r, self.BS.G0);        
        if(__rd.context.onRowfn) __rd.context.onRowfn(self.BS);
        mediator.message({ type  : 'report.render.row', 
                           text  : self.BS.percent.toFixed(1) + ' %', 
                           value : self.BS.percent });
        // ============================================================================
        // Determinar si hay cambio en alguna de las claves de agrupación
        // ============================================================================
        if(__groups.every( function(g){ return g.test(r) })){
          __groups.forEach( function(g){ g.sum(r); });               
        }else{                                                                        
          __groups.some( function(g, i){              
            if(!g.test(r)){
              __breakIndex = i;
              // ============================================
              // Pies de grupo de los que han cambiado
              // ============================================
              __groupsFooters(__breakIndex);
              // ============================================
              // Actualizar los grupos
              // ============================================
              __groups.forEach( function(grupo, ii){         
                if(ii >= __breakIndex){
                  // ========================================
                  // Inicializar los que han cambiado
                  // ========================================
                  grupo.init(r)
                  __breakIndex = i;
                }else{
                  // ========================================
                  // Acumular valores de los que siguen igual
                  // ========================================
                  grupo.sum(r);
                }                  
              });                                                                                   
              return true;
            }                      
            return false; 
          })
          // ====================================================================
          // Notificar del evento onGroupChange
          // ====================================================================
          __groups.forEach(function(g){
            g.current = r[g.definition.key];
          });
          if(__rd.context.onGroupChangefn) __rd.context.onGroupChangefn(self.BS);          
          mediator.message({ type  : 'report.sections.group.change', 
                             value : '__groups' });
          // =======================================================
          // Cabeceras
          // =======================================================
          __groupsHeaders();                              
        }                 
        // ============================================================
        // Determinar si este es el último elemento de la agrupación 
        // ============================================================;
        if(__groups.length && !self.BS.isLastRow ){
          var __next               = __dataSet[self.BS.recordCount];          
          self.BS.isLastRowInGroup = ! __groups.every( function(g){
            var __k = g.definition.key;
            return __next[__k] === self.BS.data[__k];
          });
        }
        // ============================================================
        // Secciones de detalle
        // ============================================================
        __detailsSections()            
      });

      if(__dataSet.length > 0){ 
        self.BS.previous = self.BS.data;
        // =============================
        // Pies de grupo
        // =============================
        __groupsFooters();
      }
      // ===================================================
      // Total general
      // ===================================================
      __grandTotalSections();
      mediator.message({ type : 'report.render.end' });
      mediator.message({ type : 'report.end' });
      mediator.flush();
      console.timeEnd('Render');
    }
          
    module.ReportEngine.copy    = function(s, d){ Object.keys(d).map(function(k){ d[k] = s[k];});}                                                                                 
    module.ReportEngine.sum     = function(s, d){ Object.keys(d).map(function(k){ d[k] += s[k];});}   
    module.ReportEngine.compute = function(ds, name){ return ds.reduce( function(t, o){ return t + o[name]; }, 0.0); }
    module.ReportEngine.group   = function(a, c){
	    var ds = a;
	    var __f = function(k, t){
	      ds.distinct( function(v){ return v[k]; })	            
	        .forEach ( function(v){ c[v] = ds.reduce( function(p, c, i, a){ return (c[k]==v) ? p + c[t] : p; }, 0.0); });
        return __f;	           
	    }
	    return __f;
    }
 
  })(_module);

}(__module, 'Pol'));

export default __module.Pol;
