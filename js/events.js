(function(){

  var E = {};
  E.on = addEvent;
  E.un = removeEvent;
  E.ready = domReady;

  window['EventH'] = E;

  if (!Date.now) {
    Date.now = function now() {
      return new Date().getTime();
    };
  }

  // written by Dean Edwards, 2005
  // with input from Tino Zijdel, Matthias Miller, Diego Perini

  // http://dean.edwards.name/weblog/2005/10/add-event/

  function addEvent(element, type, handler) {
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else {
      // assign each event handler a unique ID
      if (!handler.$$guid) handler.$$guid = addEvent.guid++;
      // create a hash table of event types for the element
      if (!element.events) element.events = {};
      // create a hash table of event handlers for each element/event pair
      var handlers = element.events[type];
      if (!handlers) {
        handlers = element.events[type] = {};
        // store the existing event handler (if there is one)
        if (element["on" + type]) {
          handlers[0] = element["on" + type];
        }
      }
      // store the event handler in the hash table
      handlers[handler.$$guid] = handler;
      // assign a global event handler to do all the work
      element["on" + type] = handleEvent;
    }
  };
  // a counter used to create unique IDs
  addEvent.guid = 1;

  function removeEvent(element, type, handler) {
    if (element.removeEventListener) {
      element.removeEventListener(type, handler, false);
    } else {
      // delete the event handler from the hash table
      if (element.events && element.events[type]) {
        delete element.events[type][handler.$$guid];
      }
    }
  };

  function handleEvent(event) {
    var returnValue = true;

    event = event || window.event;
    event = fixEvent(event);

    // get a reference to the hash table of event handlers
    var handlers = this.events[event.type];
    // execute each event handler
    for (var i in handlers) {
      this.$$handleEvent = handlers[i];
      if (this.$$handleEvent(event) === false) {
        returnValue = false;
      }
    }
    return returnValue;
  };

  function fixEvent(event) {

    if ( event[ fixEvent.expando ] ) {
      return event;
    }

    var originalEvent = event;
    event =
    {
        originalEvent: originalEvent
    };

    var props = "altKey attrChange attrName bubbles button cancelable charCode clientX clientY ctrlKey currentTarget data detail eventPhase fromElement handler keyCode metaKey newValue originalTarget pageX pageY prevValue relatedNode relatedTarget screenX screenY shiftKey srcElement target timeStamp toElement type view wheelDelta which".split(" ");
    for (var i = props.length; i; i--) {
      event[props[i]] = originalEvent[props[i]];
    }

    event[ fixEvent.expando ] = true;

    // add preventDefault and stopPropagation since
    // they will not work on the clone
    event.preventDefault = function()
    {
        // if preventDefault exists run it on the original event
        if (originalEvent.preventDefault)
            originalEvent.preventDefault();
        // otherwise set the returnValue property of the original event to false (IE)
        originalEvent.returnValue = false;
    };
    event.stopPropagation = function()
    {
        // if stopPropagation exists run it on the original event
        if (originalEvent.stopPropagation)
            originalEvent.stopPropagation();
        // otherwise set the cancelBubble property of the original event to true (IE)
        originalEvent.cancelBubble = true;
    };

    // Fix timeStamp
    event.timeStamp = event.timeStamp || Date.now();

    // Fix target property, if necessary
    if (!event.target)
        event.target = event.srcElement || document; // Fixes #1925 where srcElement might not be defined either
    // check if target is a textnode (safari)
    if (event.target.nodeType == 3)
        event.target = event.target.parentNode;

    // Add relatedTarget, if necessary
    if (!event.relatedTarget && event.fromElement)
        event.relatedTarget = event.fromElement == event.target ? event.toElement : event.fromElement;

    // Calculate pageX/Y if missing and clientX/Y available
    if (event.pageX == null && event.clientX != null)
    {
        var doc = document.documentElement, body = document.body;
        event.pageX = event.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
        event.pageY = event.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }

    // Add which for key events
    if (!event.which && ((event.charCode || event.charCode === 0) ? event.charCode : event.keyCode))
        event.which = event.charCode || event.keyCode;

    // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
    if (!event.metaKey && event.ctrlKey)
        event.metaKey = event.ctrlKey;

    // Add which for click: 1 == left; 2 == middle; 3 == right
    // Note: button is not normalized, so don't use it
    if (!event.which && event.button)
        event.which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));

    return event;
  };

  fixEvent.expando = Date.now();



 // DOM ready 时间处理
  function domReady(fn) {
    fn = fn || function(){};
    var init = function(){
       // quit if this function has already been called
       if (arguments.callee.done) return;

       // flag this function so we don't do the same thing twice
       arguments.callee.done = true;
       fn.apply(document, arguments);
    }

   /* for Mozilla */
   if (document.addEventListener) {
       document.addEventListener("DOMContentLoaded", init, false);
   }
    //但对于Safari，我们需要使用setInterval方法不断检测document.readyState
    //当为loaded或complete的时候表明DOM已经加载完毕
    if (/WebKit/i.test(navigator.userAgent)) {
        var _timer = setInterval(function() {
            if (/loaded|complete/.test(document.readyState)) {
                clearInterval(_timer);
                init();
            }
        },10);
    }
    //对于IE则使用条件注释，并使用script标签的defer属性
    //IE中可以给script标签添加一个defer(延迟)属性，这样，标签中的脚本只有当DOM加载完毕后才执行
    /*@cc_on @*/
    /*@if (@_win32)
    document.write("<script id=\"__ie_onload\" defer=\"defer\" src=\"javascript:void(0)\"><\/script>");
    var script = document.getElementById("__ie_onload");
    script.onreadystatechange = function() {
        if (this.readyState == "complete") {
            init();
        }
    };
    /*@end @*/
    return true;
  }
}());
