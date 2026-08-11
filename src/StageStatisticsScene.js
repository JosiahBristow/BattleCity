function StageStatisticsScene(sceneManager, stage, player, gameOver, player2) {
  var self = this;
  
  this._sceneManager = sceneManager;
  this._stage = stage;
  this._player = player;
  this._player2 = player2;
  this._gameOver = gameOver;
  
  this._script = new Script();
  
  this._drawTotal = false;
  
  this._playerColumns = [];
  var players = [this._player];
  if (this._player2) {
    players.push(this._player2);
  }
  for (var i = 0; i < players.length; ++i) {
    this._playerColumns.push({
      basicTankPoints: new StageStatisticsPoints(100, players[i].getTanks(Tank.Type.BASIC), this._script),
      fastTankPoints: new StageStatisticsPoints(200, players[i].getTanks(Tank.Type.FAST), this._script),
      powerTankPoints: new StageStatisticsPoints(300, players[i].getTanks(Tank.Type.POWER), this._script),
      armorTankPoints: new StageStatisticsPoints(400, players[i].getTanks(Tank.Type.ARMOR), this._script),
      points: players[i].getScore(),
      tanksCount: players[i].getTanksCount()
    });
  }
  
  this._script.enqueue(new Delay(this._script, 30));
  this._script.enqueue({execute: function () { self._playerColumns.forEach(function (c) { c.basicTankPoints.show(); }); }});
  this._script.enqueue(this._playerColumns[0].basicTankPoints);
  if (this._playerColumns.length > 1) {
    this._script.enqueue(this._playerColumns[1].basicTankPoints);
  }
  this._script.enqueue({execute: function () { self._playerColumns.forEach(function (c) { c.fastTankPoints.show(); }); }});
  this._script.enqueue(this._playerColumns[0].fastTankPoints);
  if (this._playerColumns.length > 1) {
    this._script.enqueue(this._playerColumns[1].fastTankPoints);
  }
  this._script.enqueue({execute: function () { self._playerColumns.forEach(function (c) { c.powerTankPoints.show(); }); }});
  this._script.enqueue(this._playerColumns[0].powerTankPoints);
  if (this._playerColumns.length > 1) {
    this._script.enqueue(this._playerColumns[1].powerTankPoints);
  }
  this._script.enqueue({execute: function () { self._playerColumns.forEach(function (c) { c.armorTankPoints.show(); }); }});
  this._script.enqueue(this._playerColumns[0].armorTankPoints);
  if (this._playerColumns.length > 1) {
    this._script.enqueue(this._playerColumns[1].armorTankPoints);
  }
  this._script.enqueue({execute: function () { self._drawTotal = true; }});
  this._script.enqueue(new Delay(this._script, 60));
  this._script.enqueue({execute: function () {
    self._player.resetTanks();
    if (self._player2) {
      self._player2.resetTanks();
    }
    if (gameOver) {
      sceneManager.toGameOverScene();
    }
    else {
      var playerCount = self._player2 ? 2 : 1;
      sceneManager.toGameScene(stage + 1, player, playerCount);
    }
  }});
};

StageStatisticsScene.prototype.update = function () {
  this._script.update();
};

StageStatisticsScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "#feac4e";
  ctx.fillText("20000", 306, 46);
  
  ctx.fillStyle = "#ffffff";
  ctx.fillText(Language.translate('STAGE') + " " + ("" + this._stage).lpad(" ", 2), 194, 78);
  
  var self = this;
  this._playerColumns.forEach(function (column, index) {
    var x = index == 0 ? 26 : 260;
    
    ctx.drawImage(ImageManager.getImage('roman_one_red'), x, 96);
    
    ctx.fillStyle = "#e44437";
    ctx.fillText(Language.translate('-PLAYER'), x + 14, 110);
    
    ctx.fillStyle = "#feac4e";
    ctx.fillText(("" + column.points).lpad(" ", 7), x + 14, 142);
    
    ctx.fillStyle = "#ffffff";
    
    ctx.fillText(Language.translate('PTS'), x + 82, 190);
    column.basicTankPoints.draw(ctx, x + 2, 190);
    ctx.drawImage(ImageManager.getImage('tank_basic_up_c0_t1'), x + 160, 169);
    ctx.drawImage(ImageManager.getImage('arrow'), x + 145, 176);
    
    ctx.fillText(Language.translate('PTS'), x + 82, 238);
    column.fastTankPoints.draw(ctx, x + 2, 238);
    ctx.drawImage(ImageManager.getImage('tank_fast_up_c0_t1'), x + 160, 217);
    ctx.drawImage(ImageManager.getImage('arrow'), x + 145, 224);
    
    ctx.fillText(Language.translate('PTS'), x + 82, 286);
    column.powerTankPoints.draw(ctx, x + 2, 286);
    ctx.drawImage(ImageManager.getImage('tank_power_up_c0_t1'), x + 160, 265);
    ctx.drawImage(ImageManager.getImage('arrow'), x + 145, 272);
    
    ctx.fillText(Language.translate('PTS'), x + 82, 334);
    column.armorTankPoints.draw(ctx, x + 2, 334);
    ctx.drawImage(ImageManager.getImage('tank_armor_up_c0_t1'), x + 160, 313);
    ctx.drawImage(ImageManager.getImage('arrow'), x + 145, 320);
    
    ctx.fillText(Language.translate('TOTAL'), x + 50, 366);
    ctx.drawImage(ImageManager.getImage('white_line'), x + 100, 346);
    if (self._drawTotal) {
      ctx.fillText(("" + column.tanksCount).lpad(" ", 2), x + 142, 366);
    }
  });
};
