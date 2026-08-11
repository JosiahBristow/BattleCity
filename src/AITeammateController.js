function AITeammateController(tank, random, spriteContainer) {
  AITankController.call(this, tank, random, spriteContainer);
  
  // hunt aggressively: shoot more often, higher probability
  this._shootInterval = 10;
  this._shootProbability = 0.9;
  
  this._directionUpdateInterval = 14;
  this._directionUpdateProbability = 0.9;
  
  this._lastShootDir = null;
}

AITeammateController.subclass(AITankController);

// Teammate hunts enemies: moves toward nearest enemy and shoots it down.
AITeammateController.prototype.updateDirection = function () {
  this._directionTimer++;
  if (this._directionTimer >= this._directionUpdateInterval) {
    this._directionTimer = 0;
    if (this._random.getNumber() < this._directionUpdateProbability) {
      var enemies = this._spriteContainer.getEnemyTanks();
      
      if (enemies.length > 0) {
        var nearest = this._findNearest(enemies);
        var dir = this._directionTo(nearest);
        this._tank.setDirection(dir);
      }
      else {
        // no enemies - move toward base to defend it
        var base = this._spriteContainer.getBase();
        var dir2 = this._directionTo(base);
        this._tank.setDirection(dir2);
      }
    }
  }
};

// Aim precisely: if an enemy is in the current facing row/column, face it directly.
AITeammateController.prototype.updateShoot = function () {
  this._shootTimer++;
  if (this._shootTimer >= this._shootInterval) {
    this._shootTimer = 0;
    
    var enemies = this._spriteContainer.getEnemyTanks();
    var dir = this._tank.getDirection();
    var target = this._findEnemyInDirection(enemies, dir);
    
    // shoot if there's an enemy ahead, or randomly when not
    if (target || this._random.getNumber() < this._shootProbability) {
      this._tank.shoot();
    }
  }
};

AITeammateController.prototype._directionTo = function (target) {
  if (target.getY() < this._tank.getY()) {
    return Sprite.Direction.UP;
  }
  else if (target.getY() > this._tank.getY()) {
    return Sprite.Direction.DOWN;
  }
  else if (target.getX() < this._tank.getX()) {
    return Sprite.Direction.LEFT;
  }
  return Sprite.Direction.RIGHT;
};

// Find an enemy roughly in front of the tank along the given direction.
AITeammateController.prototype._findEnemyInDirection = function (enemies, dir) {
  var tol = Globals.TILE_SIZE;
  var self = this;
  var t = this._tank;
  for (var i = 0; i < enemies.length; ++i) {
    var e = enemies[i];
    if (dir == Sprite.Direction.UP && e.getY() < t.getY() && Math.abs(e.getX() - t.getX()) <= tol) {
      return e;
    }
    if (dir == Sprite.Direction.DOWN && e.getY() > t.getY() && Math.abs(e.getX() - t.getX()) <= tol) {
      return e;
    }
    if (dir == Sprite.Direction.LEFT && e.getX() < t.getX() && Math.abs(e.getY() - t.getY()) <= tol) {
      return e;
    }
    if (dir == Sprite.Direction.RIGHT && e.getX() > t.getX() && Math.abs(e.getY() - t.getY()) <= tol) {
      return e;
    }
  }
  return null;
};

AITeammateController.prototype._findNearest = function (enemies) {
  var nearest = enemies[0];
  var minDist = Infinity;
  for (var i = 0; i < enemies.length; ++i) {
    var e = enemies[i];
    var dx = e.getX() - this._tank.getX();
    var dy = e.getY() - this._tank.getY();
    var d = dx * dx + dy * dy;
    if (d < minDist) {
      minDist = d;
      nearest = e;
    }
  }
  return nearest;
};
