function MapManageScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  
  this._index = 0;
  this._refresh();
  
  this._holdingLeft = false;
  this._holdingRight = false;
  this._holdTimer = 0;
  this._holdDelay = 8;
  
  this._initMouse();
}

MapManageScene.prototype._initMouse = function () {
  var self = this;
  CanvasMouse.on('click', function (e) {
    self._onMouseClick(e);
  });
};

MapManageScene.prototype._onMouseClick = function (e) {
  if (this._count == 0) {
    return;
  }
  var rect = e.target.getBoundingClientRect();
  var mx = e.clientX - rect.left;
  var my = e.clientY - rect.top;
  // left preview = prev, right preview = next, center = play
  if (my >= 84 && my <= 84 + 208) {
    if (mx >= 16 && mx <= 120) {
      this.prevMap();
    }
    else if (mx >= 140 && mx <= 348) {
      MapStorage.select(this._index);
      this._sceneManager.toMyMapPlayerScene();
    }
    else if (mx >= 392 && mx <= 496) {
      this.nextMap();
    }
  }
  // hint area: 1 edit, 2 rename, 3 delete
  if (my >= 395 && my <= 430) {
    if (mx >= 16 && mx <= 90) {
      MapStorage.select(this._index);
      this._sceneManager.toAdvancedEditorScene();
    }
    else if (mx >= 90 && mx <= 180) {
      this._sceneManager.toMapRenameScene(this._index);
    }
    else if (mx >= 180 && mx <= 260) {
      MapStorage.remove(this._index);
      this._refresh();
    }
  }
};

MapManageScene.prototype._refresh = function () {
  this._count = MapStorage.getCount();
  if (this._count == 0) {
    this._index = 0;
  }
  else if (this._index >= this._count) {
    this._index = this._count - 1;
  }
};

MapManageScene.prototype.getIndex = function () {
  return this._index;
};

MapManageScene.prototype.setIndex = function (index) {
  this._index = index;
  if (this._index < 0) this._index = this._count - 1;
  if (this._index >= this._count) this._index = 0;
  MapStorage.select(this._index);
};

MapManageScene.prototype.nextMap = function () {
  this.setIndex(this._index + 1);
};

MapManageScene.prototype.prevMap = function () {
  this.setIndex(this._index - 1);
};

MapManageScene.prototype.update = function () {
  if (this._holdingLeft || this._holdingRight) {
    this._holdTimer++;
    if (this._holdTimer >= this._holdDelay) {
      this._holdTimer = 0;
      if (this._holdingLeft) this.prevMap();
      if (this._holdingRight) this.nextMap();
    }
  }
};

MapManageScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillText(Language.translate('MY MAPS'), 16, 30);
  
  if (this._count == 0) {
    ctx.fillStyle = "#feac4e";
    ctx.fillText(Language.translate('NO CUSTOM MAP'), 120, 220);
    ctx.fillText(Language.translate('ESC TO GO BACK'), 120, 260);
    return;
  }
  
  var prevMap = MapStorage.getMap(this._index - 1);
  var curMap = MapStorage.getMap(this._index);
  var nextMap = MapStorage.getMap(this._index + 1);
  
  this._drawPreview(ctx, prevMap, 16, 132, 0.25);
  this._drawPreview(ctx, curMap, 140, 84, 0.5);
  this._drawPreview(ctx, nextMap, 392, 132, 0.25);
  
  ctx.fillStyle = "#feac4e";
  ctx.fillText(curMap.name, 196, 320);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillText("< " + Language.translate('PREV') + "    " + Language.translate('NEXT') + " >", 120, 370);
  ctx.fillText(Language.translate('J TO PLAY'), 80, 400);
  ctx.fillText("1 EDIT  2 RENAME  3 DELETE", 80, 420);
  ctx.fillText(Language.translate('ESC TO GO BACK'), 80, 440);
};

