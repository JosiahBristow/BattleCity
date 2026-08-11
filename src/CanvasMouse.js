var CanvasMouse = {};

CanvasMouse._handlers = [];

// Bind an event on the canvas, tracking it so it can be removed on scene change.
CanvasMouse.on = function (type, handler) {
  var canvas = document.getElementById('canvas');
  if (!canvas) {
    return;
  }
  canvas.addEventListener(type, handler);
  CanvasMouse._handlers.push({type: type, handler: handler});
};

// Remove all canvas handlers (called when the scene changes).
CanvasMouse.clearAll = function () {
  var canvas = document.getElementById('canvas');
  if (canvas) {
    CanvasMouse._handlers.forEach(function (h) {
      canvas.removeEventListener(h.type, h.handler);
    });
  }
  CanvasMouse._handlers = [];
};
