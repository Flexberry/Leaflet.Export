(function(L, undefined) {
  L.Map.addInitHook(function () {
    this.whenReady(function () {
      if (this.options.exportable || this.options.printable || this.options.downloadable) {
        L.Map.mergeOptions({ preferCanvas: true });
//         this.exportTool = new L.Export(this, this.options.exportOptions);
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
      }
    });
  });

})(L);
