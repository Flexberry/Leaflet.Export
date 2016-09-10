(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов экпорта.
   */
  L.Export.Download =  L.Export.extend({
    initialize: function (map, options) {
      options = options || {};
      options.preferCanvas = true;
      L.Export.prototype.initialize.call(this, map, options);
    },

    printExport(options) {

    }

  });

  /*
    Фабричный метод для создания базового экземпляра.
    */
  L.export.download = function(map, options) {
    return new L.Export.Print(map, options);
  };

})(L);
