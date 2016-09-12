(function(L, undefined) {
  L.Map.addInitHook(function () {
    this.whenReady(function () {
      if (this.options.printable) {
        if (!('exportError' in this)) {
          this.exportError = {};
        }
        this.exportError.popupWindowBlocked = 'Окно печати было заблокировано браузером. Пожалуйста разрешите всплывающие окна на этой странице';
        this.printExport = function(options) {
          var _this = this;
          this.export(options).then(
            function(result) {
              var printWindow = window.open('', '_blank');
              if (printWindow) {
                var printDocument = printWindow.document;
                printDocument.write('<html><head><title>' + (options.text ? options.text : '') + '</title></head><body onload=\'window.print(); window.close();\'></body></html>');

                var img = printDocument.createElement('img');
                img.height = result.height;
                img.width = result.width;
                img.src = result.data;

                printDocument.body.appendChild(img);

                printDocument.close();
                printWindow.focus();
              } else {
                throw new Error(_this.exportError.popupWindowBlocked);
              }

            }
          );
        };
      }
    });
  });

})(L);
