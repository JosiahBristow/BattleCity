function StageSelectScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  
  this._stage = 1;
  this._stageCount = Globals.stages.length;
  
  this._holdingLeft = false;
  this._holdingRight = false;
  this._holdTimer = 0;
  this._holdDelay = 8;
  
  this._numberBuffer = '';
  this._numberTimer = 0;
  this._numberTimeout = 40;
  
  this._initMouse();
}

StageSelectScene.prototype._initMouse = function () {
  var self = this;
  CanvasMouse.on('click', function (e) {
    self._onMouseClick(e);
  });
};

StageSelectScene.prototype._onMouseClick = function (e) {
  var rect = e.target.getBoundingClientRect();
  var mx = e.clientX - rect.left;
  var my = e.clientY - rect.top;
  // left preview = prev, right preview = next, center = start
  if (my >= 84 && my <= 84 + 208) {
    if (mx >= 16 && mx <= 120) {
      this.prevStage();
    }
    else if (mx >= 140 && mx <= 348) {
      this._sceneManager.toStagePlayerScene(this._stage);
    }
    else if (mx >= 392 && mx <= 496) {
      this.nextStage();
    }
  }
};

StageSelectScene.prototype.getStage = function () {
  return this._stage;
};

StageSelectScene.prototype.setStage = function (stage) {
  this._stage = stage;
  if (this._stage < 1) {
    this._stage = this._stageCount;
  }
  if (this._stage > this._stageCount) {
    this._stage = 1;
  }
};

StageSelectScene.prototype.nextStage = function () {
  this.setStage(this._stage + 1);
};

StageSelectScene.prototype.prevStage = function () {
  this.setStage(this._stage - 1);
};

StageSelectScene.prototype.jumpToStage = function (stageNumber) {
  this.setStage(stageNumber);
};

StageSelectScene.prototype.update = function () {
  if (this._holdingLeft || this._holdingRight) {
    this._holdTimer++;
    if (this._holdTimer >= this._holdDelay) {
      this._holdTimer = 0;
      if (this._holdingLeft) {
        this.prevStage();
      }
      if (this._holdingRight) {
        this.nextStage();
      }
    }
  }
  if (this._numberBuffer) {
    this._numberTimer++;
    if (this._numberTimer >= this._numberTimeout) {
      this._applyNumberBuffer();
    }
  }
};

StageSelectScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillText(Language.translate('STAGE SELECT'), 16, 30);
  
  this._drawPreview(ctx, this._stage - 1, 16, 132, 0.25);
  this._drawPreview(ctx, this._stage, 140, 84, 0.5);
  this._drawPreview(ctx, this._stage + 1, 392, 132, 0.25);
  
  ctx.fillStyle = "#feac4e";
  ctx.fillText(Language.translate('STAGE') + " " + ("" + this._stage).lpad(" ", 2), 196, 320);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillText("< " + Language.translate('PREV') + "    " + Language.translate('NEXT') + " >", 120, 370);
  ctx.fillText(Language.translate('J TO START'), 80, 400);
  ctx.fillText(Language.translate('ESC TO GO BACK'), 80, 420);
  
  ctx.fillStyle = "#96d332";
  if (this._numberBuffer) {
    ctx.fillText(Language.translate('GO TO STAGE') + " " + this._numberBuffer, 120, 440);
  }
  else {
    ctx.fillText(Language.translate('TYPE NUMBER TO JUMP'), 80, 440);
  }
};

StageSelectScene.prototype._drawPreview = function (ctx, stageNumber, px, py, scale) {
  var stage;
  if (stageNumber < 1 || stageNumber > this._stageCount) {
    stage = null;
  }
  else {
    stage = Globals.stages[(stageNumber - 1) % this._stageCount];
  }
  
  var size = 13 * Globals.UNIT_SIZE * scale;
  
  if (!stage) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(px, py, size, size);
    return;
  }
  
  var sprites = this._parseMap(stage.map);
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

StageSelectScene.prototype._parseMap = function (mapText) {
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

StageSelectScene.prototype._getImageForClass = function (className) {
  if (className == 'BrickWall') {
    return 'wall_brick';
  }
  else if (className == 'SteelWall') {
    return 'wall_steel';
  }
  else if (className == 'Water') {
    return 'water_1';
  }
  else if (className == 'Snow') {
    return 'snow';
  }
  else if (className == 'Trees') {
    return 'trees';
  }
  else if (className == 'Base') {
    return 'base';
  }
  return null;
};

StageSelectScene.prototype._getSizeForClass = function (className) {
  if (className == 'BrickWall' || className == 'SteelWall') {
    return Globals.TILE_SIZE;
  }
  return Globals.UNIT_SIZE;
};

StageSelectScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
  else if (event.name == Keyboard.Event.KEY_RELEASED) {
    this.keyReleased(event.key);
  }
};

StageSelectScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    this._holdingRight = true;
    this.nextStage();
    this._holdTimer = 0;
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    this._holdingLeft = true;
    this.prevStage();
    this._holdTimer = 0;
  }
  else if (key == Keyboard.Key.UP || key == Keyboard.Key.W) {
    this.prevStage();
  }
  else if (key == Keyboard.Key.DOWN || key == Keyboard.Key.S) {
    this.nextStage();
  }
  else if (key == Keyboard.Key.START || key == Keyboard.Key.J) {
    this._sceneManager.toStagePlayerScene(this._stage);
  }
  else if (key == Keyboard.Key.ESC) {
    this._sceneManager.toMoreScene();
  }
  else if (key >= 48 && key <= 57) {
    this._handleNumberKey(key - 48);
  }
};

StageSelectScene.prototype.keyReleased = function (key) {
  if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    this._holdingRight = false;
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    this._holdingLeft = false;
  }
  this._holdTimer = 0;
};

StageSelectScene.prototype._handleNumberKey = function (digit) {
  if (this._numberBuffer.length >= 2) {
    this._numberBuffer = '';
  }
  this._numberBuffer += digit;
  this._numberTimer = 0;
  
  if (this._numberBuffer.length >= 2) {
    this._applyNumberBuffer();
  }
  else if (digit * 10 > this._stageCount) {
    this._applyNumberBuffer();
  }
};

StageSelectScene.prototype._applyNumberBuffer = function () {
  var target = parseInt(this._numberBuffer);
  this._numberBuffer = '';
  this._numberTimer = 0;
  if (target >= 1 && target <= this._stageCount) {
    this.jumpToStage(target);
  }
};
