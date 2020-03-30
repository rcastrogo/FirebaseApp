
let topics = {};
let subUid = -1;

let subscribe = function(topic, func) {
  if (!topics[topic]) {
    topics[topic] = [];
  }
  var token = (++subUid).toString();
  topics[topic].push({
    token: token,
    func: func
  });
  return token;
};

let publish = function(topic, args) {
  if (!topics[topic]) {
      return false;
  }
  setTimeout(function() {
    var subscribers = topics[topic];
    var len = subscribers ? subscribers.length : 0;

    while (len--) {
      subscribers[len].func(topic, args);
    }
  }, 0);
  return true;
};

let unsubscribe = function(token) {
  for (var m in topics) {
    if (topics[m]) {
      for (var i = 0, j = topics[m].length; i < j; i++) {
        if (topics[m][i].token === token) {
          topics[m].splice(i, 1);
          return token;
        }
      }
    }
  }
  return false;
};

export default {
  subscribe,
  publish,
  unsubscribe,
  TOPICS : { 
    VIEW_CHANGE      : 'view:change',
    VALUE_CHANGE     : 'value:change',
    MUNICIPIO_CHANGE : 'municipio:change',
    WINDOW_SCROLL    : 'window.scroll',
    WINDOW_RESIZE    : 'window.resize',
    NOTIFICATION     : 'notification.show'
  }
}