function AdvancedEditorScene(sceneManager, backMethod) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  this._backMethod = backMethod || 'toMoreScene';
  
  // fc93 layout uses logical 16px blocks, scaled x2 -> our canvas is 512x448
  // Field: 13x13 blocks of 32px at (0,0). Tools panel on right at x=416.
  this._fieldX = 0;
  this._fieldY = 0;
  this._block = Globals.UNIT_SIZE; // 32
  this._fieldSize = 13 * this._block; // 416
  
  // State
  this._view = 'map';
  this._grid = Editor.createEmptyGrid();
  this._bots = Editor.defaultBots();
  this._difficulty = 1;
  this._name = '';
  
  this._itemType = 'X'; // X/B/T/R/F/E (empty/brick/steel/water/trees/base)
  this._brickHex = 0xf;
  this._steelHex = 0xf;
  this._t = -1; // hovered cell index
  this._pressed = false;
  this._mouseX = -1;
  this._mouseY = -1;
  this._lastPaint = null; // last sub-tile painted, for drag de-dupe
  this._subHover = null; // hovered 16px quadrant on the field {row, col, quad}
  
  // Keyboard cursor
  this._cursorRow = 6;
  this._cursorCol = 6;
  
  this._botIndex = 0;
  this._nameFocus = false;
  this._nameText = '';
  this._showHelp = false;
  
  this._savedMessage = new SavedMessage();
  this._loadInitial();
  
  this._bindMouse();
}

AdvancedEditorScene.prototype._loadInitial = function () {
  if (MapStorage.hasMap()) {
    this._loadSavedMap();
  }
  else {
    this._grid = Editor.defaultGrid();
  }
};

AdvancedEditorScene.prototype._loadSavedMap = function () {
  var map = MapStorage.getMap(MapStorage.getSelectedIndex());
  this._grid = Editor.createEmptyGrid();
  if (!map) {
    this._grid = Editor.defaultGrid();
    return;
  }
  var sprites = this._parseMap(map.map);
  var self = this;
  sprites.forEach(function (s) {
    self._setCell(s.x, s.y, s.className);
  });
};

AdvancedEditorScene.prototype._parseMap = function (mapText) {
  var result = [];
  var strings = mapText.split(SpriteSerializer.SEPARATOR);
  strings.forEach(function (str) {
    var matches = str.match(/(\w+)\((\d+),(\d+)\)/);
    if (matches) {
      result.push({className: matches[1], x: parseInt(matches[2]), y: parseInt(matches[3])});
    }
  });
  return result;
};

AdvancedEditorScene.prototype._setCell = function (x, y, className) {
  var offsetX = Globals.UNIT_SIZE;
  var offsetY = Globals.TILE_SIZE;
  var col = Math.floor((x - offsetX) / this._block);
  var row = Math.floor((y - offsetY) / this._block);
  if (row < 0 || row > 12 || col < 0 || col > 12) {
    return;
  }
  var cell = this._grid[row][col];
  if (className == 'Base') {
    this._grid[row][col] = {type: Editor.Structure.BASE, hex: 0};
  }
  else if (className == 'Player1') {
    this._grid[row][col] = {type: Editor.Structure.SPAWN1, hex: 0};
  }
  else if (className == 'Player2') {
    this._grid[row][col] = {type: Editor.Structure.SPAWN2, hex: 0};
  }
  else if (className == 'Enemy1') {
    this._grid[row][col] = {type: Editor.Structure.ENEMY1, hex: 0};
  }
  else if (className == 'Enemy2') {
    this._grid[row][col] = {type: Editor.Structure.ENEMY2, hex: 0};
  }
  else if (className == 'Enemy3') {
    this._grid[row][col] = {type: Editor.Structure.ENEMY3, hex: 0};
  }
  else if (className == 'Water') {
    this._grid[row][col] = {type: Editor.Structure.WATER, hex: 0};
  }
  else if (className == 'Snow') {
    this._grid[row][col] = {type: Editor.Structure.SNOW, hex: 0};
  }
  else if (className == 'Trees') {
    this._grid[row][col] = {type: Editor.Structure.TREES, hex: 0};
  }
  else if (className == 'BrickWall') {
    var bit = this._subBit(x, y, col, row);
    if (cell.type == Editor.Structure.BRICK) {
      cell.hex |= bit;
    }
    else {
      this._grid[row][col] = {type: Editor.Structure.BRICK, hex: bit};
    }
  }
  else if (className == 'SteelWall') {
    var bit2 = this._subBit(x, y, col, row);
    if (cell.type == Editor.Structure.STEEL) {
      cell.hex |= bit2;
    }
    else {
      this._grid[row][col] = {type: Editor.Structure.STEEL, hex: bit2};
    }
  }
};

AdvancedEditorScene.prototype._subBit = function (x, y, col, row) {
  var offsetX = Globals.UNIT_SIZE;
  var offsetY = Globals.TILE_SIZE;
  var subCol = (x - offsetX - col * this._block) / Globals.TILE_SIZE;
  var subRow = (y - offsetY - row * this._block) / Globals.TILE_SIZE;
  if (subCol == 0 && subRow == 0) return 0b0001;
  if (subCol == 1 && subRow == 0) return 0b0010;
  if (subCol == 0 && subRow == 1) return 0b0100;
  return 0b1000;
};

// ---- mouse support ----

