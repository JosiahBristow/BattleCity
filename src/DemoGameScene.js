DemoGameScene.DEMO_MAP = (function () {
  var B = {type: 'brick', hex: 0xf};
  var T = {type: 'steel', hex: 0xf};
  var X = {type: 'clear', hex: 0};
  var E = {type: 'base', hex: 0};
  var P1 = {type: 'spawn1', hex: 0};
  var P2 = {type: 'spawn2', hex: 0};
  var EN1 = {type: 'enemy1', hex: 0};
  var EN2 = {type: 'enemy2', hex: 0};
  var EN3 = {type: 'enemy3', hex: 0};

  var grid = Editor.createEmptyGrid();

  // Row 0: enemy spawns at top corners and center
  grid[0][0] = EN1;
  grid[0][6] = EN2;
  grid[0][12] = EN3;

  // Row 2: "BATTLE" text pattern (brick row)
  for (var c = 1; c <= 11; c++) {
    grid[2][c] = {type: 'brick', hex: 0xf};
  }

  // Row 4: "CITY" text pattern (brick row, centered)
  for (var c2 = 3; c2 <= 9; c2++) {
    grid[4][c2] = {type: 'brick', hex: 0xf};
  }

  // Row 8: brick at far corners
  grid[8][0] = {type: 'brick', hex: 0xf};
  grid[8][1] = {type: 'brick', hex: 0xf};
  grid[8][11] = {type: 'brick', hex: 0xf};
  grid[8][12] = {type: 'brick', hex: 0xf};

  // Row 9: brick expanding inward
  for (var c3 = 0; c3 <= 3; c3++) grid[9][c3] = {type: 'brick', hex: 0xf};
  for (var c4 = 9; c4 <= 12; c4++) grid[9][c4] = {type: 'brick', hex: 0xf};

  // Row 10: steel on far edges + brick expanding
  for (var c5 = 0; c5 <= 1; c5++) grid[10][c5] = {type: 'steel', hex: 0xf};
  for (var c6 = 2; c6 <= 4; c6++) grid[10][c6] = {type: 'brick', hex: 0xf};
  for (var c7 = 8; c7 <= 10; c7++) grid[10][c7] = {type: 'brick', hex: 0xf};
  for (var c8 = 11; c8 <= 12; c8++) grid[10][c8] = {type: 'steel', hex: 0xf};

  // Row 11: steel expanding + brick near base
  for (var c9 = 0; c9 <= 2; c9++) grid[11][c9] = {type: 'steel', hex: 0xf};
  for (var c10 = 3; c10 <= 5; c10++) grid[11][c10] = {type: 'brick', hex: 0xf};
  for (var c11 = 7; c11 <= 9; c11++) grid[11][c11] = {type: 'brick', hex: 0xf};
  for (var c12 = 10; c12 <= 12; c12++) grid[11][c12] = {type: 'steel', hex: 0xf};

  // Row 12: player spawns + base + brick fortn
  grid[12][0] = P1;
  for (var cf = 5; cf <= 6; cf++) grid[12][cf] = {type: 'brick', hex: 0xf};
  grid[12][6] = E;
  for (var cg = 7; cg <= 8; cg++) grid[12][cg] = {type: 'brick', hex: 0xf};
  grid[12][12] = P2;

  return Editor.serializeGrid(grid);
})();

DemoGameScene.DEMO_DURATION = 3000;

function DemoGameScene(sceneManager) {
  var self = this;
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);

  this._curtain = new Curtain();
  this._exit = false;
  this._frameCount = 0;

  this._stageConfig = {
    name: 'DEMO',
    map: DemoGameScene.DEMO_MAP,
    tanks: [
      Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.BASIC,
      Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.BASIC,
      Tank.Type.BASIC, Tank.Type.BASIC, Tank.Type.FAST, Tank.Type.FAST, Tank.Type.FAST,
      Tank.Type.POWER, Tank.Type.POWER, Tank.Type.ARMOR, Tank.Type.ARMOR, Tank.Type.ARMOR
    ]
  };

  this._level = new Level(sceneManager, 1, undefined, 3, this._stageConfig, true);

  this._script = new Script();
  this._script.enqueue({update: function () {
    self._curtain.fall();
    if (self._curtain.isFallen()) {
      self._script.actionCompleted();
    }
  }});
  this._script.enqueue({execute: function () {
    self._level.show();
  }});
  this._script.enqueue({update: function () {
    self._curtain.rise();
    if (self._curtain.isRisen()) {
      self._script.actionCompleted();
    }
  }});
  this._script.enqueue(this._level);
}

DemoGameScene.prototype.update = function () {
  if (this._exit) {
    return;
  }
  this._frameCount++;
  if (this._frameCount >= DemoGameScene.DEMO_DURATION) {
    this._sceneManager.toMainMenuScene(true);
    this._exit = true;
    return;
  }
  this._script.update();
};

DemoGameScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  this._level.draw(ctx);
  this._curtain.draw(ctx);
};

DemoGameScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this._exit = true;
    this._sceneManager.toMainMenuScene(true);
  }
};