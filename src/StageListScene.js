function StageListScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  
  this._tab = 'default';
  this._page = 1;
  this._stagesPerPage = 6;
  this._cols = 3;
  this._gap = 50;
  this._previewSize = 13 * Globals.UNIT_SIZE * 0.25;
  this._len = this._previewSize + this._gap;
  this._rowHeight = 140;
  this._btnB = Globals.UNIT_SIZE / 2;
  this._clickables = [];
  this._hover = null;
  
  this._holdingLeft = false;
  this._holdingRight = false;
  this._holdingUp = false;
  this._holdingDown = false;
  this._holdTimer = 0;
  this._holdDelay = 8;
  
  this._initFileInput();
  this._initMouse();
}

StageListScene.STAGE_COUNT_PER_PAGE = 6;

StageListScene.prototype._initFileInput = function () {
  var self = this;
  StageListScene._currentScene = this;
  if (!StageListScene._uploadForm) {
    var form = document.createElement('form');
    form.style.display = 'none';
    var input = document.createElement('input');
    input.type = 'file';
    var resetButton = document.createElement('input');
    resetButton.type = 'reset';
    input.addEventListener('change', function () {
      if (StageListScene._currentScene) {
        StageListScene._currentScene._onUploadFile();
      }
    });
    form.appendChild(input);
    form.appendChild(resetButton);
    document.body.appendChild(form);
    StageListScene._uploadForm = form;
    StageListScene._uploadInput = input;
    StageListScene._uploadReset = resetButton;
  }
};

StageListScene.prototype._initMouse = function () {
  var self = this;
  CanvasMouse.on('click', function (e) {
    self._onMouseClick(e);
  });
  CanvasMouse.on('mousemove', function (e) {
    self._onMouseMove(e);
  });
};

StageListScene.prototype._getMousePos = function (e) {
  var rect = e.target.getBoundingClientRect();
  var canvas = e.target;
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  return {
    mx: (e.clientX - rect.left) * scaleX,
    my: (e.clientY - rect.top) * scaleY
  };
};

StageListScene.prototype._onMouseClick = function (e) {
  var pos = this._getMousePos(e);
  var mx = pos.mx;
  var my = pos.my;
  for (var i = 0; i < this._clickables.length; ++i) {
    var c = this._clickables[i];
    if (this._pointIn(mx, my, c.x, c.y, c.w, c.h)) {
      if (!c.disabled) {
        c.action();
      }
      return;
    }
  }
};

StageListScene.prototype._onMouseMove = function (e) {
  var pos = this._getMousePos(e);
  var mx = pos.mx;
  var my = pos.my;
  this._hover = null;
  for (var i = 0; i < this._clickables.length; ++i) {
    var c = this._clickables[i];
    if (this._pointIn(mx, my, c.x, c.y, c.w, c.h)) {
      this._hover = c;
      return;
    }
  }
};

StageListScene.prototype._pointIn = function (mx, my, x, y, w, h) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
};

StageListScene.prototype._addClickable = function (x, y, w, h, action, disabled) {
  this._clickables.push({x: x, y: y, w: w, h: h, action: action, disabled: !!disabled});
};

StageListScene.prototype._getDefaultStages = function () {
  var stages = [];
  for (var i = 0; i < Globals.stages.length; ++i) {
    stages.push({
      name: String(i + 1),
      custom: false,
      difficulty: 1,
      map: Globals.stages[i].map,
      tanks: Globals.stages[i].tanks,
      index: i
    });
  }
  return stages;
};

StageListScene.prototype._getCustomStages = function () {
  var stages = [];
  var maps = MapStorage.getMaps();
  for (var i = 0; i < maps.length; ++i) {
    stages.push({
      name: maps[i].name,
      custom: true,
      difficulty: 1,
      map: maps[i].map,
      tanks: maps[i].tanks || Globals.stages[0].tanks
    });
  }
  return stages;
};

StageListScene.prototype._getFilteredStages = function () {
  return this._tab === 'default' ? this._getDefaultStages() : this._getCustomStages();
};