AdvancedEditorScene.prototype._bindMouse = function () {
  var self = this;
  CanvasMouse.on('mousedown', function (e) {
    self._onMouseDown(e);
  });
  CanvasMouse.on('mousemove', function (e) {
    self._onMouseMove(e);
  });
  CanvasMouse.on('mouseup', function (e) {
    self._onMouseUp(e);
  });
  CanvasMouse.on('mouseleave', function () {
    self._pressed = false;
    self._t = -1;
    self._mouseX = -1;
    self._mouseY = -1;
    self._subHover = null;
  });
};

AdvancedEditorScene.prototype._getMousePos = function (e) {
  var rect = e.target.getBoundingClientRect();
  var canvas = e.target;
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  return {
    mx: (e.clientX - rect.left) * scaleX,
    my: (e.clientY - rect.top) * scaleY
  };
};

AdvancedEditorScene.prototype._getCellFromEvent = function (e) {
  var pos = this._getMousePos(e);
  return this._cellFromPoint(pos.mx, pos.my);
};

AdvancedEditorScene.prototype._cellFromPoint = function (mx, my) {
  var col = Math.floor(mx / this._block);
  var row = Math.floor(my / this._block);
  if (this._view == 'map' && mx < this._fieldSize && my < this._fieldSize &&
      col >= 0 && col < 13 && row >= 0 && row < 13) {
    return row * 13 + col;
  }
  return -1;
};

AdvancedEditorScene.prototype._pointIn = function (mx, my, x, y, w, h) {
  return mx >= x && mx <= x + w && my >= y && my <= y + h;
};

// Handle clicks on the tools panel and bottom menu (map view)
AdvancedEditorScene.prototype._handlePanelClick = function (mx, my) {
  var px = this._fieldSize;
  var b = this._block;
  
  // Bottom menu buttons (both views)
  if (this._pointIn(mx, my, 0, this._fieldSize, 4 * b, b)) {
    this._view = 'config';
    return true;
  }
  if (this._pointIn(mx, my, 4 * b, this._fieldSize, 4 * b, b)) {
    this._view = 'map';
    return true;
  }
  if (this._pointIn(mx, my, 9 * b, this._fieldSize, 4 * b, b)) {
    this._save();
    return true;
  }
  if (this._pointIn(mx, my, 12 * b, this._fieldSize, 4 * b, b)) {
    this._sceneManager[this._backMethod]();
    return true;
  }
  
  if (this._view == 'map') {
    // '?' help button in tools panel
    var px = this._fieldSize;
    if (this._pointIn(mx, my, px + 2.25 * b - 8, 0.25 * b - 8, 48, 32)) {
      this._showHelp = !this._showHelp;
      return true;
    }
    // 'f' reset button (before item selection since it overlaps the spawn column)
    if (this._itemType == 'B') {
      if (this._pointIn(mx, my, px + 2.25 * b - 4, 2.75 * b - 4, 24, 24)) {
        this._brickHex = 0xf;
        return true;
      }
    }
    else if (this._itemType == 'T') {
      if (this._pointIn(mx, my, px + 2.25 * b - 4, 4.25 * b - 4, 24, 24)) {
        this._steelHex = 0xf;
        return true;
      }
    }
    // Wall quadrant widget clicks (before item selection: the active wall
    // tool's sample toggles its own quadrants instead of re-selecting).
    if (this._itemType == 'B') {
      if (this._toggleWidgetQuadrant(mx, my, 2.5 * b)) {
        return true;
      }
    }
    else if (this._itemType == 'T') {
      if (this._toggleWidgetQuadrant(mx, my, 4 * b)) {
        return true;
      }
    }
  }
  
  if (this._view == 'config') {
    // difficulty buttons
    if (this._pointIn(mx, my, 6.25 * b - 8, 2.5 * b - 4, 32, 24)) {
      if (this._difficulty > 1) this._difficulty--;
      return true;
    }
    if (this._pointIn(mx, my, 8.25 * b - 8, 2.5 * b - 4, 32, 24)) {
      if (this._difficulty < 4) this._difficulty++;
      return true;
    }
    // bot row buttons
    var bx = 6 * b;
    for (var i = 0; i < this._bots.length; ++i) {
      var by = 4 * b + 1.5 * b * i;
      var tankLevel = this._bots[i].type;
      if (this._pointIn(mx, my, bx + 0.25 * b - 4, by + 0.25 * b - 4, 32, 24)) {
        if (tankLevel != Tank.Type.BASIC) this._bots[i].type = this._prevBotType(tankLevel);
        return true;
      }
      if (this._pointIn(mx, my, bx + 2.25 * b - 4, by + 0.25 * b - 4, 32, 24)) {
        if (tankLevel != Tank.Type.ARMOR) this._bots[i].type = this._nextBotType(tankLevel);
        return true;
      }
      if (this._pointIn(mx, my, bx + 3.75 * b - 4, by + 0.25 * b - 4, 32, 24)) {
        if (this._bots[i].count > 0) this._bots[i].count--;
        return true;
      }
      if (this._pointIn(mx, my, bx + 5.75 * b - 4, by + 0.25 * b - 4, 32, 24)) {
        if (this._bots[i].count < 99) this._bots[i].count++;
        return true;
      }
    }
  }
  
  if (this._view == 'map') {
    // Item selection icons (click right-side icon to select)
    // left column 32px wide, right column 32px wide (spawns)
    var items = [
      {type: 'X', x: px + b, y: b, w: 32, h: 32},
      {type: 'B', x: px + b, y: 2.5 * b, w: 32, h: 32},
      {type: 'T', x: px + b, y: 4 * b, w: 32, h: 32},
      {type: 'R', x: px + b, y: 5.5 * b, w: 32, h: 32},
      {type: 'S', x: px + b, y: 7 * b, w: 32, h: 32},
      {type: 'F', x: px + b, y: 8.5 * b, w: 32, h: 32},
      {type: 'E', x: px + b, y: 10 * b, w: 32, h: 32},
      {type: 'P1', x: px + 2 * b, y: b, w: 32, h: 32},
      {type: 'P2', x: px + 2 * b, y: 2.5 * b, w: 32, h: 32},
      {type: 'E1', x: px + 2 * b, y: 4 * b, w: 32, h: 32},
      {type: 'E2', x: px + 2 * b, y: 5.5 * b, w: 32, h: 32},
      {type: 'E3', x: px + 2 * b, y: 7 * b, w: 32, h: 32}
    ];
    for (var i = 0; i < items.length; ++i) {
      if (this._pointIn(mx, my, items[i].x, items[i].y, items[i].w, items[i].h)) {
        this._itemType = items[i].type;
        return true;
      }
    }
  }
  return false;
};

