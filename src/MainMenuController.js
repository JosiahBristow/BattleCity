function MainMenuController(eventManager, mainMenu) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  this._menu = mainMenu;
  this._active = true;
}

MainMenuController.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

MainMenuController.prototype.keyPressed = function (key) {
  if (!this._active) {
    return;
  }
  
  if (key == Keyboard.Key.DOWN || key == Keyboard.Key.S) {
    this._menu.nextItem();
  }
  else if (key == Keyboard.Key.UP || key == Keyboard.Key.W) {
    this._menu.prevItem();
  }
  else if (key == Keyboard.Key.START || key == Keyboard.Key.J) {
    this._menu.executeCurrentItem();
  }
};

MainMenuController.prototype.activate = function () {
  this._active = true;
};

MainMenuController.prototype.deactivate = function () {
  this._active = false;
};
