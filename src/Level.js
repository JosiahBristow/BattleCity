function Level(sceneManager, stageNumber, player, playerCount, stageConfig) {
  Gamefield.call(this, sceneManager);
  
  var self = this;
  
  this._eventManager.addSubscriber(this, [
    BaseExplosion.Event.DESTROYED,
    Player.Event.OUT_OF_LIVES,
    EnemyFactory.Event.LAST_ENEMY_DESTROYED,
    Pause.Event.QUIT,
    Tank.Event.CREATED
  ]);
  
  this._visible = false;
  this._stage = stageNumber;
  this._stageConfig = stageConfig || null;
  this._playerCount = playerCount || 1;
  
  var customMap = null;
  if (this._stageConfig && this._stageConfig.map) {
    customMap = this._stageConfig.map;
  }
  else if (stageNumber == 1 && MapStorage.usingCustomMap) {
    customMap = MapStorage.load();
  }
  this._enemySpawns = this._parseEnemySpawns(customMap);
  if (this._enemySpawns.length == 0) {
    this._enemySpawns = [
      new Point(this._x + 6 * Globals.UNIT_SIZE, this._y),
      new Point(this._x + 12 * Globals.UNIT_SIZE, this._y),
      new Point(this._x, this._y),
    ];
  }
  
  var player1KeyMap = {
    left: Keyboard.Key.A,
    right: Keyboard.Key.D,
    up: Keyboard.Key.W,
    down: Keyboard.Key.S
  };

  if (Globals.IS_TOUCH) {
    player1KeyMap = {
      left: Keyboard.Key.LEFT,
      right: Keyboard.Key.RIGHT,
      up: Keyboard.Key.UP,
      down: Keyboard.Key.DOWN
    };
  }
  
  new PlayerTankControllerFactory(this._eventManager, 1, player1KeyMap, Keyboard.Key.J);
  
  var p1Spawn = this._parseSpawn(customMap, 'Player1');
  var p2Spawn = this._parseSpawn(customMap, 'Player2');
  
  this._playerTankFactory = new PlayerTankFactory(this._eventManager, 1);
  this._playerTankFactory.setAppearPosition(p1Spawn || new Point(this._x + 4 * Globals.UNIT_SIZE, this._y + 12 * Globals.UNIT_SIZE));
  this._playerTankFactory.create();

  this._aiControllersContainer = new AITankControllerContainer(this._eventManager);

  this._player2TankFactory = null;
  if (this._playerCount == 2 || this._playerCount == 3) {
    var p2IsAI = this._playerCount == 3;
    if (!p2IsAI) {
      var player2KeyMap = {
        left: Keyboard.Key.LEFT,
        right: Keyboard.Key.RIGHT,
        up: Keyboard.Key.UP,
        down: Keyboard.Key.DOWN
      };
      new PlayerTankControllerFactory(this._eventManager, 2, player2KeyMap, Keyboard.Key.SLASH);
    }
    else {
      this._aiTeammateControllerFactory = new AITeammateControllerFactory(this._eventManager, this._spriteContainer);
    }
    
    this._player2TankFactory = new PlayerTankFactory(this._eventManager, 2);
    this._player2TankFactory.setAppearPosition(p2Spawn || new Point(this._x + 8 * Globals.UNIT_SIZE, this._y + 12 * Globals.UNIT_SIZE));
    this._player2TankFactory.create();
  }

  new BulletFactory(this._eventManager);
  new BulletExplosionFactory(this._eventManager);
  new TankExplosionFactory(this._eventManager);
  new BaseExplosionFactory(this._eventManager);
  new PointsFactory(this._eventManager);
  this._freezeTimer = new FreezeTimer(this._eventManager);
  
  this._aiTankControllerFactory = new AITankControllerFactory(this._eventManager, this._spriteContainer);
  
  if (this._playerCount == 3 && !this._aiTeammateControllerFactory) {
    this._aiTeammateControllerFactory = new AITeammateControllerFactory(this._eventManager, this._spriteContainer);
  }

  this._enemyFactory = new EnemyFactory(this._eventManager);
  this._enemyFactory.setPositions(this._enemySpawns);
  
  this._enemyFactoryView = new EnemyFactoryView(this._enemyFactory);
  
  this._createPowerUpFactory();
  
  var baseWallBuilder = new BaseWallBuilder();
  baseWallBuilder.setWallPositions([
    new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 25 * Globals.TILE_SIZE),
    new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 24 * Globals.TILE_SIZE),
    new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 12 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 13 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 24 * Globals.TILE_SIZE),
    new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 25 * Globals.TILE_SIZE),
  ]);
  baseWallBuilder.setSpriteContainer(this._spriteContainer);
  
  var powerUpHandler = new PowerUpHandler(this._eventManager);
  powerUpHandler.setSpriteContainer(this._spriteContainer);
  
  this._shovelHandler = new ShovelHandler(this._eventManager);
  this._shovelHandler.setBaseWallBuilder(baseWallBuilder);
  
  this._pause = new Pause(this._eventManager);
  
  this._player = player === undefined ? new Player(1) : player;
  this._player.setEventManager(this._eventManager);
  
  this._player2 = null;
  if (this._playerCount == 2 || this._playerCount == 3) {
    this._player2 = new Player(2);
    this._player2.setEventManager(this._eventManager);
  }
  
  this._livesView = new LivesView(this._player, this._player2);
  
  this._gameOverMessage = new GameOverMessage();
  
  this._gameOverScript = new Script();
  this._gameOverScript.setActive(false);
  this._gameOverScript.enqueue(new MoveFn(this._gameOverMessage, 'y', 213, 100, this._gameOverScript));
  this._gameOverScript.enqueue(new Delay(this._gameOverScript, 50));
  this._gameOverScript.enqueue({execute: function () { sceneManager.toStageStatisticsScene(stageNumber, self._player, true, self._player2); }});
  
  this._levelTransitionScript = new Script();
  this._levelTransitionScript.setActive(false);
  this._levelTransitionScript.enqueue(new Delay(this._levelTransitionScript, 200));
  this._levelTransitionScript.enqueue({execute: function () { sceneManager.toStageStatisticsScene(stageNumber, self._player, false, self._player2); }});
  
  this._loadStage(this._stage);
}

