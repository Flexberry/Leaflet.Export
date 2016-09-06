(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов экпорта.
   */
  L.Export =  L.Map.extend({
    initialize: function (options) {
    },

  });

 /*
  Фабричный метод для создания базового экземпляра.
  */
    L.export = function(options) {
      return new L.Export(options);
    };

})(L);
