function AITeammateControllerFactory(eventManager, spriteContainer) {
  this._eventManager = eventManager;
  this._spriteContainer = spriteContainer;
  this._eventManager.addSubscriber(this, [PlayerTankFactory.Event.PLAYER_TANK_CREATED]);
}

AITeammateControllerFactory.prototype.notify = function (event) {
  if (event.name == PlayerTankFactory.Event.PLAYER_TANK_CREATED && event.playerNumber == 2) {
    this.create(event.tank);
  }
};

AITeammateControllerFactory.prototype.create = function (tank) {
  tank.setTeammate(true);
  var controller = new AITeammateController(tank, new Random(), this._spriteContainer);
  return controller;
};