Level.subclass(Gamefield);

Level.prototype.update = function () {
  Gamefield.prototype.update.call(this);
  this._enemyFactory.update();
  this._aiControllersContainer.update();
  this._freezeTimer.update();
  this._shovelHandler.update();
  this._pause.update();
  this._gameOverScript.update();
  this._levelTransitionScript.update();
};

Level.prototype.draw = function (ctx) {
  if (!this._visible) {
    return;
  }
  Gamefield.prototype.draw.call(this, ctx);
  this._enemyFactoryView.draw(ctx);
  this._pause.draw(ctx);
  this._livesView.draw(ctx);
  this._drawFlag(ctx);
  this._gameOverMessage.draw(ctx);
};

Level.prototype.show = function () {
  this._visible = true;
};

Level.prototype.notify = function (event) {
  if (event.name == BaseExplosion.Event.DESTROYED) {
    this._gameOverScript.setActive(true);
    this._pause.setActive(false);
  }
  else if (event.name == Player.Event.OUT_OF_LIVES) {
    if (event.player === this._player) {
      this._playerTankFactory.setActive(false);
    }
    else if (event.player === this._player2) {
      if (this._player2TankFactory) {
        this._player2TankFactory.setActive(false);
      }
    }
    var p1Dead = this._player.getLives() == 0;
    var p2Dead = !this._player2 || this._player2.getLives() == 0;
    if (p1Dead && p2Dead) {
      this._gameOverScript.setActive(true);
      this._pause.setActive(false);
    }
  }
  else if (event.name == EnemyFactory.Event.LAST_ENEMY_DESTROYED) {
    this._levelTransitionScript.setActive(true);
  }
  else if (event.name == Pause.Event.QUIT) {
    this._pause.setActive(false);
    this._sceneManager.toMainMenuScene(true);
  }
  else if (event.name == Tank.Event.CREATED) {
    event.tank.setSpriteContainer(this._spriteContainer);
  }
};

