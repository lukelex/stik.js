(function(){
  var helpers = {},
      modules = {};

  window.stik.helper = function(as, func){
    if (!as) { throw "Stik helper needs a name"; }
    if (!func || typeof func !== "function") {
      throw "Stik helper needs a function";
    }

    modules[as] = window.stik.injectable({
      module: func,
      resolvable: true
    });
    helpers[as] = function(){
      return modules[as].resolve(modules).apply({}, arguments);
    };

    return helpers[as];
  }

  window.stik.boundary({
    as: "$h",
    from: "controller|behavior",
    to: helpers
  });
}());
