function MainMenuView(mainMenu, cursorView, startY, spacing) {
  this._menu = mainMenu;
  this._cursorView = cursorView;
  this._startY = startY === undefined ? 270 : startY;
  this._spacing = spacing === undefined ? 32 : spacing;
}

MainMenuView.prototype.draw = function (ctx, baseY) {
  var items = this._menu.getItemsInfo();
  for (var i = 0; i < items.length; ++i) {
    var y = baseY + this._startY + this._spacing * i;
    if (items[i].isCurrent) {
      ctx.fillStyle = "#96d332";
      ctx.fillRect(140, y - 19, 240, 20);
      ctx.fillStyle = "#000000";
    }
    else {
      ctx.fillStyle = "#ffffff";
    }
    ctx.fillText(items[i].name, 178, y);
    if (items[i].isCurrent) {
      this._cursorView.draw(ctx, 128, y - 23);
    }
  }
};

// Convert a mouse event to the item index under the pointer, or -1.
MainMenuView.prototype.getItemIndexAt = function (event, baseY) {
  var canvas = event.target || document.getElementById('canvas');
  var rect = canvas.getBoundingClientRect();
  var my = event.clientY - rect.top;
  var by = (baseY || 0) + this._startY;
  var count = this._menu.getItemsInfo().length;
  for (var i = 0; i < count; ++i) {
    var y = by + this._spacing * i;
    if (my >= y - this._spacing / 2 && my <= y + this._spacing / 2) {
      return i;
    }
  }
  return -1;
};