// Toggle one 16px quadrant of the active wall tool's 2x2 sample widget.
// The widget sits at (px + b, wY). Returns true when the click landed on it.
AdvancedEditorScene.prototype._toggleWidgetQuadrant = function (mx, my, wY) {
  var x = this._fieldSize + this._block;
  var bits = [0b0001, 0b0010, 0b0100, 0b1000];
  for (var i = 0; i < 4; ++i) {
    var sx = x + (i % 2) * Globals.TILE_SIZE;
    var sy = wY + Math.floor(i / 2) * Globals.TILE_SIZE;
    if (this._pointIn(mx, my, sx, sy, Globals.TILE_SIZE, Globals.TILE_SIZE)) {
      if (this._itemType == 'B') {
        this._brickHex ^= bits[i];
      }
      else {
        this._steelHex ^= bits[i];
      }
      return true;
    }
  }
  return false;
};

AdvancedEditorScene.prototype._botTypes = [Tank.Type.BASIC, Tank.Type.FAST, Tank.Type.POWER, Tank.Type.ARMOR];

AdvancedEditorScene.prototype._nextBotType = function (type) {
  var idx = this._botTypes.indexOf(type);
  return this._botTypes[Math.min(this._botTypes.length - 1, idx + 1)];
};

AdvancedEditorScene.prototype._prevBotType = function (type) {
  var idx = this._botTypes.indexOf(type);
  return this._botTypes[Math.max(0, idx - 1)];
};

AdvancedEditorScene.prototype._onMouseDown = function (e) {
  var pos = this._getMousePos(e);
  var mx = pos.mx;
  var my = pos.my;
  this._mouseX = mx;
  this._mouseY = my;
  if (this._handlePanelClick(mx, my)) {
    return;
  }
  var t = this._cellFromPoint(mx, my);
  if (this._view == 'map' && t != -1) {
    this._pressed = true;
    this._lastPaint = null;
    this._paintAt(mx, my, t);
    this._cursorRow = Math.floor(t / 13);
    this._cursorCol = t % 13;
  }
};

AdvancedEditorScene.prototype._onMouseMove = function (e) {
  var pos = this._getMousePos(e);
  var mx = pos.mx;
  var my = pos.my;
  this._mouseX = mx;
  this._mouseY = my;
  var t = this._cellFromPoint(mx, my);
  if (t != this._t) {
    this._t = t;
  }
  this._subHover = this._hoveredSubTile(mx, my, t);
  if (this._view == 'map' && this._pressed && t != -1) {
    this._paintAt(mx, my, t);
    this._cursorRow = Math.floor(t / 13);
    this._cursorCol = t % 13;
  }
};

AdvancedEditorScene.prototype._onMouseUp = function (e) {
  this._pressed = false;
  var t = this._getCellFromEvent(e);
  if (this._view == 'map' && t != -1) {
    this._cursorRow = Math.floor(t / 13);
    this._cursorCol = t % 13;
  }
};

// Paint the cell under the mouse. Wall tools (B/T) paint at 16px sub-tile
// granularity so a quadrant can be toggled on/off directly; everything else
// stamps the whole 32px cell.
AdvancedEditorScene.prototype._paintAt = function (mx, my, t) {
  if (this._itemType == 'B' || this._itemType == 'T') {
    this._applySubPaint(t, this._quadrantBit(mx, my, t));
  }
  else {
    this._paint(t);
  }
};

// Toggle a single 16px quadrant of a wall cell. Empty cells receive the
// template hex (brickHex/steelHex); existing walls toggle the quadrant under
// the cursor and collapse to CLEAR when the last quadrant is removed.
// _lastPaint de-dupes drags so a held click does not re-toggle.
AdvancedEditorScene.prototype._applySubPaint = function (t, bit) {
  var row = Math.floor(t / 13);
  var col = t % 13;
  var cell = this._grid[row][col];
  var type = this._itemType == 'B' ? Editor.Structure.BRICK : Editor.Structure.STEEL;
  var template = this._itemType == 'B' ? this._brickHex : this._steelHex;

  if (this._lastPaint && this._lastPaint.row == row && this._lastPaint.col == col &&
      (this._lastPaint.kind == 'stamp' || this._lastPaint.bit == bit)) {
    return;
  }

  if (cell.type == type) {
    var hex = cell.hex ^ bit;
    this._grid[row][col] = hex == 0 ?
      {type: Editor.Structure.CLEAR, hex: 0} :
      {type: type, hex: hex};
    this._lastPaint = {row: row, col: col, bit: bit, kind: 'toggle'};
  }
  else {
    this._grid[row][col] = {type: type, hex: template};
    this._lastPaint = {row: row, col: col, bit: bit, kind: 'stamp'};
  }
};

