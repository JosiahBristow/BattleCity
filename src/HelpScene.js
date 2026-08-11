function HelpScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
}

HelpScene.prototype.update = function () {};

HelpScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#e44437";
  ctx.fillText(Language.translate('CONTROLS'), 176, 60);
  
  ctx.fillStyle = "#ffffff";
  
  var rows = [
    ['ARROWS / WASD', 'MOVE'],
    ['J / /', 'FIRE'],
    ['ENTER', 'SELECT'],
    ['P', 'PAUSE'],
    ['ESC', 'EXIT'],
    ['M', 'MUTE'],
    ['P1: WASD + J', ''],
    ['P2: ARROWS + /', ''],
    ['F: FULLSCREEN', ''],
    ['L: LANGUAGE', ''],
    ['S: SAVE MAP', '']
  ];
  
  for (var i = 0; i < rows.length; ++i) {
    var y = 120 + 40 * i;
    ctx.fillText(Language.translate(rows[i][0]), 120, y);
    if (rows[i][1]) {
      ctx.fillStyle = "#feac4e";
      ctx.fillText(Language.translate(rows[i][1]), 320, y);
      ctx.fillStyle = "#ffffff";
    }
  }
  
  ctx.fillStyle = "#feac4e";
  ctx.fillText(Language.translate('PRESS ENTER TO GO BACK'), 120, 420);
};

HelpScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

HelpScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.START || key == Keyboard.Key.ESC) {
    this._sceneManager.toMoreScene();
  }
};
