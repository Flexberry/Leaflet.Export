# Leaflet.Export
Additional methods to L.map class provides export and print maps

## API
The following methods are added to the class:
  * export(exportOptions) - create a map canvas or image in a specified format;
  * exportDownload(downloadOptions) - save map image to specified file;
  * exportPrint(printOptions) - print map image;
  * supportedCanvasMimeTypes() - generates a list of supported data browser images formats for canvas.

### export(exportOptions)
Method export  create a map canvas or image in a specified format.
Options:
  * format:
    * canvas - return canvas, contained rendered map;
    * image/png, image/jpeg, image/jpg, image/gif, image/bmp, image/tiff, image/x-icon, image/svg+xml, image/webp - return image in specified mime format.
  