Level.prototype._parseSpawn = function (mapText, marker) {
  if (!mapText) {
    return null;
  }
  var re = new RegExp(marker + '\\(' + '(\\d+),(\\d+)\\)');
  var matches = mapText.match(re);
  if (!matches) {
    return null;
  }
  return new Point(parseInt(matches[1]), parseInt(matches[2]));
};

Level.prototype._parseEnemySpawns = function (mapText) {
  var result = [];
  if (!mapText) {
    return result;
  }
  for (var i = 1; i <= 3; ++i) {
    var p = this._parseSpawn(mapText, 'Enemy' + i);
    if (p) {
      result.push(p);
    }
  }
  return result;
};

Level.prototype._stripSpawns = function (mapText) {
  if (!mapText) {
    return mapText;
  }
  var cleaned = mapText.replace(/Player[12]\(\d+,\d+\)/g, '');
  cleaned = cleaned.replace(/Enemy[123]\(\d+,\d+\)/g, '');
  cleaned = cleaned.replace(/;+/g, ';').replace(/^;/, '').replace(/;$/, '');
  return cleaned;
};

Level.prototype._loadStage = function (stageNumber) {
  var stage;
  if (this._stageConfig) {
    stage = {
      map: this._stageConfig.map,
      tanks: this._stageConfig.tanks
    };
  }
  else if (stageNumber == 1 && MapStorage.usingCustomMap) {
    var savedTanks = MapStorage.loadTanks();
    stage = {
      map: MapStorage.load(),
      tanks: savedTanks || Globals.stages[0].tanks
    };
    MapStorage.deactivate();
  }
  else {
    stage = Globals.stages[(stageNumber - 1) % Globals.stages.length];
  }
  
  var serializer = new SpriteSerializer(this._eventManager);
  serializer.unserializeSprites(this._stripSpawns(stage.map));
  
  if (this._enemySpawns && this._enemySpawns.length > 0) {
    this._enemyFactory.setPositions(this._enemySpawns);
  }
  
  this._enemyFactory.setEnemies(stage.tanks);
};

Level.prototype._createPowerUpFactory = function () {
  var powerUpFactory = new PowerUpFactory(this._eventManager);
  
  var powerUpCol1X = this._x + Globals.UNIT_SIZE + 15;
  var powerUpCol2X = this._x + 4 * Globals.UNIT_SIZE + 15;
  var powerUpCol3X = this._x + 7 * Globals.UNIT_SIZE + 15;
  var powerUpCol4X = this._x + 10 * Globals.UNIT_SIZE + 15;
  
  var powerUpRow1Y = this._y + Globals.UNIT_SIZE + 17;
  var powerUpRow2Y = this._y + 4 * Globals.UNIT_SIZE + 17;
  var powerUpRow3Y = this._y + 7 * Globals.UNIT_SIZE + 17;
  var powerUpRow4Y = this._y + 10 * Globals.UNIT_SIZE + 17;
  
  powerUpFactory.setPositions([
    new Point(powerUpCol1X, powerUpRow1Y),
    new Point(powerUpCol2X, powerUpRow1Y),
    new Point(powerUpCol3X, powerUpRow1Y),
    new Point(powerUpCol4X, powerUpRow1Y),
    
    new Point(powerUpCol1X, powerUpRow2Y),
    new Point(powerUpCol2X, powerUpRow2Y),
    new Point(powerUpCol3X, powerUpRow2Y),
    new Point(powerUpCol4X, powerUpRow2Y),
    
    new Point(powerUpCol1X, powerUpRow3Y),
    new Point(powerUpCol2X, powerUpRow3Y),
    new Point(powerUpCol3X, powerUpRow3Y),
    new Point(powerUpCol4X, powerUpRow3Y),
    
    new Point(powerUpCol1X, powerUpRow4Y),
    new Point(powerUpCol2X, powerUpRow4Y),
    new Point(powerUpCol3X, powerUpRow4Y),
    new Point(powerUpCol4X, powerUpRow4Y),
  ]);
};

Level.prototype._drawFlag = function (ctx) {
  ctx.drawImage(ImageManager.getImage('flag'), 464, 352);
  
  ctx.fillStyle = "black";
  ctx.fillText(("" + this._stage).lpad(" ", 2), 466, 398);
};
