function MyMapPlayerScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  
  this._mainMenu = new MainMenu();
  this._mainMenu.setItems([
    new MyMapPlayerMenuItem(this._sceneManager, 1),
    new MyMapPlayerMenuItem(this._sceneManager, 2),
    new MyMapPlayerAIMenuItem(this._sceneManager),
    new BackMenuItem(this._sceneManager, 'toMyMapScene')
  ]);
  this._mainMenuController = new MainMenuController(this._eventManager, this._mainMenu);
  
  this._cursor = new MainMenuCursor();
  this._cursor.makeVisible();
  this._cursorView = new MainMenuCursorView(this._cursor);
  this._mainMenuView = new MainMenuView(this._mainMenu, this._cursorView);
  MenuMouseController.bindScene(this);
}

MyMapPlayerScene.prototype.update = function () {
  this._cursor.update();
};

MyMapPlayerScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#ffffff";
  var map = MapStorage.getMap(MapStorage.getSelectedIndex());
  if (map) {
    ctx.fillText(map.name, 178, 200);
  }
  
  this._mainMenuView.draw(ctx, 0);
};

MyMapPlayerScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

MyMapPlayerScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.ESC) {
    this._sceneManager.toMyMapScene();
  }
};
