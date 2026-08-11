function Construction(sceneManager) {
  Gamefield.call(this, sceneManager);
  
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  
  new Builder(this._eventManager);
  this._structureManager = new StructureManager(this._eventManager);
  
  this._cursor = new Cursor(this._eventManager);
  this._cursor.setZIndex(100);
  this._cursor.setPosition(new Point(this._x, this._y));
  new CursorController(this._eventManager, this._cursor);
  
  this._createInitialMap();
  
  this._savedMessage = new SavedMessage();
}

Construction.subclass(Gamefield);

Construction.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

Construction.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.START) {
    this._sceneManager.toMainMenuScene(true);
  }
  else if (key == Keyboard.Key.S) {
    this._save();
  }
};

Construction.prototype._save = function () {
  var serializer = new SpriteSerializer(this._eventManager);
  var map = serializer.serializeSprites(this._structureManager.getSprites());
  var name = MapStorage.save(map);
  this._savedMessage.show(name);
};

Construction.prototype._createInitialMap = function () {
  if (MapStorage.hasMap()) {
    this._loadSavedMap();
  }
  else {
    this._createBase();
  }
};

Construction.prototype._loadSavedMap = function () {
  var serializer = new SpriteSerializer(this._eventManager);
  var sprites = serializer.unserializeSprites(MapStorage.load());
  var self = this;
  sprites.forEach(function (sprite) {
    self._structureManager.addSprite(sprite);
  });
};

Construction.prototype.update = function () {
  Gamefield.prototype.update.call(this);
  this._savedMessage.update();
};

Construction.prototype.draw = function (ctx) {
  Gamefield.prototype.draw.call(this, ctx);
  this._savedMessage.draw(ctx);
};

Construction.prototype._createBase = function () {
  var base = new Base(this._eventManager);
  base.setPosition(new Point(this._x + 6 * Globals.UNIT_SIZE, this._y + 12 * Globals.UNIT_SIZE));
  this._structureManager.addSprite(base);
  
  var w1 = new BrickWall(this._eventManager);
  w1.setPosition(new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 25 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w1);
  
  var w2 = new BrickWall(this._eventManager);
  w2.setPosition(new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 24 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w2);
  
  var w3 = new BrickWall(this._eventManager);
  w3.setPosition(new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w3);
  
  var w4 = new BrickWall(this._eventManager);
  w4.setPosition(new Point(this._x + 12 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w4);
  
  var w5 = new BrickWall(this._eventManager);
  w5.setPosition(new Point(this._x + 13 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w5);
  
  var w6 = new BrickWall(this._eventManager);
  w6.setPosition(new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w6);
  
  var w7 = new BrickWall(this._eventManager);
  w7.setPosition(new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 24 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w7);
  
  var w8 = new BrickWall(this._eventManager);
  w8.setPosition(new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 25 * Globals.TILE_SIZE));
  this._structureManager.addSprite(w8);
};
