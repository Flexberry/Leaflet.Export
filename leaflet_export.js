(function (L, undefined) {
  L.Map.addInitHook(function () {
    this.whenReady(function () {
      L.Map.mergeOptions({
        preferCanvas: true
      });
      if (!('exportError' in this)) {
        this.exportError = {
          wrongBeginSelector: 'The jQuery selector does not have an initial bracket (.',
          wrongEndSelector: 'The jQuery selector does not end with a bracket ).',
          jqueryNotAvailable: 'The options use jQuery selector, but jQuery is not connected. Connect jQuery or use DOM selectors .class, #id or DOM elements.',
          popupWindowBlocked: 'The print window was blocked by the browser. Please allow pop-ups on this page.',
          emptyFilename: 'When downloading the map as a file, its name was not specified.'
        };
      }

      this.supportedCanvasMimeTypes = function () {
        if ('_supportedCanvasMimeTypes' in this) {
          return this._supportedCanvasMimeTypes;
        }

        var mimeTypes = {
          PNG: 'image/png',
          JPEG: 'image/jpeg',
          JPG: 'image/jpg',
          GIF: 'image/gif',
          BMP: 'image/bmp',
          TIFF: 'image/tiff',
          XICON: 'image/x-icon',
          SVG: 'image/svg+xml',
          WEBP: 'image/webp'
        };

        var canvas = document.createElement('canvas');
        canvas.style.display = 'none';
        canvas = document.body.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.fillRect(0, 0, 1, 1);
        this._supportedCanvasMimeTypes = {};

        for (var type in mimeTypes) {
          var mimeType = mimeTypes[type];
          var data = canvas.toDataURL(mimeType);
          var actualType = data.replace(/^data:([^;]*).*/, '$1');
          if (mimeType === actualType) {
            this._supportedCanvasMimeTypes[type] = mimeType;
          }
        }

        document.body.removeChild(canvas);

        return this._supportedCanvasMimeTypes;
      };

      this.export = function (options) {
        var caption = {};
        var exclude = [];
        var format = 'image/png';
        options = options || {
          caption: {},
          exclude: []
        };

        if ('caption' in options) {
          caption = options['caption'];
          if ('position' in caption) {
            var position = caption.position;
            if (!Array.isArray(position)) {
              position = [0, 0];
            }

            if (position.length != 2) {
              if (position.length === 0) {
                position[0] = 0;
              }

              if (position.length === 1) {
                position[1] = 0;
              }
            }
            if (typeof position[0] !== 'number') {
              if (typeof position[0] === 'string') {
                position[0] = parseInt(position[0]);
                if (isNaN(position[0])) {
                  position[0] = 0;
                }
              }
            }
            if (typeof position[1] !== 'number') {
              if (typeof position[1] === 'string') {
                position[1] = parseInt(position[1]);
                if (isNaN(position[1])) {
                  position[1] = 0;
                }
              }
            }

            caption.position = position;
          }
        }

        if ('exclude' in options && Array.isArray(options['exclude'])) {
          exclude = options['exclude'];
        }

        if ('format' in options) {
          format = options['format'];
        }

        var afterRender = options.afterRender;
        if (typeof afterRender !== 'function') {
          afterRender = function (result) {
            return result
          };
        }

        var afterExport = options.afterExport;
        if (typeof afterExport !== 'function') {
          afterExport = function (result) {
            return result
          };
        }

        var container = options.container || this._container;

        var hide = [];
        for (var i = 0; i < exclude.length; i++) {
          var selector = exclude[i];
          switch (typeof selector) {
            // DOM element.
            case 'object':
              if ('tagName' in selector) {
                hide.push(selector);
              }
              break;
            // Selector
            case 'string':
              var type = selector.substr(0, 1);
              switch (type) {
                // Class selector.
                case '.':
                  var elements = container.getElementsByClassName(selector.substr(1));
                  for (var j = 0; j < elements.length; j++) {
                    hide.push(elements.item(j));
                  }
                  break;

                // Id selector.
                case '#':
                  var element = container.getElementById(selector.substr(1));
                  if (element) {
                    hide.push(element);
                  }
                  break;

                // JQuery.
                case '$':
                  var jQuerySelector = selector.trim().substr(1);
                  if (jQuerySelector.substr(0, 1) !== '(') {
                    throw new Error(this.exportError.wrongBeginSelector);
                  }
                  jQuerySelector = jQuerySelector.substr(1);
                  if (jQuerySelector.substr(-1) !== ')') {
                    throw new Error(this.exportError.wrongEndSelector);
                  }
                  jQuerySelector = jQuerySelector.substr(0, jQuerySelector.length - 1);
                  if (typeof jQuery !== 'undefined') {
                    var elements = $(jQuerySelector, container);
                    for (var j = 0; j < elements.length; j++) {
                      hide.push(elements[i]);
                    }
                  } else {
                    throw new Error(this.exportError.jqueryNotAvailable);
                  }
              }
          }
        }

        // Hide excluded elements.
        for (var i = 0; i < hide.length; i++) {
          hide[i].setAttribute('data-html2canvas-ignore', 'true');
        }

        var _this = this;

        return html2canvas(container, {
          logging: options['logging'] || false,
          useCORS: true
        }).then(afterRender).then(
          function (canvas) {
            // Show excluded elements.
            for (var i = 0; i < hide.length; i++) {
              hide[i].removeAttribute('data-html2canvas-ignore');
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

              ctx.fillText(caption.text, x, y);
            }

            var ret = format === 'canvas' ? canvas : {
              data: canvas.toDataURL(format),
              width: canvas.width,
              height: canvas.height,
              type: format
            };

            return ret;
          },

          function (reason) {
            var newReason = reason;
            alert(reason);
          }).then(afterExport);
      };

      this.printExport = function (options) {
        options = options || {};
        var _this = this;
        var images = [];

        var _runPrintTasks = function (options, index) {
          var exportMethod = options[index].export || _this.export;
          return exportMethod(options[index]).then(
            function (result) {
              images.push(result);
              if (index < options.length - 1) {
                return _runPrintTasks(options, index + 1);
              }

              return images;
            }
          );
        };

        if (Array.isArray(options)) {
          return _runPrintTasks(options, 0).then(
            function(result) {
              return _this._printExport(options, result);
            }
          );
        }

        var exportMethod = options.export || this.export;
        return exportMethod(options).then(
          function (result) {
            return _this._printExport(options, [result]);
          }
        );
      };

      this._printExport = function (options, images) {
        var printWindow = window.open('', '_blank');
        if (printWindow) {
          var printDocument = printWindow.document;
          printDocument.write('<html><head><style>@media print { @page { padding: 0; margin: 0; } }</style><title>' +
           (options.text ? options.text : '') + '</title></head><body onload=\'window.print(); window.close();\'></body></html>');
          images.forEach(function(image) {
            var img = printDocument.createElement('img');
            img.height = image.height - 20;
            img.width = image.width - 10;
            img.src = image.data;
            printDocument.body.appendChild(img);
          });

          printDocument.close();
          printWindow.focus();
        } else {
          throw new Error(this.exportError.popupWindowBlocked);
        }

        return images;
      };

      this.downloadExport = function (options) {
        options = options || {};

        if (Array.isArray(options)) {
          return this._runDownloadTasks(options, 0);
        } else {
          return this._downloadExport(options);
        }
      };

      this._runDownloadTasks = function(options, index) {
        var _this = this;
        var i = index;

        return this._downloadExport(options[i]).then(function(result) {
          i++;

          if (i < options.length) {
            return _this._runDownloadTasks(options, i).then(function(tasksResult) {
              return [result].concat(tasksResult);
            });
          } else {
            return [result];
          }
        });
      }

      this._downloadExport = function(options) {
        if (!('fileName' in options)) {
          throw new Error(this.exportError.emptyFilename);
        }

        var exportMethod = options.export || this.export;
        var fileName = options.fileName;
        delete options.fileName;

        var _this = this;
        return exportMethod(options).then(
          function (result) {
            var fileData = atob(result.data.split(',')[1]);
            var arrayBuffer = new ArrayBuffer(fileData.length);
            var view = new Uint8Array(arrayBuffer);
            for (var i = 0; i < fileData.length; i++) {
              view[i] = fileData.charCodeAt(i) & 0xff;
            }

            var blob;
            if (typeof Blob === 'function') {
              blob = new Blob([arrayBuffer], {
                type: 'application/octet-stream'
              });
            } else {
              var blobBuilder = new(window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder);
              blobBuilder.append(arrayBuffer);
              blob = blobBuilder.getBlob('application/octet-stream');
            }

            if (window.navigator.msSaveOrOpenBlob) {
              // IE can not open blob and data links, but has special method for downloading blobs as files.
              window.navigator.msSaveBlob(blob, fileName);
            } else {
              var blobUrl = (window.URL || window.webkitURL).createObjectURL(blob);
              var downloadLink = document.createElement('a');
              downloadLink.style = 'display: none';
              downloadLink.download = fileName;
              downloadLink.href = blobUrl;

              // IE requires link to be added into body.
              document.body.appendChild(downloadLink);

              // Emit click to download image.
              downloadLink.click();

              // Delete appended link.
              document.body.removeChild(downloadLink);
            }

            return result;
          }
        );
      }
    });
  });
})(L);
