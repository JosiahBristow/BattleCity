function MoreMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("MORE");
}

MoreMenuItem.subclass(MainMenuItem);

MoreMenuItem.prototype.execute = function () {
  this._sceneManager.toMoreScene();
};