// Bit (0b0001..0b1000) of the 16px quadrant under (mx, my) inside cell t.
AdvancedEditorScene.prototype._quadrantBit = function (mx, my, t) {
  var row = Math.floor(t / 13);
  var col = t % 13;
  var quad = this._subQuadIndex(mx, my, row, col);
  return [0b0001, 0b0010, 0b0100, 0b1000][quad];
};

// Quadrant index 0..3 (row-major) of a point inside a 32px cell.
AdvancedEditorScene.prototype._subQuadIndex = function (mx, my, row, col) {
  var subCol = Math.floor((mx - col * this._block) / Globals.TILE_SIZE);
  var subRow = Math.floor((my - row * this._block) / Globals.TILE_SIZE);
  if (subCol < 0) subCol = 0;
  if (subCol > 1) subCol = 1;
  if (subRow < 0) subRow = 0;
  if (subRow > 1) subRow = 1;
  return subRow * 2 + subCol;
};

// Hovered wall sub-quadrant on the field, when a wall tool is active.
AdvancedEditorScene.prototype._hoveredSubTile = function (mx, my, t) {
  if (this._view != 'map' || t == -1) {
    return null;
  }
  if (this._itemType != 'B' && this._itemType != 'T') {
    return null;
  }
  if (mx >= this._fieldSize || my >= this._fieldSize) {
    return null;
  }
  var row = Math.floor(t / 13);
  var col = t % 13;
  return {row: row, col: col, quad: this._subQuadIndex(mx, my, row, col)};
};

AdvancedEditorScene.prototype._paint = function (t) {
  var row = Math.floor(t / 13);
  var col = t % 13;
  var item = this._getCurrentItem();
  if (item.type == Editor.Structure.BASE) {
    this._removeAll(Editor.Structure.BASE);
    this._grid[row][col] = {type: Editor.Structure.BASE, hex: 0};
  }
  else if (item.type == Editor.Structure.SPAWN1) {
    this._removeAll(Editor.Structure.SPAWN1);
    this._grid[row][col] = {type: Editor.Structure.SPAWN1, hex: 0};
  }
  else if (item.type == Editor.Structure.SPAWN2) {
    this._removeAll(Editor.Structure.SPAWN2);
    this._grid[row][col] = {type: Editor.Structure.SPAWN2, hex: 0};
  }
  else if (item.type == Editor.Structure.ENEMY1) {
    this._removeAll(Editor.Structure.ENEMY1);
    this._grid[row][col] = {type: Editor.Structure.ENEMY1, hex: 0};
  }
  else if (item.type == Editor.Structure.ENEMY2) {
    this._removeAll(Editor.Structure.ENEMY2);
    this._grid[row][col] = {type: Editor.Structure.ENEMY2, hex: 0};
  }
  else if (item.type == Editor.Structure.ENEMY3) {
    this._removeAll(Editor.Structure.ENEMY3);
    this._grid[row][col] = {type: Editor.Structure.ENEMY3, hex: 0};
  }
  else {
    this._grid[row][col] = {type: item.type, hex: item.hex};
  }
};

AdvancedEditorScene.prototype._removeAll = function (type) {
  for (var r = 0; r < 13; ++r) {
    for (var c = 0; c < 13; ++c) {
      if (this._grid[r][c].type == type) {
        this._grid[r][c] = {type: Editor.Structure.CLEAR, hex: 0};
      }
    }
  }
};

AdvancedEditorScene.prototype._getCurrentItem = function () {
  if (this._itemType == 'B') {
    return {type: Editor.Structure.BRICK, hex: this._brickHex};
  }
  else if (this._itemType == 'T') {
    return {type: Editor.Structure.STEEL, hex: this._steelHex};
  }
  else if (this._itemType == 'R') {
    return {type: Editor.Structure.WATER, hex: 0};
  }
  else if (this._itemType == 'S') {
    return {type: Editor.Structure.SNOW, hex: 0};
  }
  else if (this._itemType == 'F') {
    return {type: Editor.Structure.TREES, hex: 0};
  }
  else if (this._itemType == 'E') {
    return {type: Editor.Structure.BASE, hex: 0};
  }
  else if (this._itemType == 'P1') {
    return {type: Editor.Structure.SPAWN1, hex: 0};
  }
  else if (this._itemType == 'P2') {
    return {type: Editor.Structure.SPAWN2, hex: 0};
  }
  else if (this._itemType == 'E1') {
    return {type: Editor.Structure.ENEMY1, hex: 0};
  }
  else if (this._itemType == 'E2') {
    return {type: Editor.Structure.ENEMY2, hex: 0};
  }
  else if (this._itemType == 'E3') {
    return {type: Editor.Structure.ENEMY3, hex: 0};
  }
  return {type: Editor.Structure.CLEAR, hex: 0};
};

// ---- getters for tests ----

AdvancedEditorScene.prototype.getView = function () {
  return this._view;
};

AdvancedEditorScene.prototype.setView = function (view) {
  this._view = view;
};

AdvancedEditorScene.prototype.getGrid = function () {
  return this._grid;
};

AdvancedEditorScene.prototype.getItemType = function () {
  return this._itemType;
};

