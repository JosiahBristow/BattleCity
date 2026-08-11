function SpriteController(eventManager, sprite, keyMap) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  this._sprite = sprite;
  this._pauseListener = new PauseListener(this._eventManager);
  this._keyMap = keyMap || {
    left: Keyboard.Key.LEFT,
    right: Keyboard.Key.RIGHT,
    up: Keyboard.Key.UP,
    down: Keyboard.Key.DOWN
  };
}

SpriteController.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED && !this._pauseListener.isPaused()) {
    this.keyPressed(event.key);
  }
  else if (event.name == Keyboard.Event.KEY_RELEASED) {
    this.keyReleased(event.key);
  }
};

SpriteController.prototype.keyPressed = function (key) {
  if (key == this._keyMap.left) {
    this._sprite.setDirection(Sprite.Direction.LEFT);
    this._sprite.toNormalSpeed();
  }
  else if (key == this._keyMap.right) {
    this._sprite.setDirection(Sprite.Direction.RIGHT);
    this._sprite.toNormalSpeed();
  }
  else if (key == this._keyMap.up) {
    this._sprite.setDirection(Sprite.Direction.UP);
    this._sprite.toNormalSpeed();
  }
  else if (key == this._keyMap.down) {
    this._sprite.setDirection(Sprite.Direction.DOWN);
    this._sprite.toNormalSpeed();
  }
};

SpriteController.prototype.keyReleased = function (key) {
  if (this._sprite.getDirection() == Sprite.Direction.LEFT && key == this._keyMap.left ||
      this._sprite.getDirection() == Sprite.Direction.RIGHT && key == this._keyMap.right ||
      this._sprite.getDirection() == Sprite.Direction.UP && key == this._keyMap.up ||
      this._sprite.getDirection() == Sprite.Direction.DOWN && key == this._keyMap.down) {
    if (this._sprite.isOnSnow()) {
      this._sprite.beginSlide();
    }
    else {
      this._sprite.stop();
    }
  }
};
