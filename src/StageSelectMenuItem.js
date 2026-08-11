function StageSelectMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("STAGE SELECT");
}

StageSelectMenuItem.subclass(MainMenuItem);

StageSelectMenuItem.prototype.execute = function () {
  this._sceneManager.toStageSelectScene();
};