AdvancedEditorScene.prototype.setItemType = function (type) {
  this._itemType = type;
};

AdvancedEditorScene.prototype.getBots = function () {
  return this._bots;
};

AdvancedEditorScene.prototype.getDifficulty = function () {
  return this._difficulty;
};

AdvancedEditorScene.prototype.getName = function () {
  return this._name;
};

AdvancedEditorScene.prototype.setName = function (name) {
  this._name = name;
};

AdvancedEditorScene.prototype.update = function () {
  this._savedMessage.update();
};

// ---- drawing ----

AdvancedEditorScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#333333";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  if (this._view == 'map') {
    this._drawMapView(ctx);
  }
  else {
    this._drawConfigView(ctx);
  }
  
  this._savedMessage.draw(ctx);
};

AdvancedEditorScene.prototype._drawMapView = function (ctx) {
  this._drawMapGrid(ctx);
  this._drawToolsPanel(ctx);
  this._drawBottomMenu(ctx);
  if (this._showHelp) {
    this._drawHelp(ctx);
  }
  else {
    var cur = this._itemType;
    if (cur == 'E1' || cur == 'E2' || cur == 'E3') {
      EditorFont.draw(ctx, 'enemy spawn: ' + cur + ' (0 cycle)  space place', 0, this._fieldSize + 0.9 * this._block, 1, "#e44437");
    }
    else {
      EditorFont.draw(ctx, 'arrows/space 1-9 item 0-enemy qezx quad c shape n new', 0, this._fieldSize + 0.9 * this._block, 1, "#888");
    }
  }
};

AdvancedEditorScene.prototype._drawHelp = function (ctx) {
  var lines = [
    '1-9: select item (X B T R S F E P1 P2)',
    '0: cycle enemy spawn (E1 E2 E3)',
    'arrows/WASD: move cursor',
    'space/J/enter: paint at cursor',
    'Q E Z X: toggle wall quadrants',
    'C: cycle wall shape',
    'N: new map',
    'B: save',
    '?: show/hide this help',
    'tab: config view, esc: back'
  ];
  ctx.fillStyle = "#000000";
  ctx.fillRect(8, 8, 400, 200);
  ctx.strokeStyle = "#ffffff";
  ctx.strokeRect(8, 8, 400, 200);
  for (var i = 0; i < lines.length; ++i) {
    EditorFont.draw(ctx, lines[i], 16, 20 + i * 18, 1, "#eee");
  }
};

AdvancedEditorScene.prototype._drawMapGrid = function (ctx) {
  var x0 = this._fieldX;
  var y0 = this._fieldY;
  var b = this._block;
  
  ctx.fillStyle = "#000000";
  ctx.fillRect(x0, y0, this._fieldSize, this._fieldSize);
  
  for (var row = 0; row < 13; ++row) {
    for (var col = 0; col < 13; ++col) {
      this._drawCell(ctx, this._grid[row][col], x0 + col * b, y0 + row * b);
    }
  }
  
  var hover = null;
  if (this._t != -1) {
    hover = {row: Math.floor(this._t / 13), col: this._t % 13};
  }
  EditorUI.drawGridLines(ctx, x0, y0, b, hover);
  if (hover) {
    EditorUI.drawHoverCell(ctx, x0, y0, hover.col, hover.row, b);
  }
  // Wall tools highlight the hovered 16px quadrant instead of the whole cell
  if (this._subHover && (this._itemType == 'B' || this._itemType == 'T')) {
    var sh = this._subHover;
    var sx = x0 + sh.col * b + (sh.quad % 2) * Globals.TILE_SIZE;
    var sy = y0 + sh.row * b + Math.floor(sh.quad / 2) * Globals.TILE_SIZE;
    ctx.strokeStyle = "#e91e63";
    ctx.lineWidth = 2;
    ctx.strokeRect(sx, sy, Globals.TILE_SIZE, Globals.TILE_SIZE);
  }
  // Always show keyboard cursor
  EditorUI.drawHoverCell(ctx, x0, y0, this._cursorCol, this._cursorRow, b);
};

AdvancedEditorScene.prototype._drawCell = function (ctx, cell, x, y) {
  if (cell.type == Editor.Structure.BASE) {
    ctx.drawImage(ImageManager.getImage('base'), x, y);
  }
  else if (cell.type == Editor.Structure.SPAWN1) {
    this._drawSpawn(ctx, x, y, "1");
  }
  else if (cell.type == Editor.Structure.SPAWN2) {
    this._drawSpawn(ctx, x, y, "2");
  }
  else if (cell.type == Editor.Structure.ENEMY1) {
    this._drawEnemySpawn(ctx, x, y, "E1");
  }
  else if (cell.type == Editor.Structure.ENEMY2) {
    this._drawEnemySpawn(ctx, x, y, "E2");
  }
  else if (cell.type == Editor.Structure.ENEMY3) {
    this._drawEnemySpawn(ctx, x, y, "E3");
  }
  else if (cell.type == Editor.Structure.WATER) {
    ctx.drawImage(ImageManager.getImage('water_1'), x, y);
  }
  else if (cell.type == Editor.Structure.SNOW) {
    this._drawSnowIcon(ctx, x, y);
  }
  else if (cell.type == Editor.Structure.TREES) {
    ctx.drawImage(ImageManager.getImage('trees'), x, y);
  }
  else if (cell.type == Editor.Structure.BRICK) {
    this._drawWall(ctx, 'wall_brick', cell.hex, x, y);
  }
  else if (cell.type == Editor.Structure.STEEL) {
    this._drawWall(ctx, 'wall_steel', cell.hex, x, y);
  }
};

