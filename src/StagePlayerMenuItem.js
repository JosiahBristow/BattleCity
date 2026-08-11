function StagePlayerMenuItem(sceneManager, stage, playerCount) {
  MainMenuItem.call(this, sceneManager);
  this._stage = stage;
  this._playerCount = playerCount || 1;
  this.setName(this._playerCount == 2 ? "2 PLAYERS" : "1 PLAYER");
}

StagePlayerMenuItem.subclass(MainMenuItem);

StagePlayerMenuItem.prototype.execute = function () {
  this._sceneManager.toGameScene(this._stage, undefined, this._playerCount);
};
