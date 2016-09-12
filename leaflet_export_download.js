(function(L, undefined) {
  
  L.Map.addInitHook(function () {
    this.whenReady(function () {
      if (this.options.downloadable) {
        if (!('exportError' in this)) {
          this.exportError = {};
        }
        this.exportError.emptyFilename = 'При выгрузке карты в виде файла не указано его имя'
        this.downloadExport = function(options) {
          if (!('fileName' in options)) {
            throw new Error(this.exportError.emptyFilename);
          }

          var fileName = options.fileName;
          delete options.fileName;
          this.export(options).then(
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
        };
      }
    });
  });

})(L);
