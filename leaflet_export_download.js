(function(L, undefined) {

  /**
   * Базовое пространство имен для инструментов экпорта.
   */
  L.Export.Download =  L.Export.extend({
    errors: {
      emptyFilename: 'При выгрузке карты в виде файла не указано его имя',
    },

    initialize: function (map, options) {
      options = options || {};
      options.preferCanvas = true;
      L.Export.prototype.initialize.call(this, map, options);
    },

    downloadExport: function(options) {
      L.Util.setOptions(this, options);
      if (!('fileName' in this.options)) {
        throw new Error(this.this.errors.emptyFilename);
      }

      var fileName = this.options.fileName;
      var _this = this;
      this.export(this.options).then(
        function(result) {
          var fileData = atob(result.data.split(',')[1]);
          var arrayBuffer = new ArrayBuffer(fileData.length);
          var view = new Uint8Array(arrayBuffer);
          for (var i = 0; i < fileData.length; i++) {
            view[i] = fileData.charCodeAt(i) & 0xff;
          }

          var blob;
          if (typeof Blob === 'function') {
            blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
          } else {
            var blobBuilder = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder);
            blobBuilder.append(arrayBuffer);
            blob = blobBuilder.getBlob('application/octet-stream');
          }

          if (window.navigator.msSaveOrOpenBlob) {
            // IE не умеет открывать blob и data ссылки, но в нем есть специальный метод для скачивания blob в виде файлов.
            window.navigator.msSaveBlob(blob, fileName);
          } else {
            var blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);

            var downloadLink = document.createElement('a');
            downloadLink.style = 'display: none';
            downloadLink.download = fileName;
            downloadLink.href = blobUrl;

            // Для IE необходимо, чтобы ссылка была добавлена в тело документа.
            document.body.appendChild(downloadLink);

            // Кликаем по ссылке на скачивание изображения.
            downloadLink.click();

            // Удаляем ссылку из тела документа.
            document.body.removeChild(downloadLink);
          }

        }
      );
    }

  });

  /*
    Фабричный метод для создания базового экземпляра.
    */
  L.export.download = function(map, options) {
    return new L.Export.Download(map, options);
  };

  L.Map.addInitHook(function () {
    this.whenReady(function () {
      if (this.options.downloadable || this.options.downloadOptions) {
        this.exportDownloadTool = new L.Export.Download(this, this.options.downloadOptions);
        this.downloadExport = this.exportDownloadTool.downloadExport;
      }
    });
  });

})(L);
