function PointsFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [TankExplosion.Event.DESTROYED, PowerUp.Event.PICK]);
  this._pointsSize = Globals.UNIT_SIZE;
}

PointsFactory.Event = {};
PointsFactory.Event.POINTS_CREATED = 'PointsFactory.Event.POINTS_CREATED';

PointsFactory.prototype.notify = function (event) {
  if (this._enemyTankExplosionEnd(event)) {
    var explosion = event.explosion;
    var tank = explosion.getTank();
    var playerNumber = this._getKillerPlayerNumber(tank);
    this.create(explosion.getCenter(), tank.getValue(), Points.Type.TANK, playerNumber);
  }
  else if (event.name == PowerUp.Event.PICK) {
    var powerUp = event.powerUp;
    var playerTank = powerUp.getPlayerTank();
    var playerNumber = playerTank ? playerTank.getPlayerNumber() : undefined;
    this.create(powerUp.getCenter(), powerUp.getValue(), Points.Type.POWERUP, playerNumber);
  }
};

PointsFactory.prototype.create = function (center, value, type, playerNumber) {
  var points = new Points(this._eventManager);
  points.setValue(value);
  points.setRect(new Rect(
    center.getX() - this._pointsSize / 2,
    center.getY() - this._pointsSize / 2,
    this._pointsSize,
    this._pointsSize));
  points.setType(type);
  this._eventManager.fireEvent({'name': PointsFactory.Event.POINTS_CREATED, 'points': points, 'playerNumber': playerNumber});
  return points;
};

PointsFactory.prototype._getKillerPlayerNumber = function (tank) {
  var killer = tank.getKiller();
  if (!killer) {
    return undefined;
  }
  return killer.getPlayerNumber();
};

PointsFactory.prototype.setPointsSize = function (size) {
  this._pointsSize = size;
};

PointsFactory.prototype._enemyTankExplosionEnd = function (event) {
  if (event.name != TankExplosion.Event.DESTROYED) {
    return false;
  }
  var tank = event.explosion.getTank();
  if (!tank.isEnemy()) {
    return false;
  }
  if (tank.getValue() <= 0) {
    return false;
  }
  return true;
};