StageListScene.prototype._getMaxPage = function () {
  var count = this._getFilteredStages().length;
  return Math.max(1, Math.ceil(count / this._stagesPerPage));
};

StageListScene.prototype._getPageStages = function () {
  var stages = this._getFilteredStages();
  var start = (this._page - 1) * this._stagesPerPage;
  return stages.slice(start, start + this._stagesPerPage);
};

StageListScene.prototype._switchTab = function (tab) {
  if (this._tab !== tab) {
    this._tab = tab;
    this._page = 1;
  }
};

StageListScene.prototype._prevPage = function () {
  this._page = Math.max(1, this._page - 1);
};

StageListScene.prototype._nextPage = function () {
  this._page = Math.min(this._getMaxPage(), this._page + 1);
};

StageListScene.prototype._playStage = function (stage, playerCount) {
  if (stage.custom) {
    this._sceneManager.toGameScene(1, undefined, playerCount, {
      name: stage.name,
      map: stage.map,
      tanks: stage.tanks
    });
  }
  else {
    this._sceneManager.toGameScene(stage.index + 1, undefined, playerCount);
  }
};

StageListScene.prototype._editStage = function (stage) {
  if (!stage.custom) {
    return;
  }
  MapStorage.selectByName(stage.name);
  this._sceneManager.toAdvancedEditorScene('toStageListScene');
};

StageListScene.prototype._renameStage = function (stage) {
  if (!stage.custom) {
    return;
  }
  var index = MapStorage.getIndexByName(stage.name);
  if (index !== -1) {
    MapStorage.select(index);
    this._sceneManager.toMapRenameScene(index, 'toStageListScene');
  }
};

StageListScene.prototype._deleteStage = function (stage) {
  if (!stage.custom) {
    return;
  }
  var self = this;
  setTimeout(function () {
    if (window.confirm('Delete stage ' + stage.name + '?')) {
      MapStorage.removeByName(stage.name);
      var maxPage = self._getMaxPage();
      if (self._page > maxPage) {
        self._page = maxPage;
      }
    }
  }, 0);
};

