function CheatMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("CHEAT");
}

CheatMenuItem.subclass(MainMenuItem);

CheatMenuItem.prototype.execute = function () {
  this._sceneManager.toCheatScene();
};
