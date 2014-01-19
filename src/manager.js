(function(){
  function Manager(modules, selector){
    this.$$contexts       = [];
    this.$$behaviors      = [];
    this.$$executionUnits = {};
    this.$$modules        = modules || {};
    this.$$selector       = selector;
    this.$$boundaries     = {controller:{}, behavior:{}};
  }

  Manager.prototype.$addController = function(controller, action, executionUnit){
    if (!controller)    { throw "controller can't be empty"; }
    if (!action)        { throw "action can't be empty"; }
    if (!executionUnit) { throw "execution unit is missing"; }

    this.$storeExecutionUnit(controller, action, executionUnit);
    this.$bindExecutionUnit(controller, action, executionUnit);
  };

  Manager.prototype.$addBehavior = function(name, executionUnit){
    var behavior;

    if (this.$isBehaviorRegistered(name)) {
      throw "behavior already exist with the specified name";
    }

    behavior = this.$createBehavior(name, executionUnit);
    this.$$behaviors.push(behavior);
    this.$applyBehavior(behavior);

    return behavior;
  };

  Manager.prototype.$addBoundary = function(as, from, to){
    var boundary;

    this.$validateFrom(from);

    boundary = new window.stik.Boundary(as, to);
    this.$$boundaries[from.toLowerCase()][as] = boundary;

    return boundary;
  };

  Manager.prototype.$validateFrom = function(from){
    var loweredFrom = from.toLowerCase();

    if (loweredFrom !== "controller" && loweredFrom !== "behavior") {
      throw "Invalid 'from'. Needs to be 'controller' or 'behavior'";
    }
  };

  Manager.prototype.$isBehaviorRegistered = function(name){
    var i = this.$$behaviors.length;

    while (i--) {
      if (this.$$behaviors[i].$$name === name) {
        return true;
      }
    }

    return false;
  };

  Manager.prototype.$createBehavior = function(name, executionUnit){
    return new window.stik.Behavior(name, executionUnit);
  };

  Manager.prototype.$storeExecutionUnit = function(controller, action, executionUnit){
    this.$$executionUnits[controller] = (this.$$executionUnits[controller] || {});

    if (this.$$executionUnits[controller][action]){
      throw "Controller and Action already exist!";
    }

    this.$$executionUnits[controller][action] = executionUnit;
  };

  Manager.prototype.$storeContext = function(controller, action, template, executionUnit){
    var newContext = this.$createContext(controller, action, template, executionUnit);
    this.$$contexts.push(newContext);
    return newContext;
  };

  Manager.prototype.$createContext = function(controller, action, template, executionUnit){
    return new window.stik.Context(controller, action, template, executionUnit);
  };

  Manager.prototype.$buildContexts = function(){
    var controller,
        action,
        executionUnit,
        boundAny = false;

    if (Object.keys(this.$$executionUnits).length === 0){
      throw "no execution units available";
    }

    for (controller in this.$$executionUnits) {
      for (action in this.$$executionUnits[controller]) {
        executionUnit = this.$$executionUnits[controller][action];
        if (this.$bindExecutionUnit(controller, action, executionUnit)){
          boundAny = true;
        }
      }
    }

    return boundAny;
  };

  Manager.prototype.$bindExecutionUnit = function(controller, action, executionUnit){
    var templates, modules, i, context;

    templates = this.$findControllerTemplates(controller, action);
    modules   = this.$mergeObjs(this.$$modules, this.$$boundaries.controller);
    i         = templates.length;

    while (i--) {
      context = this.$storeContext(
        controller, action, templates[i], executionUnit
      );
      context.$load(modules, this.$$selector);
    }

    return templates.length > 0;
  };

  Manager.prototype.$applyBehavior = function(behavior){
    var templates, modules, i;

    templates = this.$findBehaviorTemplates(behavior);
    modules   = this.$mergeObjs(this.$$modules, this.$$boundaries.behavior);
    i         = templates.length;

    while (i--) {
      behavior.$load(
        templates[i],
        modules,
        this.$$selector
      );
    }

    return templates.length > 0;
  };

  Manager.prototype.$applyBehaviors = function(){
    var boundAny, i;

    boundAny = false;
    i        = this.$$behaviors.length;

    while (i--) {
      if (this.$applyBehavior(this.$$behaviors[i])) {
        boundAny = true;
      }
    }

    return boundAny;
  };

  Manager.prototype.$mergeObjs = function(obj1, obj2){
    var newObj, attr;

    newObj = {};
    for (attr in obj1) { newObj[attr] = obj1[attr]; }
    for (attr in obj2) { newObj[attr] = obj2[attr].$$to; }
    return newObj;
  };

  Manager.prototype.$findControllerTemplates = function(controller, action, DOMInjection){
    var DOMHandler = document;
    if (DOMInjection) { DOMHandler = DOMInjection; }

    var selector = "[data-controller=" + controller + "]" +
                   "[data-action=" + action + "]" +
                   ":not([class*=stik-bound])";
    return DOMHandler.querySelectorAll(selector);
  };

  Manager.prototype.$findBehaviorTemplates = function(behavior, DOMInjection){
    var DOMHandler = document;
    if (DOMInjection) { DOMHandler = DOMInjection; }

    var selector = "[class*=" + behavior.$$className + "]" +
                   ":not([data-behaviors*=" + behavior.$$name + "])";

    return DOMHandler.querySelectorAll(selector);
  };

  window.stik.Manager = Manager;
})();
