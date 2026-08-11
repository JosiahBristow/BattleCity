function CheatScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  
  this._options = [
    {key: 'invincible', name: 'INVINCIBLE'},
    {key: 'infiniteLives', name: 'INFINITE LIVES'},
    {key: 'infiniteBullets', name: 'INFINITE BULLETS'},
    {key: 'freezeEnemies', name: 'FREEZE ENEMIES'},
    {key: 'oneHitKill', name: 'ONE HIT KILL'},
    {key: 'maxPower', name: 'MAX POWER'},
    {key: 'fastSpeed', name: 'FAST SPEED'},
    {key: 'invincibleBase', name: 'INVINCIBLE BASE'},
    {key: 'redScreen', name: 'RED SCREEN'}
  ];
  this._current = 0;
  
  var self = this;
  MenuMouseController.bindList(this, 92, 36, null, function (idx) {
    self._current = idx;
    self.toggleCurrent();
  });
}

CheatScene.prototype.getCurrent = function () {
  return this._current;
};

CheatScene.prototype.setCurrent = function (index) {
  this._current = index;
  if (this._current < 0) {
    this._current = this._options.length - 1;
  }
  if (this._current >= this._options.length) {
    this._current = 0;
  }
};

CheatScene.prototype.nextOption = function () {
  this.setCurrent(this._current + 1);
};

CheatScene.prototype.prevOption = function () {
  this.setCurrent(this._current - 1);
};

CheatScene.prototype.toggleCurrent = function () {
  var option = this._options[this._current];
  Cheat[option.key] = !Cheat[option.key];
};

CheatScene.prototype.update = function () {};

CheatScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#e44437";
  ctx.fillText(Language.translate('CHEAT'), 176, 60);
  
  ctx.fillStyle = "#ffffff";
  
  for (var i = 0; i < this._options.length; ++i) {
    var y = 92 + 36 * i;
    var option = this._options[i];
    var on = Cheat[option.key];
    ctx.fillText(Language.translate(option.name), 40, y);
    ctx.fillStyle = on ? "#96d332" : "#666666";
    ctx.fillText(on ? "ON" : "OFF", 380, y);
    if (i == this._current) {
      ctx.drawImage(ImageManager.getImage('tank_player1_up_c0_t1'), 8, y - 23);
    }
    ctx.fillStyle = "#ffffff";
  }
  
  ctx.fillStyle = "#feac4e";
  ctx.fillText(Language.translate('J TO TOGGLE'), 80, 420);
  ctx.fillText(Language.translate('ESC TO GO BACK'), 80, 440);
};

CheatScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

CheatScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.DOWN || key == Keyboard.Key.S) {
    this.nextOption();
  }
  else if (key == Keyboard.Key.UP || key == Keyboard.Key.W) {
    this.prevOption();
  }
  else if (key == Keyboard.Key.START || key == Keyboard.Key.J) {
    this.toggleCurrent();
  }
  else if (key == Keyboard.Key.ESC) {
    this._sceneManager.toMoreScene();
  }
};
