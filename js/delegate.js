(function(E){
  function delegate(root, filter, eventType, fn) {
    E.on(root, eventType, function(e){
      if (e.target && filter(e.target)) {
        fn(e);
      }
    });
  }



  E.delegate = delegate;

})(EventH);