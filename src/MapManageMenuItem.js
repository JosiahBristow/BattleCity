function MapManageMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("MY MAPS");
}

MapManageMenuItem.subclass(MainMenuItem);

MapManageMenuItem.prototype.execute = function () {
  this._sceneManager.toMapManageScene();
};
