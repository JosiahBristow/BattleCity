function MoreScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  
  this._mainMenu = new MainMenu();
  var items = [];
  if (MapStorage.hasMap()) {
    items.push(new MapManageMenuItem(this._sceneManager));
  }
  items.push(new StageSelectMenuItem(this._sceneManager));
  items.push(new StageListMenuItem(this._sceneManager));
  items.push(new MorePlayerAIMenuItem(this._sceneManager));
  items.push(new CheatMenuItem(this._sceneManager));
  items.push(new EditorMenuItem(this._sceneManager));
  items.push(new HelpMenuItem(this._sceneManager));
  items.push(new BackMenuItem(this._sceneManager, 'toMainMenuScene'));
  this._mainMenu.setItems(items);
  this._mainMenuController = new MainMenuController(this._eventManager, this._mainMenu);
  
  this._cursor = new MainMenuCursor();
  this._cursor.makeVisible();
  this._cursorView = new MainMenuCursorView(this._cursor);
  this._mainMenuView = new MainMenuView(this._mainMenu, this._cursorView, 150, 24);
  MenuMouseController.bindScene(this);
}

MoreScene.prototype.update = function () {
  this._cursor.update();
};

MoreScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillText(Language.translate('MORE'), 178, 120);
  
  this._mainMenuView.draw(ctx, 0);
};

MoreScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

MoreScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.ESC) {
    this._sceneManager.toMainMenuScene(true);
  }
};
