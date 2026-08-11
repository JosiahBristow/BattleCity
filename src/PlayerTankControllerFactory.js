function PlayerTankControllerFactory(eventManager, playerNumber, keyMap, shootKey) {
  this._eventManager = eventManager;
  this._playerNumber = playerNumber || 1;
  this._keyMap = keyMap;
  this._shootKey = shootKey;
  this._eventManager.addSubscriber(this, [PlayerTankFactory.Event.PLAYER_TANK_CREATED]);
}

PlayerTankControllerFactory.prototype.notify = function (event) {
  if (event.name == PlayerTankFactory.Event.PLAYER_TANK_CREATED && event.playerNumber === this._playerNumber) {
    this.create(event.tank);
  }
};

PlayerTankControllerFactory.prototype.create = function (tank) {
  var controller = new TankController(this._eventManager, tank, this._keyMap, this._shootKey);
  return controller;
};
