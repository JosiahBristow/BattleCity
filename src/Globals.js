Globals = {};

Globals.UNIT_SIZE = 32;
Globals.TILE_SIZE = Globals.UNIT_SIZE / 2;

Globals.CANVAS_WIDTH = Globals.UNIT_SIZE * 16;
Globals.CANVAS_HEIGHT = Globals.UNIT_SIZE * 14;

Globals.IS_TOUCH = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  || ('ontouchstart' in window && window.innerWidth < 1024);
