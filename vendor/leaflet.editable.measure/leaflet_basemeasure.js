(function(L, undefined) {
  L.Measure = L.Measure || {};

  L.MeasureBase =   L.Measure.extend({
    initialize: function (map, options) {
      L.Measure.prototype.initialize.call(this, map, options);
      this.markerBaseTool = L.Measure.markerBase(map, options);
      this.circleBaseTool = L.Measure.circleBase(map, options);
      this.rectangleBaseTool = L.Measure.rectangleBase(map, options);
      this.polylineBaseTool = L.Measure.polylineBase(map, options);
      this.polygonBaseTool =  L.Measure.polygonBase(map, options);
    },
  });

   /*
  Фабричный метод для создания базового экземпляра.
  */
  L.measureBase = function(map, options) {
    return new L.MeasureBase(map, options);
  };

  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.MarkerBase = L.Measure.Marker.extend({

    basePopupText: {
      northLatitude: ' с.ш. ',
      southLatitude: ' ю.ш. ',
      eastLongitude: ' в.д. ',
      westLongitude: ' з.д. '
    },

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor, e) {
      return [];
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor, e) {
      return [];
    },

    /**
     Метод для получения текстового описания результатов измерений.
     */
    _getLabelContent: function(layer, latlng, e) {
      latlng = latlng || layer.getLatLng();
      var fixedLatLng = this.getFixedLatLng(latlng);
      var fixedLat = fixedLatLng.lat;
      var fixedLng = fixedLatLng.lng;
      return Math.abs(fixedLat).toFixed(5) + (fixedLat >= 0 ? this.basePopupText.northLatitude : this.basePopupText.southLatitude)
      + Math.abs(fixedLng).toFixed(5) + (fixedLng >= 0 ? this.basePopupText.eastLongitude : this.basePopupText.westLongitude);
    },

    /**
     Метод обновления основного лейбла измеряемого объекта
     @param {Object} layer Редактируемый слой.
     */
    _updateMeasureLabel: function(layer, e) {
      if (this._getMeasureEventType(e).substr(-5) !== ':drag') {
        var coords = this._getLabelContent(layer, e.latlng, e);
        text = "<b>" + coords + '</b>';
        this._showLabel(layer, text);
      }
    },

  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.markerBase = function(map, options) {
    return new L.Measure.MarkerBase(map, options);
  };


  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.CircleBase = L.Measure.Circle.extend({

    basePopupText: {
      labelPrefix: '<b>Радиус: ',
      labelPostfix: '</b>',
    },
    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      switch (this._getMeasureEventType(e)) {
        case 'measure:create:drag': case 'measure:edit:drag':
          break;
        default:
          markers.push(latlngs[1].__vertex)
      }
      return markers;
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      markers.push(latlngs[0].__vertex)
      switch (this._getMeasureEventType(e)) {
        case 'measure:create:drag': case 'measure:edit:drag':
          markers.push(latlngs[1].__vertex)
          break;
      }
      return markers;
    },


    /**
     Метод для получения текстового описания результатов измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
     */
    _getLabelContent: function(layer, latlng, e) {
//       var radius = layer.getRadius();
      var  radiusText = this.getRadiusText(layer);
      var ret = radiusText.length > 0 ? this.basePopupText.labelPrefix + radiusText + this.basePopupText.labelPostfix : '';
      return ret;
    },

  });

  /**
   *   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.circleBase = function(map, options) {
    return new L.Measure.CircleBase(map, options);
  };

  /**
   *   Класс инструмента для измерения координат.
   */
  L.Measure.RectangleBase = L.Measure.Rectangle.extend({

    /*
     *     Метод для получения маркеров инструмента редактирования, имеющих метки
     *     @param {Object} editor Инструмент редактирования
     *     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      return markers;
    },

    /*
     *     Метод для получения маркеров инструмента редактирования, не имеющих меток
     *     @param {Object} editor Инструмент редактирования
     *     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      for(var i = 0, len = latlngs.length; i < len; i++) {
        markers.push(latlngs[i].__vertex);
      }
      return markers;
    },

    /**
     *     Метод для получения текстового описания результатов измерений.
     *     @param {Object} e Аргументы метода.
     *     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     *     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
     */
    _getLabelContent: function(layer, latlng) {
      return '';
    },

    /**
     *    Метод обновления основного лейбла измеряемого объекта
     *    @param {Object} layer Редактируемый слой.
     */
    _updateMeasureLabel: function(layer, e) {
      var center = layer.getCenter();
      //       var latlngs = layer.editor.getLatLngs()[0];
      var areaText = 'Площадь: ' + this.getAreaText(layer);
      areaText = '<b>' + areaText + '</b>';
      this._showLabel(layer, areaText, center);
    },

  });

  /**
   *   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.rectangleBase = function(map, options) {
    return new L.Measure.RectangleBase(map, options);
  };


  /**
   * Класс инструмента для измерения координат.
   */
  L.Measure.PolylineBase = L.Measure.Polyline.extend({

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      var marker;
      switch (this._getMeasureEventType(e)) {
        case 'measure:create:drag': case 'measure:edit:drag':
          marker = e.vertex;
          break;
      }
      for(var i = 1, len = latlngs.length; i < len; i++) {
        var pathVertex = latlngs[i].__vertex;
        if (pathVertex !== marker) {
          markers.push(pathVertex);
        }
      }
      return markers;
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs();
      var markers = [];
      markers.push(latlngs[0].__vertex);
      switch (this._getMeasureEventType(e)) {
        case 'measure:create:drag': case 'measure:edit:drag':
          if (e.vertex) {
            markers.push(e.vertex);
          }
          break;
      }
      return markers;
    },

    /**
     Метод для получения текстового описания результатов измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
     */
    _getLabelContent: function(layer, latlng, e) {
      var latlngs = layer.editor.getLatLngs().slice();
      for (var index=0; index < latlngs.length && !latlngs[index].equals(latlng); index++);
      if (index === latlngs.length) {
        latlngs.push(latlng);
      }
      if (index === 0) return '';
      var distance = 0;
      var currentInc = 0;
      for(var i = 1; i <= index; i++) {
        var prevLatLng = latlngs[i - 1];
        var currentLatLng = latlngs[i];
        currentInc = this.getDistance({
          latlng1: prevLatLng,
          latlng2: currentLatLng
        });
        distance += currentInc;
      }

      //       'index='+ index + '<br>' +
      return '<b>' +
        this.getMeasureText({
          value: distance,
          dimension: 1
        }) +
      '<br><span class="measure-path-label-incdistance">+' +
      this.getMeasureText({
        value: currentInc,
        dimension: 1
      }) +
      '</span></b>';
    },

  });

  /**
   *   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polylineBase = function(map, options) {
    return new L.Measure.PolylineBase(map, options);
  };

  /**
   Класс инструмента для измерения координат.
   */
  L.Measure.PolygonBase = L.Measure.Polygon.extend({

    basePopupText: {
      labelPrefix: '<b>Площадь: ',
      labelPostfix: '</b>',
    },

    /*
     Метод для получения маркеров инструмента редактирования, имеющих метки
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив помеченных маркеров инструмента редактирования.
     */
    _labelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      var marker;
      switch (this._getMeasureEventType(e)) {
        case 'measure:create:drag': case 'measure:edit:drag':
          break;
        case 'measure:created':
          marker = latlngs[latlngs.length-1].__vertex;
          break;
        default:
          marker = e.vertex ? e.vertex : latlngs[latlngs.length-1].__vertex;
      }
      if (marker) {
        markers.push(marker);
      }
      return markers;
    },

    /*
     Метод для получения маркеров инструмента редактирования, не имеющих меток
     @param {Object} editor Инструмент редактирования
     @returns {Object[]} Массив не помеченных маркеров инструмента редактирования.
     */
    _unlabelledMarkers: function(editor, e) {
      var latlngs = editor.getLatLngs()[0];
      var markers = [];
      var marker;
      switch (this._getMeasureEventType(e)) {
        case 'measure:create:drag': case 'measure:edit:drag':
          break;
        case 'measure:created':
          marker = latlngs[latlngs.length-1].__vertex;
          break;
        default:
          marker = e.vertex ? e.vertex : latlngs[latlngs.length-1].__vertex;
      }
      for(var i = 0, len = latlngs.length; i < len; i++) {
        var pathVertex = latlngs[i].__vertex;
        if (pathVertex !== marker) {
          markers.push(pathVertex);
        }
      }
      return markers;
    },

    /**
     Метод для получения текстового описания результатов измерений.
     @param {Object} e Аргументы метода.
     @param {Object} e.layer Слой с геометрией, представляющей производимые измерения.
     @param {Object} e.latlng Точка геометрии, для которой требуется получить текстовое описание измерений.
     @returns {String} Содержимое метки
     */
    _getLabelContent: function(layer, latlng, e) {
      var latlngs = layer.editor.getLatLngs()[0].slice();
      var mouseLatlng;
      if (e && !e.vertex) {  //Non drag
        eventLatlng = e.latlng;
        for (var index=0; index < latlngs.length && !latlngs[index].equals(eventLatlng); index++);
        if (index === latlngs.length) {
          mouseLatlng = eventLatlng;
        }
      }
      var ret = this.basePopupText.labelPrefix + this.getAreaText(layer, mouseLatlng) +this.basePopupText.labelPostfix;
      return ret;
    },


  });

  /**
   Фабричный метод для создания экземпляра инструмента измерения координат.
   */
  L.Measure.polygonBase = function(map, options) {
    return new L.Measure.PolygonBase(map, options);
  };



})(L);
