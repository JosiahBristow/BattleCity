function MyMapPlayerAIMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("PLAYER + AI");
}

MyMapPlayerAIMenuItem.subclass(MainMenuItem);

MyMapPlayerAIMenuItem.prototype.execute = function () {
  MapStorage.activate();
  this._sceneManager.toGameScene(1, undefined, 3);
};
