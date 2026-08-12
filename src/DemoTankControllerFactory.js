function DemoTankControllerFactory(eventManager, playerNumber) {
  this._eventManager = eventManager;
  this._playerNumber = playerNumber || 1;
  this._eventManager.addSubscriber(this, [PlayerTankFactory.Event.PLAYER_TANK_CREATED]);
}

DemoTankControllerFactory.prototype.notify = function (event) {
  if (event.name == PlayerTankFactory.Event.PLAYER_TANK_CREATED && event.playerNumber === this._playerNumber) {
    this.create(event.tank);
  }
};

DemoTankControllerFactory.prototype.create = function (tank) {
  var controller = new DemoTankController(tank);
  return controller;
};
