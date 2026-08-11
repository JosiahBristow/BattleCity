function HelpMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("HELP");
}

HelpMenuItem.subclass(MainMenuItem);

HelpMenuItem.prototype.execute = function () {
  this._sceneManager.toHelpScene();
};
