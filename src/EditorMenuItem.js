function EditorMenuItem(sceneManager) {
  MainMenuItem.call(this, sceneManager);
  this.setName("EDITOR");
}

EditorMenuItem.subclass(MainMenuItem);

EditorMenuItem.prototype.execute = function () {
  this._sceneManager.toAdvancedEditorScene();
};
