(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов экпорта.
   */
  L.Export =  L.Map.extend({
    initialize: function (map, options) {
      options = options || {};
      options.preferCanvas = true;
      L.Map.prototype.initialize.call(this, map, options);
    },

    export: function(options){
      var caption = {};
      var exclude = [];
      options = options || { caption: {}, exclude: []};
      if ('caption' in options) {
        caption = options['caption'];
        if ('position' in caption) {
          var position = caption.position;
          if (!Array.isArray(position) && position.length !=2 )
            if (position.length == 0 || typeof position[0] !== 'number'){
              caption.position[0] = 0;
            }

            if (position.length == 1 || typeof position[1] !== 'number') {
              caption.position[1] = 0;
            }
        }
      }

      if ('exclude' in options && Array.isArray(options['exclude'])) {
        exclude = options['exclude'];
      }

      var mapElement = this._container;
      var _this = this;
      var promise = html2canvas(mapElement, {
        allowTaint: true,
        useCORS: true,
        logging: true,
      }).then(function(canvas) {
        if ('text' in caption) {
          var x, y;
          if ('position' in caption) {
            x = caption.position[0];
            y = caption.position[1];
          } else {
            x = 0;
            y = 0;
          }
          var ctx = canvas.getContext('2d');
          if ('font' in caption) {
            ctx.font = caption.font;
          }
          if ('fillStyle' in caption) {
            ctx.fillStyle = caption.fillStyle;
          }
          ctx.fillText(caption.text,x , y);
        }

        document.body.appendChild(canvas);
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