StageListScene.prototype._downloadStage = function (stage) {
  var raw = this._stageToRaw(stage);
  var json = JSON.stringify(raw, null, 2);
  var blob = new Blob([json], {type: 'text/plain;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'stage-' + stage.name + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

StageListScene.prototype._onUploadFile = function () {
  var self = this;
  var input = StageListScene._uploadInput;
  var file = input.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onloadend = function () {
    try {
      var raw = JSON.parse(reader.result);
      var stage = self._rawToStage(raw);
      stage.custom = true;
      
      var existingDefault = false;
      for (var i = 0; i < Globals.stages.length; ++i) {
        if (String(i + 1) === stage.name) {
          existingDefault = true;
          break;
        }
      }
      if (existingDefault) {
        window.alert('Stage ' + stage.name + ' already exists.');
        return;
      }
      
      var maps = MapStorage.getMaps();
      var existingCustom = false;
      for (var j = 0; j < maps.length; ++j) {
        if (maps[j].name === stage.name) {
          existingCustom = true;
          break;
        }
      }
      if (existingCustom) {
        if (!window.confirm('Override existing custom stage. Continue?')) {
          return;
        }
      }
      
      MapStorage.saveStage(stage.name, stage.map, stage.tanks);
      self._tab = 'custom';
      self._page = 1;
    }
    catch (error) {
      console.error(error);
      window.alert('Failed to parse stage config file.');
    }
    finally {
      StageListScene._uploadReset.click();
    }
  };
};

StageListScene.prototype._rawToStage = function (raw) {
  return {
    name: raw.name,
    custom: !!raw.custom,
    difficulty: raw.difficulty || 1,
    map: this._rawToMap(raw.map),
    tanks: this._rawToTanks(raw.bots)
  };
};

StageListScene.prototype._stageToRaw = function (stage) {
  return {
    name: stage.name.toLowerCase(),
    custom: stage.custom,
    difficulty: stage.difficulty || 1,
    map: this._mapToRaw(stage.map),
    bots: this._tanksToRaw(stage.tanks)
  };
};

StageListScene.prototype._rawToMap = function (map) {
  var sprites = [];
  var offsetX = Globals.UNIT_SIZE;
  var offsetY = Globals.TILE_SIZE;
  for (var row = 0; row < 13; ++row) {
    var line = map[row].toLowerCase().split(/ +/);
    for (var col = 0; col < 13; ++col) {
      var item = line[col].trim();
      var x = offsetX + col * Globals.UNIT_SIZE;
      var y = offsetY + row * Globals.UNIT_SIZE;
      var type = item[0];
      var hex = parseInt(item.substring(1), 16) || 0;
      if (type === 'b') {
        if (hex & 0b0001) sprites.push('BrickWall(' + x + ',' + y + ')');
        if (hex & 0b0010) sprites.push('BrickWall(' + (x + 16) + ',' + y + ')');
        if (hex & 0b0100) sprites.push('BrickWall(' + x + ',' + (y + 16) + ')');
        if (hex & 0b1000) sprites.push('BrickWall(' + (x + 16) + ',' + (y + 16) + ')');
      }
      else if (type === 't') {
        if (hex & 0b0001) sprites.push('SteelWall(' + x + ',' + y + ')');
        if (hex & 0b0010) sprites.push('SteelWall(' + (x + 16) + ',' + y + ')');
        if (hex & 0b0100) sprites.push('SteelWall(' + x + ',' + (y + 16) + ')');
        if (hex & 0b1000) sprites.push('SteelWall(' + (x + 16) + ',' + (y + 16) + ')');
      }
      else if (type === 'r') {
        sprites.push('Water(' + x + ',' + y + ')');
      }
      else if (type === 's') {
        sprites.push('Snow(' + x + ',' + y + ')');
      }
      else if (type === 'f') {
        sprites.push('Trees(' + x + ',' + y + ')');
      }
      else if (type === 'e') {
        sprites.push('Base(' + x + ',' + y + ')');
      }
    }
  }
  return sprites.join(';');
};

StageListScene.prototype._mapToRaw = function (mapText) {
  var grid = [];
  for (var r = 0; r < 13; ++r) {
    var row = [];
    for (var c = 0; c < 13; ++c) {
      row.push('X  ');
    }
    grid.push(row);
  }
  
  var sprites = this._parseMap(mapText);
  var offsetX = Globals.UNIT_SIZE;
  var offsetY = Globals.TILE_SIZE;
  
  sprites.forEach(function (s) {
    var col = Math.floor((s.x - offsetX) / Globals.UNIT_SIZE);
    var row = Math.floor((s.y - offsetY) / Globals.UNIT_SIZE);
    if (row < 0 || row >= 13 || col < 0 || col >= 13) {
      return;
    }
    var subCol = Math.floor((s.x - offsetX - col * Globals.UNIT_SIZE) / Globals.TILE_SIZE);
    var subRow = Math.floor((s.y - offsetY - row * Globals.UNIT_SIZE) / Globals.TILE_SIZE);
    var bit = 1 << (subRow * 2 + subCol);
    
    if (s.className === 'BrickWall') {
      if (grid[row][col].trim() === 'X') {
        grid[row][col] = 'B' + bit.toString(16);
      }
      else if (grid[row][col][0] === 'B') {
        var hex = parseInt(grid[row][col].substring(1), 16) | bit;
        grid[row][col] = 'B' + hex.toString(16);
      }
    }
    else if (s.className === 'SteelWall') {
      if (grid[row][col].trim() === 'X') {
        grid[row][col] = 'T' + bit.toString(16);
      }
      else if (grid[row][col][0] === 'T') {
        var hex2 = parseInt(grid[row][col].substring(1), 16) | bit;
        grid[row][col] = 'T' + hex2.toString(16);
      }
    }
    else if (s.className === 'Water') {
      grid[row][col] = 'R  ';
    }
    else if (s.className === 'Snow') {
      grid[row][col] = 'S  ';
    }
    else if (s.className === 'Trees') {
      grid[row][col] = 'F  ';
    }
    else if (s.className === 'Base') {
      grid[row][col] = 'E  ';
    }
  });
  
  return grid.map(function (row) {
    return row.map(function (s) {
      return s.padEnd(3);
    }).join('');
  });
};

StageListScene.prototype._tanksToRaw = function (tanks) {
  var counts = {};
  counts[Tank.Type.BASIC] = 0;
  counts[Tank.Type.FAST] = 0;
  counts[Tank.Type.POWER] = 0;
  counts[Tank.Type.ARMOR] = 0;
  for (var i = 0; i < tanks.length; ++i) {
    if (counts[tanks[i]] !== undefined) {
      counts[tanks[i]]++;
    }
  }
  var names = {};
  names[Tank.Type.BASIC] = 'basic';
  names[Tank.Type.FAST] = 'fast';
  names[Tank.Type.POWER] = 'power';
  names[Tank.Type.ARMOR] = 'armor';
  var result = [];
  [Tank.Type.BASIC, Tank.Type.FAST, Tank.Type.POWER, Tank.Type.ARMOR].forEach(function (type) {
    if (counts[type] > 0) {
      result.push(counts[type] + '*' + names[type]);
    }
  });
  return result;
};

StageListScene.prototype._rawToTanks = function (bots) {
  var result = [];
  var names = {
    'basic': Tank.Type.BASIC,
    'fast': Tank.Type.FAST,
    'power': Tank.Type.POWER,
    'armor': Tank.Type.ARMOR
  };
  for (var i = 0; i < bots.length; ++i) {
    var parts = bots[i].split('*');
    var count = parseInt(parts[0], 10);
    var type = names[parts[1].trim()];
    if (!isNaN(count) && type !== undefined) {
      for (var j = 0; j < count; ++j) {
        result.push(type);
      }
    }
  }
  return result;
};

StageListScene.prototype._parseMap = function (mapText) {
  var result = [];
  if (!mapText) {
    return result;
  }
  var strings = mapText.split(SpriteSerializer.SEPARATOR);
  for (var i = 0; i < strings.length; ++i) {
    var str = strings[i];
    var matches = str.match(/(\w+)\((\d+),(\d+)\)/);
    if (matches) {
      var className = matches[1];
      var image = this._getImageForClass(className);
      if (image) {
        result.push({
          className: className,
          x: parseInt(matches[2], 10),
          y: parseInt(matches[3], 10),
          image: image,
          w: this._getSizeForClass(className),
          h: this._getSizeForClass(className),
          tile: className == 'Snow'
        });
      }
    }
  }
  return result;
};

StageListScene.prototype.update = function () {
  if (this._holdingLeft || this._holdingRight || this._holdingUp || this._holdingDown) {
    this._holdTimer++;
    if (this._holdTimer >= this._holdDelay) {
      this._holdTimer = 0;
      if (this._holdingUp) {
        // no-op in grid
      }
      if (this._holdingDown) {
        // no-op in grid
      }
      if (this._holdingLeft) {
        this._prevPage();
      }
      if (this._holdingRight) {
        this._nextPage();
      }
    }
  }
};

StageListScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
  else if (event.name == Keyboard.Event.KEY_RELEASED) {
    this.keyReleased(event.key);
  }
};

StageListScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    this._holdingRight = true;
    this._nextPage();
    this._holdTimer = 0;
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    this._holdingLeft = true;
    this._prevPage();
    this._holdTimer = 0;
  }
  else if (key == Keyboard.Key.TAB) {
    this._switchTab(this._tab === 'default' ? 'custom' : 'default');
  }
  else if (key == Keyboard.Key.ESC) {
    this._sceneManager.toMoreScene();
  }
};

