function DemoGameScene(sceneManager) {
  var self = this;
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);

  this._curtain = new Curtain();
  this._level = new Level(sceneManager, 1, undefined, 1, null, true);
  this._exit = false;

  this._script = new Script();
  this._script.enqueue({update: function () {
    self._curtain.fall();
    if (self._curtain.isFallen()) {
      self._script.actionCompleted();
    }
  }});
  this._script.enqueue({execute: function () {
    self._level.show();
  }});
  this._script.enqueue({update: function () {
    self._curtain.rise();
    if (self._curtain.isRisen()) {
      self._script.actionCompleted();
    }
  }});
  this._script.enqueue(this._level);
}

DemoGameScene.prototype.update = function () {
  if (this._exit) {
    return;
  }
  this._script.update();
};

DemoGameScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  this._level.draw(ctx);
  this._curtain.draw(ctx);
};

DemoGameScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this._exit = true;
    this._sceneManager.toMainMenuScene(true);
  }
};
