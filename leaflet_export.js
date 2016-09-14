(function(L, undefined) {
  L.Map.addInitHook(function () {
    this.whenReady(function () {
//       if (this.options.exportable || this.options.printable || this.options.downloadable) {
      L.Map.mergeOptions({ preferCanvas: true });
      if (!('exportError' in this)) {
        this.exportError = {
          wrongBeginSelector: 'Селектор JQuery не имеет начальной скобки (',
          wrongEndSelector: 'Селектор JQuery не заканчивается скобкой )',
          jqueryNotAvailable: 'В опциях используется JQuery селектор, но JQuery не подключен.Подключите JQuery или используйте DOM-селекторы .class, #id или DOM-элементы',
          popupWindowBlocked: 'Окно печати было заблокировано браузером. Пожалуйста разрешите всплывающие окна на этой странице',
          emptyFilename: 'При выгрузке карты в виде файла не указано его имя'
        };
      }

      this.export = function(options){
        var caption = {};
        var exclude = [];
        var format ='image/png';
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

        if ('format' in options) {
          format = options['format'];
        }

        var hide = [];
        for (var i = 0; i < exclude.length; i++) {
          var selector = exclude[i];
          switch (typeof selector) {
            case 'object':
              if ('tagName' in selector) {  //DOM element
                hide.push(selector);
              }
              break;
            case 'string':  //selector
              var type = selector.substr(0,1);
              switch (type) {
                case '.': //class selector
                  var elements = this._container.getElementsByClassName(selector.substr(1));
                  for (var j = 0; j < elements.length; j++) {
                    hide.push(elements.item(j));
                  }
                  break;
                case '#':   //id selector
                  var element = this._container.getElementById(selector.substr(1));
                  if (element) {
                    hide.push(element);
                  }
                  break;
                case '$': //JQuery
                  var jQuerySelector = selector.trim().substr(1);
                  if (jQuerySelector.substr(0,1) !== '(') {
                    throw new Error(this.exportError.wrongBeginSelector);
                  }
                  jQuerySelector = jQuerySelector.substr(1);
                  if (jQuerySelector.substr(-1) !== ')') {
                    throw new Error(this.exportError.wrongEndSelector);
                  }
                  jQuerySelector = jQuerySelector.substr(0, jQuerySelector.length-1);
                  if (typeof jQuery !== 'undefined') {
                    var elements = $(jQuerySelector,this._container);
                    for (var j = 0; j < elements.length; j++) {
                      hide.push(elements.item(j));
                    }
                  } else {
                    throw new Error(this.exportError.jqueryNotAvailable);
                  }

              }
          }
        }
        for (var i = 0; i < hide.length; i++) { //Hide exclude elements
          hide[i].setAttribute('data-html2canvas-ignore', 'true');
        }
        var _this = this;
        return html2canvas(this._container, {
          //         allowTaint: true,
          useCORS: true,
          logging: true,
        }).then(function(canvas) {
          for (var i = 0; i < hide.length; i++) { //Unhide exclude elements
            hide[i].setAttribute('data-html2canvas-ignore', 'false');
          }
          if ('text' in caption && caption.text) {
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
          var ret = format === 'canvas' ? canvas : { data:canvas.toDataURL(format), width: canvas.width,  height: canvas.height, type: format};
          return ret;
        }, function(reason) {
          var newReason = reason;
          alert(reason);
        });
      };
//       }
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
    });
  });

})(L);
