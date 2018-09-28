@import 'SketchPluginsLab.framework/SketchPluginsLab.js'
const sketch = require('sketch');
const UI = require('sketch/ui');

var sayHello = function(context) {

  var main = SPLMain.alloc().init();
  var document = sketch.fromNative(context.document);
  var page = document.selectedPage;
  var layer = new sketch.Text({
    parent: page,
    alignment: sketch.Text.Alignment.center,
    text: [main sayHello],
  });
  layer.adjustToFit();
  document.centerOnLayer(layer);

};

var sayHi = function(context) {

  var main = SPLMain.alloc().init();
  var document = sketch.fromNative(context.document);
  var page = document.selectedPage;
  var layer = new sketch.Text({
    parent: page,
    alignment: sketch.Text.Alignment.center,
    text: main.sayHi(),
  });
  layer.adjustToFit();
  document.centerOnLayer(layer);

};