StageListScene.prototype.keyReleased = function (key) {
  if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    this._holdingRight = false;
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    this._holdingLeft = false;
  }
  else if (key == Keyboard.Key.UP || key == Keyboard.Key.W) {
    this._holdingUp = false;
  }
  else if (key == Keyboard.Key.DOWN || key == Keyboard.Key.S) {
    this._holdingDown = false;
  }
  this._holdTimer = 0;
};

StageListScene.prototype.draw = function (ctx) {
  this._clickables = [];
  
  ctx.fillStyle = '#333333';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  this._drawHeader(ctx);
  this._drawGrid(ctx);
  this._drawPagination(ctx);
  this._drawBottomButtons(ctx);
  this._drawHint(ctx);
};

StageListScene.prototype._drawHeader = function (ctx) {
  var b = Globals.UNIT_SIZE;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px prstart, zpix, "Microsoft YaHei", sans-serif';
  ctx.fillText(Language.translate('STAGES'), 0.5 * b, 0.5 * b + 12);
  
  var defaultRect = EditorUI.drawTextButton(ctx, 4.5 * b, 0.5 * b, Language.translate('DEFAULT'), {
    selected: this._tab === 'default'
  });
  var customRect = EditorUI.drawTextButton(ctx, 8.5 * b, 0.5 * b, Language.translate('CUSTOM'), {
    selected: this._tab === 'custom'
  });
  
  var self = this;
  this._addClickable(defaultRect.x, defaultRect.y, defaultRect.w, defaultRect.h, function () {
    self._switchTab('default');
  }, this._tab === 'default');
  this._addClickable(customRect.x, customRect.y, customRect.w, customRect.h, function () {
    self._switchTab('custom');
  }, this._tab === 'custom');
};