AdvancedEditorScene.prototype._drawWall = function (ctx, image, hex, x, y) {
  if (hex & 0b0001) ctx.drawImage(ImageManager.getImage(image), x, y);
  if (hex & 0b0010) ctx.drawImage(ImageManager.getImage(image), x + 16, y);
  if (hex & 0b0100) ctx.drawImage(ImageManager.getImage(image), x, y + 16);
  if (hex & 0b1000) ctx.drawImage(ImageManager.getImage(image), x + 16, y + 16);
};

// Tools panel on the right (fc93 positionMap)
AdvancedEditorScene.prototype._drawToolsPanel = function (ctx) {
  var px = this._fieldSize; // 416
  var b = this._block; // 32
  
  // Help '?' button
  EditorUI.drawTextButton(ctx, px + 2.25 * b, 0.25 * b, '?', {
    spreadX: 2, spreadY: 2, textScale: 2
  });
  
  // Current item arrow indicator
  var posMap = {
    X: b, B: 2.5 * b, T: 4 * b, R: 5.5 * b, S: 7 * b, F: 8.5 * b, E: 10 * b,
    P1: b, P2: 2.5 * b, E1: 4 * b, E2: 5.5 * b, E3: 7 * b
  };
  var arrowCol = (this._itemType == 'P1' || this._itemType == 'P2' || this._itemType == 'E1' || this._itemType == 'E2' || this._itemType == 'E3') ? 1.5 : 0.25;
  EditorFont.draw(ctx, '\u2192', px + arrowCol * b, 0.25 * b + posMap[this._itemType], 2, "#E91E63");
  
  // Item icons - left column (terrain/walls)
  ctx.fillStyle = "#000000";
  ctx.fillRect(px + b, b, b, b);
  // Brick / steel samples are drawn by _drawHexAdjustButtons below.
  // Water
  ctx.drawImage(ImageManager.getImage('water_1'), px + b, 5.5 * b);
  // Snow
  this._drawSnowIcon(ctx, px + b, 7 * b);
  // Forest
  ctx.drawImage(ImageManager.getImage('trees'), px + b, 8.5 * b);
  // Eagle
  ctx.drawImage(ImageManager.getImage('base'), px + b, 10 * b);
  
  // Item icons - right column (spawns)
  var rx = px + 2 * b;
  this._drawSpawn(ctx, rx, b, "1");
  this._drawSpawn(ctx, rx, 2.5 * b, "2");
  this._drawEnemySpawn(ctx, rx, 4 * b, "E1");
  this._drawEnemySpawn(ctx, rx, 5.5 * b, "E2");
  this._drawEnemySpawn(ctx, rx, 7 * b, "E3");
  
  this._drawHexAdjustButtons(ctx, px, b);
};

AdvancedEditorScene.prototype._drawSnowIcon = function (ctx, x, y) {
  var img = ImageManager.getImage('snow');
  for (var sy = 0; sy < 2; ++sy) {
    for (var sx = 0; sx < 2; ++sx) {
      ctx.drawImage(img, x + sx * Globals.TILE_SIZE, y + sy * Globals.TILE_SIZE);
    }
  }
};

AdvancedEditorScene.prototype._drawSpawn = function (ctx, x, y, label) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(x, y, Globals.UNIT_SIZE, Globals.UNIT_SIZE);
  ctx.fillStyle = "#96d332";
  ctx.fillRect(x + 3, y + 3, Globals.UNIT_SIZE - 6, Globals.UNIT_SIZE - 6);
  EditorFont.draw(ctx, 'P' + label, x + 6, y + 8, 2, "#000000");
};

AdvancedEditorScene.prototype._drawEnemySpawn = function (ctx, x, y, label) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(x, y, Globals.UNIT_SIZE, Globals.UNIT_SIZE);
  ctx.fillStyle = "#e44437";
  ctx.fillRect(x + 3, y + 3, Globals.UNIT_SIZE - 6, Globals.UNIT_SIZE - 6);
  EditorFont.draw(ctx, label, x + 6, y + 8, 2, "#000000");
};

// 2x2 wall quadrant widgets on the tools panel. Lit quadrants render the
// real wall texture, unset quadrants render as dark empty cells. The widget
// for the active wall tool is interactive (hover highlight + 'f' reset).
AdvancedEditorScene.prototype._drawHexAdjustButtons = function (ctx, px, b) {
  var widgets = [
    {key: 'B', image: 'wall_brick', y: 2.5 * b, hex: this._brickHex},
    {key: 'T', image: 'wall_steel', y: 4 * b, hex: this._steelHex}
  ];
  for (var i = 0; i < widgets.length; ++i) {
    var w = widgets[i];
    var active = this._itemType == w.key;
    this._drawWallWidget(ctx, px + b, w.y, w.image, w.hex, active);
    if (active) {
      EditorUI.drawTextButton(ctx, px + 2.25 * b, w.y + 0.25 * b, 'f', {spreadX: 4});
    }
  }
};

