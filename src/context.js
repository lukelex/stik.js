(function(){
  function Context(controller, action, template){
    this.$$controller = controller;
    this.$$action     = action;

    this.$$template = window.stik.injectable({
      module: template
    });
  }

  Context.method("$load", function(executionUnit, modules){
    var dependencies = this.$resolveDependencies(
      executionUnit,
      this.$mergeModules(modules)
    );

    executionUnit.apply(this, dependencies);
    this.$markAsBound();
  });

  Context.method("$resolveDependencies", function(executionUnit, modules){
    var injector = new window.stik.Injector(
      executionUnit, modules
    );

    return injector.$resolveDependencies();
  });

  Context.method("$mergeModules", function(modules){
    modules.$context  = this;
    modules.$template = this.$$template;

    return modules;
  });

  Context.method("$markAsBound", function(){
    var template = this.$$template.resolve();
    template.className = (template.className + ' stik-bound').trim();
  });

  window.stik.Context = Context;
})();
