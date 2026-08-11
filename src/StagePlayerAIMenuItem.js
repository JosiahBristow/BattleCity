function StagePlayerAIMenuItem(sceneManager, stage) {
  MainMenuItem.call(this, sceneManager);
  this._stage = stage;
  this.setName("PLAYER + AI");
}

StagePlayerAIMenuItem.subclass(MainMenuItem);

StagePlayerAIMenuItem.prototype.execute = function () {
  this._sceneManager.toGameScene(this._stage, undefined, 3);
};
