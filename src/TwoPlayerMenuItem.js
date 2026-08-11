function TwoPlayerMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("2 PLAYERS");
}

TwoPlayerMenuItem.subclass(MainMenuItem);

TwoPlayerMenuItem.prototype.execute = function () {
  this._sceneManager.toGameScene(undefined, undefined, 2);
};
