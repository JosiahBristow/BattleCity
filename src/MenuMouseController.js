function MenuMouseController(canvas, mainMenu, options) {
  this._canvas = canvas;
  this._menu = mainMenu;
  this._options = options || {};
  this._startY = this._options.startY || 270;
  this._spacing = this._options.spacing || 32;
  this._onHover = this._options.onHover || null;
  this._onClick = this._options.onClick || null;
  this._bind();
}

MenuMouseController.prototype._bind = function () {
  var self = this;
  if (!this._canvas) {
    return;
  }
  CanvasMouse.on('mousemove', function (e) {
    self._handleMove(e);
  });
  CanvasMouse.on('click', function (e) {
    self._handleClick(e);
  });
};

MenuMouseController.prototype._itemIndexFromY = function (y) {
  var count = this._menu.getItemsInfo().length;
  for (var i = 0; i < count; ++i) {
    var itemY = this._startY + this._spacing * i;
    if (y >= itemY - this._spacing / 2 && y <= itemY + this._spacing / 2) {
      return i;
    }
  }
  return -1;
};

MenuMouseController.prototype._getMouseY = function (e) {
  var rect = this._canvas.getBoundingClientRect();
  return e.clientY - rect.top;
};

MenuMouseController.prototype._handleMove = function (e) {
  var idx = this._itemIndexFromY(this._getMouseY(e));
  if (idx != -1 && idx != this._menu.getCurrentIndex()) {
    this._menu.setItem(idx);
    if (this._onHover) {
      this._onHover(idx);
    }
  }
};

MenuMouseController.prototype._handleClick = function (e) {
  var idx = this._itemIndexFromY(this._getMouseY(e));
  if (idx != -1) {
    this._menu.setItem(idx);
    if (this._onClick) {
      this._onClick(idx);
    }
    else {
      this._menu.executeCurrentItem();
    }
  }
};

// Bind mouse to a simple vertical list scene (options array with
// _current index). onHover(idx) and onClick(idx) are scene callbacks.
MenuMouseController.bindList = function (scene, startY, spacing, onHover, onClick) {
  var canvas = document.getElementById('canvas');
  if (!canvas) {
    return;
  }
  
  function indexAt(e) {
    var rect = canvas.getBoundingClientRect();
    var my = e.clientY - rect.top;
    var count = scene._options.length;
    for (var i = 0; i < count; ++i) {
      var y = startY + spacing * i;
      if (my >= y - spacing / 2 && my <= y + spacing / 2) {
        return i;
      }
    }
    return -1;
  }
  
  CanvasMouse.on('mousemove', function (e) {
    var idx = indexAt(e);
    if (idx != -1 && idx != scene._current) {
      scene._current = idx;
      if (onHover) onHover(idx);
    }
  });
  CanvasMouse.on('click', function (e) {
    var idx = indexAt(e);
    if (idx != -1) {
      scene._current = idx;
      if (onClick) onClick(idx);
    }
  });
};

// Bind mouse to a menu scene that has _mainMenu/_mainMenuView.
MenuMouseController.bindScene = function (scene) {
  var canvas = document.getElementById('canvas');
  if (!canvas) {
    return;
  }
  var view = scene._mainMenuView;
  var startY = view._startY;
  var spacing = view._spacing;

  function itemIndexAt(e) {
    var rect = canvas.getBoundingClientRect();
    var my = e.clientY - rect.top;
    var count = scene._mainMenu.getItemsInfo().length;
    for (var i = 0; i < count; ++i) {
      var y = startY + spacing * i;
      if (my >= y - spacing / 2 && my <= y + spacing / 2) {
        return i;
      }
    }
    return -1;
  }
  
  CanvasMouse.on('mousemove', function (e) {
    var idx = itemIndexAt(e);
    if (idx != -1 && idx != scene._mainMenu.getCurrentIndex()) {
      scene._mainMenu.setItem(idx);
    }
  });
  CanvasMouse.on('click', function (e) {
    var idx = itemIndexAt(e);
    if (idx != -1) {
      scene._mainMenu.setItem(idx);
      scene._mainMenu.executeCurrentItem();
    }
  });
};
