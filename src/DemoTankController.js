function DemoTankController(tank, random) {
  this._eventManager = tank.getEventManager();
  SpriteController.call(this, this._eventManager, tank);
  this._random = random || new Random();
  this._pauseListener = new PauseListener(this._eventManager);

  this._directionTimer = 0;
  this._directionInterval = 30;

  this._shootTimer = 0;
  this._shootInterval = 20;

  this._tank = tank;
  this._tank.toNormalSpeed();
}

DemoTankController.subclass(SpriteController);

DemoTankController.prototype.update = function () {
  if (this._pauseListener.isPaused()) {
    return;
  }
  this._tank.toNormalSpeed();
  this.updateDirection();
  this.updateShoot();
};

DemoTankController.prototype.updateDirection = function () {
  this._directionTimer++;
  if (this._directionTimer >= this._directionInterval) {
    this._directionTimer = 0;
    if (this._random.getNumber() < 0.5) {
      var dirs = [
        Sprite.Direction.DOWN,
        Sprite.Direction.DOWN,
        Sprite.Direction.LEFT,
        Sprite.Direction.RIGHT,
        Sprite.Direction.UP
      ];
      var dir = dirs[Math.floor(this._random.getNumber() * dirs.length)];
      this._tank.setDirection(dir);
    }
  }
};

DemoTankController.prototype.updateShoot = function () {
  this._shootTimer++;
  if (this._shootTimer >= this._shootInterval) {
    this._shootTimer = 0;
    if (this._random.getNumber() < 0.5) {
      this._tank.shoot();
    }
  }
};

DemoTankController.prototype.notify = function (event) {
  // Do not respond to keyboard events
};

DemoTankController.prototype.destroy = function () {
  this._pauseListener.destroy();
  this._eventManager.removeSubscriber(this);
};