StageListScene.prototype._drawGrid = function (ctx) {
  var stages = this._getPageStages();
  if (stages.length === 0) {
    EditorFont.draw(ctx, Language.translate('NO CUSTOM STAGE'), 0.5 * Globals.UNIT_SIZE, 3 * Globals.UNIT_SIZE, 2, '#666666');
    return;
  }
  
  var self = this;
  stages.forEach(function (stage, index) {
    var x = self._gap + (index % self._cols) * self._len;
    var y = 80 + Math.floor(index / self._cols) * self._rowHeight;
    self._drawStage(ctx, stage, x, y);
  });
};

StageListScene.prototype._drawStage = function (ctx, stage, x, y) {
  var self = this;
  var b = this._btnB;
  
  this._drawPreview(ctx, stage, x, y, 0.25);
  
  // name
  EditorFont.draw(ctx, stage.name, x, y, 1, '#dd2664');
  
  // buttons
  var by = y + 112;
  var btnOpts = {textScale: 1, spreadX: 4, spreadY: 2};
  var p1Rect = EditorUI.drawTextButton(ctx, x, by, '\u2160', btnOpts);
  var p2Rect = EditorUI.drawTextButton(ctx, x + 1 * b, by, '\u2161', btnOpts);
  var aiRect = EditorUI.drawTextButton(ctx, x + 2 * b, by, 'AI', btnOpts);
  var editRect = EditorUI.drawTextButton(ctx, x + 3 * b, by, 'E', {textScale: 1, spreadX: 4, spreadY: 2, disabled: !stage.custom});
  var renameRect = null;
  var deleteRect = null;
  if (stage.custom) {
    renameRect = EditorUI.drawTextButton(ctx, x + 4 * b, by, 'R', btnOpts);
    deleteRect = EditorUI.drawTextButton(ctx, x + 5 * b, by, 'X', btnOpts);
  }
  var downloadRect = EditorUI.drawTextButton(ctx, x + 6 * b, by, '\u2193', btnOpts);
  
  this._addClickable(p1Rect.x, p1Rect.y, p1Rect.w, p1Rect.h, function () {
    self._playStage(stage, 1);
  });
  this._addClickable(p2Rect.x, p2Rect.y, p2Rect.w, p2Rect.h, function () {
    self._playStage(stage, 2);
  });
  this._addClickable(aiRect.x, aiRect.y, aiRect.w, aiRect.h, function () {
    self._playStage(stage, 3);
  });
  this._addClickable(editRect.x, editRect.y, editRect.w, editRect.h, function () {
    self._editStage(stage);
  }, !stage.custom);
  if (renameRect) {
    this._addClickable(renameRect.x, renameRect.y, renameRect.w, renameRect.h, function () {
      self._renameStage(stage);
    });
  }
  if (deleteRect) {
    this._addClickable(deleteRect.x, deleteRect.y, deleteRect.w, deleteRect.h, function () {
      self._deleteStage(stage);
    });
  }
  this._addClickable(downloadRect.x, downloadRect.y, downloadRect.w, downloadRect.h, function () {
    self._downloadStage(stage);
  });
};

