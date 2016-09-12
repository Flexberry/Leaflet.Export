(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов экпорта.
   */
  L.Export.Print =  L.Export.extend({
    initialize: function (map, options) {
      options = options || {};
      this.options = options;
      L.Export.prototype.initialize.call(this, map, options);
      this._map = map;
      if (!this._map.exportPrintTool) {
        this._map.exportPrintTool = this;
      }
    },

    printExport: function(options) {
      L.Util.setOptions(this, options);
      this.export(this.options).then(
        result = function(imgUrl) {
          var printWindow = window.open('', '_blank');
          if (printWindow) {
            var printDocument = printWindow.document;
            printDocument.write('<html><head><title>' + (options.caption ? options.caption : '') + '</title></head><body onload=\'window.print(); window.close();\'></body></html>');

            var img = printDocument.createElement('img');
            img.height = canvas.height;
            img.width = canvas.width;
            img.src = imgUrl;

            printDocument.body.appendChild(img);

            printDocument.close();
            printWindow.focus();
          } else {
            throw new Error('Окно печати было заблокировано браузером. Пожалуйста разрешите всплывающие окна на этой странице');
          }

        }
      );

    }

  });

  /*
    Фабричный метод для создания базового экземпляра.
    */
  L.export.print = function(map, options) {
    return new L.Export.Print(map, options);
  };

  L.Map.addInitHook(function () {
    this.whenReady(function () {
      if (this.options.printable || this.options.printOptions) {
        this.exportPrintTool = new L.Export.Print(this, this.options.printOptions);
      }
    });
  });

})(L);
