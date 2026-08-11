function BackMenuItem(sceneManager, destination) {
  MainMenuItem.call(this, sceneManager);
  this._destination = destination;
  this.setName("BACK");
}

BackMenuItem.subclass(MainMenuItem);

BackMenuItem.prototype.execute = function () {
  if (this._destination) {
    this._sceneManager[this._destination]();
  }
  else {
    this._sceneManager.toMainMenuScene(true);
  }
};
