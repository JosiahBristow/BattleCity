function StagePlayerScene(sceneManager, stage, backMethod) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  this._stage = stage;
  this._backMethod = backMethod || 'toMoreScene';
  
  this._mainMenu = new MainMenu();
  this._mainMenu.setItems([
    new StagePlayerMenuItem(this._sceneManager, this._stage, 1),
    new StagePlayerMenuItem(this._sceneManager, this._stage, 2),
    new StagePlayerAIMenuItem(this._sceneManager, this._stage),
    new BackMenuItem(this._sceneManager, this._backMethod)
  ]);
  this._mainMenuController = new MainMenuController(this._eventManager, this._mainMenu);
  
  this._cursor = new MainMenuCursor();
  this._cursor.makeVisible();
  this._cursorView = new MainMenuCursorView(this._cursor);
  this._mainMenuView = new MainMenuView(this._mainMenu, this._cursorView);
  MenuMouseController.bindScene(this);
}

StagePlayerScene.prototype.update = function () {
  this._cursor.update();
};

StagePlayerScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillText(Language.translate('STAGE') + " " + ("" + this._stage).lpad(" ", 2), 178, 200);
  
  this._mainMenuView.draw(ctx, 0);
};

StagePlayerScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

StagePlayerScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.ESC) {
    this._sceneManager[this._backMethod]();
  }
};