// Draw one 2x2 wall sample (the icon + the quadrant toggle widget).
AdvancedEditorScene.prototype._drawWallWidget = function (ctx, x, y, image, hex, active) {
  var bits = [0b0001, 0b0010, 0b0100, 0b1000];
  for (var i = 0; i < 4; ++i) {
    var sx = x + (i % 2) * Globals.TILE_SIZE;
    var sy = y + Math.floor(i / 2) * Globals.TILE_SIZE;
    if (hex & bits[i]) {
      ctx.drawImage(ImageManager.getImage(image), sx, sy);
    }
    else {
      ctx.fillStyle = "#141414";
      ctx.fillRect(sx, sy, Globals.TILE_SIZE, Globals.TILE_SIZE);
      ctx.strokeStyle = "rgba(255,255,255,0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy, Globals.TILE_SIZE, Globals.TILE_SIZE);
    }
    if (active && this._widgetHover(i, x, y)) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillRect(sx, sy, Globals.TILE_SIZE, Globals.TILE_SIZE);
    }
  }
  if (active) {
    ctx.strokeStyle = "#e91e63";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 1, y - 1, Globals.UNIT_SIZE + 2, Globals.UNIT_SIZE + 2);
  }
};

// True when the mouse is over quadrant i of a 2x2 widget at (x, y).
AdvancedEditorScene.prototype._widgetHover = function (i, x, y) {
  if (this._mouseX == -1 || this._mouseY == -1) {
    return false;
  }
  if (this._mouseX < x || this._mouseX > x + Globals.UNIT_SIZE ||
      this._mouseY < y || this._mouseY > y + Globals.UNIT_SIZE) {
    return false;
  }
  var col = Math.floor((this._mouseX - x) / Globals.TILE_SIZE);
  var row = Math.floor((this._mouseY - y) / Globals.TILE_SIZE);
  if (col < 0) col = 0;
  if (col > 1) col = 1;
  if (row < 0) row = 0;
  if (row > 1) row = 1;
  return row * 2 + col == i;
};

AdvancedEditorScene.prototype._drawBottomMenu = function (ctx) {
  var y = this._fieldSize + 0.5 * this._block;
  var b = this._block;
  EditorUI.drawTextButton(ctx, 0.5 * b, y, 'config', {
    selected: this._view == 'config'
  });
  EditorUI.drawTextButton(ctx, 4 * b, y, 'map', {
    selected: this._view == 'map'
  });
  EditorUI.drawTextButton(ctx, 10 * b, y, 'save', {});
  EditorUI.drawTextButton(ctx, 12.5 * b, y, 'back', {});
};

AdvancedEditorScene.prototype._drawConfigView = function (ctx) {
  var b = this._block;
  
  EditorUI.drawGridLines(ctx, 0, 0, b, null);
  
  ctx.fillStyle = "#ffffff";
  EditorFont.draw(ctx, 'name:', 3.5 * b, 1 * b, 2, "#ccc");
  // name text input
  var inputX = 6.5 * b;
  var inputY = b;
  ctx.strokeStyle = "#e91e63";
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.2;
  ctx.strokeRect(inputX - 4, inputY - 4, 12 * 16 + 8, 0.5 * b + 8);
  ctx.globalAlpha = 1;
  EditorFont.draw(ctx, this._name, inputX, inputY, 2, "#ccc");
  if (this._nameFocus) {
    ctx.fillStyle = "orange";
    ctx.fillRect(inputX + this._name.length * 16, inputY - 3, 2, 22);
  }
  
  // difficulty
  EditorFont.draw(ctx, 'difficulty:', 0.5 * b, 2.5 * b, 2, "#ccc");
  EditorUI.drawTextButton(ctx, 6.25 * b, 2.5 * b, '-', {disabled: this._difficulty <= 1});
  EditorFont.draw(ctx, String(this._difficulty), 7.25 * b, 2.5 * b, 2, "#ccc");
  EditorUI.drawTextButton(ctx, 8.25 * b, 2.5 * b, '+', {disabled: this._difficulty >= 4});
  
  // bots
  EditorFont.draw(ctx, 'bots:', 2 * b, 4 * b, 2, "#ccc");
  var tankImages = ['tank_basic_up_c0_t1', 'tank_fast_up_c0_t1', 'tank_power_up_c0_t1', 'tank_armor_up_c0_t1'];
  var bx = 6 * b;
  for (var i = 0; i < this._bots.length; ++i) {
    var by = 4 * b + 1.5 * b * i;
    EditorUI.drawTextButton(ctx, bx + 0.25 * b, by + 0.25 * b, '\u2190', {
      spreadX: 2, spreadY: 2, disabled: this._bots[i].type == Tank.Type.BASIC
    });
    ctx.drawImage(ImageManager.getImage(tankImages[i]), bx + b, by);
    EditorUI.drawTextButton(ctx, bx + 2.25 * b, by + 0.25 * b, '\u2192', {
      spreadX: 2, spreadY: 2, disabled: this._bots[i].type == Tank.Type.ARMOR
    });
    EditorUI.drawTextButton(ctx, bx + 3.75 * b, by + 0.25 * b, '-', {
      spreadX: 2, spreadY: 2, disabled: this._bots[i].count <= 0
    });
    EditorFont.draw(ctx, String(this._bots[i].count).padStart(2, '0'), bx + 4.5 * b, by + 0.25 * b, 2, "#ccc");
    EditorUI.drawTextButton(ctx, bx + 5.75 * b, by + 0.25 * b, '+', {
      spreadX: 2, spreadY: 2, disabled: this._bots[i].count >= 99
    });
  }
  
  // total
  EditorFont.draw(ctx, 'total:', bx + 0.25 * b, 4 * b + 6 * 1.5 * b, 2, "#ccc");
  EditorFont.draw(ctx, String(Editor.botsCount(this._bots)).padStart(2, '0'),
    bx + 4.5 * b, 4 * b + 6 * 1.5 * b, 2, "#ccc");
  
  this._drawBottomMenu(ctx);
};

