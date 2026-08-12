function StageListMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("STAGE LIST");
}

StageListMenuItem.subclass(MainMenuItem);

StageListMenuItem.prototype.execute = function () {
  this._sceneManager.toStageListScene();
};
