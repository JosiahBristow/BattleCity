function DemoTankControllerFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [PlayerTankFactory.Event.PLAYER_TANK_CREATED]);
}

DemoTankControllerFactory.prototype.notify = function (event) {
  if (event.name == PlayerTankFactory.Event.PLAYER_TANK_CREATED) {
    this.create(event.tank);
  }
};

DemoTankControllerFactory.prototype.create = function (tank) {
  var controller = new DemoTankController(tank);
  return controller;
};