StageListScene.prototype._drawPreview = function (ctx, stage, px, py, scale) {
  var size = 13 * Globals.UNIT_SIZE * scale;
  
  if (!stage) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(px, py, size, size);
    return;
  }
  
  var sprites = this._parseMap(stage.map);
  var fieldX = Globals.UNIT_SIZE;
  var fieldY = Globals.TILE_SIZE;
  
  ctx.fillStyle = '#666666';
  ctx.fillRect(px, py, size, size);
  
  ctx.fillStyle = '#000000';
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

StageListScene.prototype._getImageForClass = function (className) {
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

StageListScene.prototype._getSizeForClass = function (className) {
  if (className == 'BrickWall' || className == 'SteelWall') {
    return Globals.TILE_SIZE;
  }
  return Globals.UNIT_SIZE;
};

StageListScene.prototype._drawPagination = function (ctx) {
  var b = Globals.UNIT_SIZE;
  var x0 = 6.5 * b;
  var y0 = 12 * b;
  var disabledPrev = this._page === 1;
  var disabledNext = this._page >= this._getMaxPage();
  
  var self = this;
  ctx.save();
  ctx.translate(x0, y0);
  
  var prevRect = EditorUI.drawTextButton(ctx, 0, 0, '\u2190', {disabled: disabledPrev});
  EditorFont.draw(ctx, String(this._page), 1.25 * b, 0, 2);
  var nextRect = EditorUI.drawTextButton(ctx, 2.5 * b, 0, '\u2192', {disabled: disabledNext});
  
  ctx.restore();
  
  this._addClickable(x0 + prevRect.x, y0 + prevRect.y, prevRect.w, prevRect.h, function () {
    self._prevPage();
  }, disabledPrev);
  this._addClickable(x0 + nextRect.x, y0 + nextRect.y, nextRect.w, nextRect.h, function () {
    self._nextPage();
  }, disabledNext);
};

StageListScene.prototype._drawBottomButtons = function (ctx) {
  var b = Globals.UNIT_SIZE;
  var x0 = 5.5 * b;
  var y0 = 13.5 * b;
  var self = this;
  
  ctx.save();
  ctx.translate(x0, y0);
  
  var editorRect = EditorUI.drawTextButton(ctx, 0, 0, Language.translate('EDITOR'));
  var uploadRect = EditorUI.drawTextButton(ctx, 3.5 * b, 0, Language.translate('UPLOAD'));
  var backRect = EditorUI.drawTextButton(ctx, 7 * b, 0, Language.translate('BACK'));
  
  ctx.restore();
  
  this._addClickable(x0 + editorRect.x, y0 + editorRect.y, editorRect.w, editorRect.h, function () {
    self._sceneManager.toAdvancedEditorScene('toStageListScene');
  });
  this._addClickable(x0 + uploadRect.x, y0 + uploadRect.y, uploadRect.w, uploadRect.h, function () {
    StageListScene._uploadInput.click();
  });
  this._addClickable(x0 + backRect.x, y0 + backRect.y, backRect.w, backRect.h, function () {
    self._sceneManager.toMoreScene();
  });
};

StageListScene.prototype._drawHint = function (ctx) {
  ctx.fillStyle = '#999999';
  EditorFont.draw(ctx, Language.translate('STAGE LIST HINT'), 0.5 * Globals.UNIT_SIZE, 14.5 * Globals.UNIT_SIZE, 1);
};