MapManageScene.prototype._drawPreview = function (ctx, map, px, py, scale) {
  var size = 13 * Globals.UNIT_SIZE * scale;
  
  if (!map) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(px, py, size, size);
    return;
  }
  
  var sprites = this._parseMap(map.map);
  var fieldX = Globals.UNIT_SIZE;
  var fieldY = Globals.TILE_SIZE;
  
  ctx.fillStyle = "#666666";
  ctx.fillRect(px, py, size, size);
  
  ctx.fillStyle = "#000000";
  ctx.fillRect(
    px + (Globals.UNIT_SIZE - fieldX) * scale,
    py + (Globals.TILE_SIZE - fieldY) * scale,
    13 * Globals.UNIT_SIZE * scale,
    13 * Globals.UNIT_SIZE * scale);
  
  sprites.forEach(function (sprite) {
    var image = ImageManager.getImage(sprite.image);
    if (!image) {
      return;
    }
    if (sprite.tile) {
      var sub = Globals.TILE_SIZE;
      for (var sy = 0; sy < 2; ++sy) {
        for (var sx = 0; sx < 2; ++sx) {
          ctx.drawImage(image,
            px + (sprite.x - fieldX) * scale + sx * sub * scale,
            py + (sprite.y - fieldY) * scale + sy * sub * scale,
            sub * scale,
            sub * scale);
        }
      }
    }
    else {
      ctx.drawImage(image,
        px + (sprite.x - fieldX) * scale,
        py + (sprite.y - fieldY) * scale,
        sprite.w * scale,
        sprite.h * scale);
    }
  });
};

MapManageScene.prototype._parseMap = function (mapText) {
  var result = [];
  var strings = mapText.split(SpriteSerializer.SEPARATOR);
  strings.forEach(function (str) {
    var matches = str.match(/(\w+)\((\d+),(\d+)\)/);
    if (!matches) {
      return;
    }
    var className = matches[1];
    var x = parseInt(matches[2]);
    var y = parseInt(matches[3]);
    var image = this._getImageForClass(className);
    var size = this._getSizeForClass(className);
    if (image) {
      result.push({x: x, y: y, image: image, w: size, h: size, tile: className == 'Snow'});
    }
  }, this);
  return result;
};

MapManageScene.prototype._getImageForClass = function (className) {
  if (className == 'BrickWall') return 'wall_brick';
  else if (className == 'SteelWall') return 'wall_steel';
  else if (className == 'Water') return 'water_1';
  else if (className == 'Snow') return 'snow';
  else if (className == 'Trees') return 'trees';
  else if (className == 'Base') return 'base';
  return null;
};

MapManageScene.prototype._getSizeForClass = function (className) {
  if (className == 'BrickWall' || className == 'SteelWall') return Globals.TILE_SIZE;
  return Globals.UNIT_SIZE;
};

MapManageScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
  else if (event.name == Keyboard.Event.KEY_RELEASED) {
    this.keyReleased(event.key);
  }
};

MapManageScene.prototype.keyPressed = function (key) {
  if (this._count == 0) {
    if (key == Keyboard.Key.ESC) {
      this._sceneManager.toMoreScene();
    }
    return;
  }
  
  if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    this._holdingRight = true;
    this.nextMap();
    this._holdTimer = 0;
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    this._holdingLeft = true;
    this.prevMap();
    this._holdTimer = 0;
  }
  else if (key == Keyboard.Key.UP || key == Keyboard.Key.W) {
    this.prevMap();
  }
  else if (key == Keyboard.Key.DOWN || key == Keyboard.Key.S) {
    this.nextMap();
  }
  else if (key == Keyboard.Key.START || key == Keyboard.Key.J) {
    MapStorage.select(this._index);
    this._sceneManager.toMyMapPlayerScene();
  }
  else if (key == Keyboard.Key.ESC) {
    this._sceneManager.toMoreScene();
  }
  else if (key == 49) { // 1 = edit
    MapStorage.select(this._index);
    this._sceneManager.toAdvancedEditorScene();
  }
  else if (key == 50) { // 2 = rename
    this._sceneManager.toMapRenameScene(this._index);
  }
  else if (key == 51) { // 3 = delete
    MapStorage.remove(this._index);
    this._refresh();
  }
};

MapManageScene.prototype.keyReleased = function (key) {
  if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    this._holdingRight = false;
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    this._holdingLeft = false;
  }
  this._holdTimer = 0;
};
