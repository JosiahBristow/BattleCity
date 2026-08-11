function Snow(eventManager) {
  Sprite.call(this, eventManager);
  this._w = Globals.UNIT_SIZE;
  this._h = Globals.UNIT_SIZE;
  this._zIndex = -1;
}

Snow.subclass(Sprite);

Snow.prototype.getClassName = function () {
  return 'Snow';
};

Snow.prototype.draw = function (ctx) {
  var img = ImageManager.getImage('snow');
  for (var y = 0; y < 2; ++y) {
    for (var x = 0; x < 2; ++x) {
      ctx.drawImage(img, this._x + x * Globals.TILE_SIZE, this._y + y * Globals.TILE_SIZE);
    }
  }
};
