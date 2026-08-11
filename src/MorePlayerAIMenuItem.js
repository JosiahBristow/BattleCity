function MorePlayerAIMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("PLAYER + AI");
}

MorePlayerAIMenuItem.subclass(MainMenuItem);

MorePlayerAIMenuItem.prototype.execute = function () {
  this._sceneManager.toGameScene(1, undefined, 3);
};