// ---- keyboard ----

AdvancedEditorScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

AdvancedEditorScene.prototype.keyPressed = function (key) {
  if (this._view == 'map') {
    this._mapKeyPressed(key);
  }
  else {
    this._configKeyPressed(key);
  }
};

AdvancedEditorScene.prototype._mapKeyPressed = function (key) {
  if (key == Keyboard.Key.TAB) {
    this._view = 'config';
  }
  else if (key == Keyboard.Key.ESC) {
    this._sceneManager[this._backMethod]();
  }
  else if (key == Keyboard.Key.N) {
    this._newMap();
  }
  else if (key == Keyboard.Key.UP || key == Keyboard.Key.W) {
    this._cursorRow = Math.max(0, this._cursorRow - 1);
  }
  else if (key == Keyboard.Key.DOWN || key == Keyboard.Key.S) {
    this._cursorRow = Math.min(12, this._cursorRow + 1);
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    this._cursorCol = Math.max(0, this._cursorCol - 1);
  }
  else if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    this._cursorCol = Math.min(12, this._cursorCol + 1);
  }
  else if (key == Keyboard.Key.SPACE || key == Keyboard.Key.J || key == Keyboard.Key.ENTER) {
    this._paint(this._cursorRow * 13 + this._cursorCol);
  }
  else if (key == Keyboard.Key.Q) {
    this._toggleHex(0b0001);
  }
  else if (key == Keyboard.Key.E) {
    this._toggleHex(0b0010);
  }
  else if (key == Keyboard.Key.Z) {
    this._toggleHex(0b0100);
  }
  else if (key == Keyboard.Key.X) {
    this._toggleHex(0b1000);
  }
  else if (key == Keyboard.Key.C) {
    this._cycleHexShape();
  }
  else if (key == Keyboard.Key.SLASH) {
    this._showHelp = !this._showHelp;
  }
  else if (key >= 48 && key <= 57) {
    this._selectItemByNumber(key - 48);
  }
};

AdvancedEditorScene.prototype._toggleHelp = function () {
  this._showHelp = !this._showHelp;
};

AdvancedEditorScene.prototype._toggleHex = function (bit) {
  if (this._itemType == 'B') {
    this._brickHex ^= bit;
  }
  else if (this._itemType == 'T') {
    this._steelHex ^= bit;
  }
};

AdvancedEditorScene.prototype._cycleHexShape = function () {
  var shapes = [0xf, 0x3, 0xc, 0x5, 0xa, 0x1, 0x2, 0x4, 0x8, 0x0];
  if (this._itemType == 'B') {
    var idx = shapes.indexOf(this._brickHex);
    this._brickHex = shapes[(idx + 1) % shapes.length];
  }
  else if (this._itemType == 'T') {
    var idx2 = shapes.indexOf(this._steelHex);
    this._steelHex = shapes[(idx2 + 1) % shapes.length];
  }
};

AdvancedEditorScene.prototype._configKeyPressed = function (key) {
  if (key == Keyboard.Key.TAB) {
    this._view = 'map';
  }
  else if (key == Keyboard.Key.ESC) {
    this._sceneManager[this._backMethod]();
  }
  else if (key == Keyboard.Key.UP || key == Keyboard.Key.W) {
    this._botIndex = Math.max(0, this._botIndex - 1);
  }
  else if (key == Keyboard.Key.DOWN || key == Keyboard.Key.S) {
    this._botIndex = Math.min(this._bots.length - 1, this._botIndex + 1);
  }
  else if (key == Keyboard.Key.LEFT || key == Keyboard.Key.A) {
    if (this._nameFocus) {
      this._name = this._name.slice(0, this._name.length - 1);
    }
    else {
      this._bots[this._botIndex].count = Math.max(0, this._bots[this._botIndex].count - 1);
    }
  }
  else if (key == Keyboard.Key.RIGHT || key == Keyboard.Key.D) {
    if (this._nameFocus) {
      if (this._name.length < 12) {
        this._name += 'a';
      }
    }
    else {
      this._bots[this._botIndex].count = Math.min(99, this._bots[this._botIndex].count + 1);
    }
  }
  else if (key == Keyboard.Key.B) {
    this._save();
  }
};

AdvancedEditorScene.prototype._selectItemByNumber = function (num) {
  if (num == 1) this._itemType = 'X';
  else if (num == 2) this._itemType = 'B';
  else if (num == 3) this._itemType = 'T';
  else if (num == 4) this._itemType = 'R';
  else if (num == 5) this._itemType = 'S';
  else if (num == 6) this._itemType = 'F';
  else if (num == 7) this._itemType = 'E';
  else if (num == 8) this._itemType = 'P1';
  else if (num == 9) this._itemType = 'P2';
  else if (num == 0) {
    // cycle enemy spawn points E1 -> E2 -> E3
    if (this._itemType == 'E1') this._itemType = 'E2';
    else if (this._itemType == 'E2') this._itemType = 'E3';
    else this._itemType = 'E1';
  }
};

AdvancedEditorScene.prototype._newMap = function () {
  this._grid = Editor.defaultGrid();
};

AdvancedEditorScene.prototype._save = function () {
  var map = Editor.serializeGrid(this._grid);
  var tanks = Editor.serializeBots(this._bots);
  var name = MapStorage.saveMapWithTanks(map, tanks);
  this._name = name;
  this._savedMessage.show(name);
};
