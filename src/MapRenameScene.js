function MapRenameScene(sceneManager, index) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  this._index = index;
  
  var map = MapStorage.getMap(index);
  this._name = '';
  this._chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -';
  this._maxLength = 16;
}

MapRenameScene.prototype.getName = function () {
  return this._name;
};

MapRenameScene.prototype.update = function () {};

MapRenameScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#ffffff";
  EditorFont.draw(ctx, 'RENAME MAP', 16, 40, 2, "#ffffff");
  var cur = MapStorage.getMap(this._index);
  EditorFont.draw(ctx, 'old: ' + (cur ? cur.name : ''), 16, 80, 1, "#888");
  EditorFont.draw(ctx, 'name:', 16, 110, 2, "#ccc");
  EditorFont.draw(ctx, this._name, 16, 140, 2, "#feac4e");
  
  ctx.fillStyle = "orange";
  ctx.fillRect(16 + this._name.length * 16, 134, 2, 22);
  
  EditorFont.draw(ctx, 'backspace: delete   A-Z 0-9 type', 16, 200, 1, "#888");
  EditorFont.draw(ctx, 'enter: save   esc: cancel', 16, 220, 1, "#888");
};

MapRenameScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

MapRenameScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.START || key == Keyboard.Key.J) {
    var finalName = this._name || ('CUSTOM ' + (this._index + 1));
    MapStorage.rename(this._index, finalName);
    this._sceneManager.toMapManageScene();
  }
  else if (key == Keyboard.Key.ESC) {
    this._sceneManager.toMapManageScene();
  }
  else if (key == 8) { // backspace
    this._name = this._name.slice(0, this._name.length - 1);
  }
  else {
    var ch = String.fromCharCode(key).toUpperCase();
    if (this._chars.indexOf(ch) != -1 && this._name.length < this._maxLength) {
      this._name += ch;
    }
  }
};
