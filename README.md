# Leaflet.Export
Additional methods to L.map class provides export and print maps

## API
The following methods are added to the class:
  * export(exportOptions) - create a map canvas or image in a specified format;
  * downloadExport(downloadOptions) - save map image to specified file;
  * printExport(printOptions) - print map image;
  * supportedCanvasMimeTypes() - generates a list of supported images formats for canvas.

### export(exportOptions)
Method export  create a map canvas or image in a specified format.
Returned value - promise.

The conversion process consists of two stages (steps in promise chain):
  * rendering maps canvas;
  * export canvas to the specified format.

Options:
  * format:
    * image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon, image/svg+xml, image/webp - return image in specified mime format.
    * Developer can obtain list of the supported format  by using the method supportedCanvasMimeTypes()
  * caption:
    * text - header content (e.g. 'Map of Perm');
    * font - font size and style (e.g. '30px Arial');
    * fillStyle - filled color (e.g. 'blue');
    * position - position in pixels of upper left corner of header (e.g.'10,100).
  * exclude - list of items are not displayed on the map when exporting, can contain in any order next values:
    * excluded DOM-element;
    * text selector for excluded elements in DOM-format: .selectedClassOfDomElements, #elementId;
    * text selector for excluded elements in JQuery format: $(selector).
  * afterRender - function to be called after the rendering stage. The function may be additional processing the canvas or perform other actions before second stage (export canvas to image):
    * param: canvas;
    * template:
    ```javascript
    afterRender(canvas) {
      operators...;
      return canvas;
    }
    ```
  * afterExport - function to be called after export map;
    * param: dataURL;
    * template:
    ```javascript
    afterExport(dataURL) {
      operators...;
      return dataURL;
    }
    ```

### downloadExport(downloadOptions)
Method downloadExport() calls the method export() to form the map image and stores the image in the specified file.
In addition to the options of the method export(), method downloadExport() supports option fileName.
For several images download, downloadOptions must be an array.

### printExport(printOptions)
Method printExport() calls the method export() to form the map image prints the image.
Methods options consistent with the options of the method export().
For several images print, printOptions must be an array.
