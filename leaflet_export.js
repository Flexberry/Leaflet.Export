(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов экпорта.
   */
  L.Export =  L.Map.extend({
    initialize: function (map, options) {
      L.Map.prototype.initialize.call(this, map, options);
    },

    export: function(options){
      options = options || {};
      var mapId = options.mapId || 'map';
      var mapElement = document.getElementById(mapId);
      var promise = html2canvas(mapElement, {
        allowTaint: true,
        logging: true,
      });
      promise.then(function(canvas) {
        var newCanvas = canvas;
      }, function(reason) {
        var newReason = reason;
      });
    }

  });

  /*
    Фабричный метод для создания базового экземпляра.
    */
  L.export = function(map, options) {
    return new L.Export(map, options);
  };

})(L);
