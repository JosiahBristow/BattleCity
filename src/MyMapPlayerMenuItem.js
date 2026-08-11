function MyMapPlayerMenuItem(sceneManager, playerCount) {
  MainMenuItem.call(this, sceneManager);
  this._playerCount = playerCount || 1;
  this.setName(this._playerCount == 2 ? "2 PLAYERS" : "1 PLAYER");
}

MyMapPlayerMenuItem.subclass(MainMenuItem);

MyMapPlayerMenuItem.prototype.execute = function () {
  MapStorage.activate();
  this._sceneManager.toGameScene(1, undefined, this._playerCount);
};
