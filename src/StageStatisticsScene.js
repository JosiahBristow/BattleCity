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
      basicTankPoints: new StageStatisticsPoints(
        100,
        players[i].getTanks(Tank.Type.BASIC),
        this._script,
      ),
      fastTankPoints: new StageStatisticsPoints(
        200,
        players[i].getTanks(Tank.Type.FAST),
        this._script,
      ),
      powerTankPoints: new StageStatisticsPoints(
        300,
        players[i].getTanks(Tank.Type.POWER),
        this._script,
      ),
      armorTankPoints: new StageStatisticsPoints(
        400,
        players[i].getTanks(Tank.Type.ARMOR),
        this._script,
      ),
      points: players[i].getScore(),
      tanksCount: players[i].getTanksCount(),
    });
  }

  this._script.enqueue(new Delay(this._script, 30));

  if (this._player2) {
    this._animateTwoPlayers();
  } else {
    this._animateOnePlayer();
  }

  this._script.enqueue({
    execute: function () {
      self._drawTotal = true;
    },
  });
  this._script.enqueue(new Delay(this._script, 60));
  this._script.enqueue({
    execute: function () {
      self._player.resetTanks();
      if (self._player2) {
        self._player2.resetTanks();
      }
      if (gameOver) {
        sceneManager.toGameOverScene();
      } else {
        var playerCount = self._player2 ? 2 : 1;
        sceneManager.toGameScene(stage + 1, player, playerCount);
      }
    },
  });
}

StageStatisticsScene.prototype.update = function () {
  this._script.update();
};

StageStatisticsScene.prototype._animateOnePlayer = function () {
  var self = this;
  this._script.enqueue({
    execute: function () {
      self._playerColumns.forEach(function (c) {
        c.basicTankPoints.show();
      });
    },
  });
  this._script.enqueue(this._playerColumns[0].basicTankPoints);
  this._script.enqueue({
    execute: function () {
      self._playerColumns.forEach(function (c) {
        c.fastTankPoints.show();
      });
    },
  });
  this._script.enqueue(this._playerColumns[0].fastTankPoints);
  this._script.enqueue({
    execute: function () {
      self._playerColumns.forEach(function (c) {
        c.powerTankPoints.show();
      });
    },
  });
  this._script.enqueue(this._playerColumns[0].powerTankPoints);
  this._script.enqueue({
    execute: function () {
      self._playerColumns.forEach(function (c) {
        c.armorTankPoints.show();
      });
    },
  });
  this._script.enqueue(this._playerColumns[0].armorTankPoints);
};

StageStatisticsScene.prototype._animateTwoPlayers = function () {
  var self = this;
  var column1 = this._playerColumns[0];
  var column2 = this._playerColumns[1];

  this._animateTwoPlayerRow(column1.basicTankPoints, column2.basicTankPoints);
  this._animateTwoPlayerRow(column1.fastTankPoints, column2.fastTankPoints);
  this._animateTwoPlayerRow(column1.powerTankPoints, column2.powerTankPoints);
  this._animateTwoPlayerRow(column1.armorTankPoints, column2.armorTankPoints);
};

StageStatisticsScene.prototype._animateTwoPlayerRow = function (
  points1,
  points2,
) {
  var self = this;
  var maxCount = Math.max(points1.getCount(), points2.getCount());

  this._script.enqueue({
    execute: function () {
      points1.show();
      points2.show();
    },
  });

  for (var n = 1; n <= maxCount; ++n) {
    (function (n) {
      self._script.enqueue({
        execute: function () {
          points1.setCounter(Math.min(n, points1.getCount()));
          points2.setCounter(Math.min(n, points2.getCount()));
          SoundManager.play("statistics_1");
        },
      });
      self._script.enqueue(new Delay(self._script, 10));
    })(n);
  }
  this._script.enqueue(new Delay(this._script, 15));
};

StageStatisticsScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.fillStyle = "#feac4e";
  ctx.fillText("20000", 306, 46);

  ctx.fillStyle = "#ffffff";
  ctx.fillText(
    Language.translate("STAGE") + " " + ("" + this._stage).lpad(" ", 2),
    194,
    78,
  );

  if (this._player2) {
    this._drawTwoPlayers(ctx);
  } else {
    this._drawOnePlayer(ctx);
  }
};

StageStatisticsScene.prototype._drawOnePlayer = function (ctx) {
  var self = this;
  var column = this._playerColumns[0];
  var x = 26;

  ctx.drawImage(ImageManager.getImage("roman_one_red"), x, 96);

  ctx.fillStyle = "#e44437";
  ctx.fillText(Language.translate("-PLAYER"), x + 14, 110);

  ctx.fillStyle = "#feac4e";
  ctx.fillText(("" + column.points).lpad(" ", 7), x + 14, 142);

  ctx.fillStyle = "#ffffff";

  var rows = [
    { points: column.basicTankPoints, image: "tank_basic_up_c0_t1" },
    { points: column.fastTankPoints, image: "tank_fast_up_c0_t1" },
    { points: column.powerTankPoints, image: "tank_power_up_c0_t1" },
    { points: column.armorTankPoints, image: "tank_armor_up_c0_t1" },
  ];

  var rowY = [190, 238, 286, 334];
  var tankY = [169, 217, 265, 313];
  var arrowY = [178, 226, 274, 322];

  rows.forEach(function (row, i) {
    var y = rowY[i];
    var value = "" + row.points.getCounter() * row.points.getValue();
    var count = "" + row.points.getCounter();

    ctx.fillText(value.lpad(" ", 5), x + 2, y);
    ctx.fillText(Language.translate("PTS"), x + 92, y);
    ctx.fillText(count.lpad(" ", 2), x + 148, y);
    ctx.drawImage(ImageManager.getImage("arrow"), x + 184, arrowY[i]);
    ctx.drawImage(ImageManager.getImage(row.image), x + 206, tankY[i]);
  });

  ctx.fillText(Language.translate("TOTAL"), x + 50, 366);
  ctx.drawImage(ImageManager.getImage("white_line"), x + 100, 346);
  if (self._drawTotal) {
    ctx.fillText(("" + column.tanksCount).lpad(" ", 2), x + 142, 366);
  }
};

StageStatisticsScene.prototype._drawTwoPlayers = function (ctx) {
  var self = this;
  var column1 = this._playerColumns[0];
  var column2 = this._playerColumns[1];

  ctx.fillStyle = "#e44437";
  ctx.fillText("HI-SCORE", 178, 46);
  ctx.fillText("I" + Language.translate("-PLAYER"), 40, 110);
  ctx.fillText("II" + Language.translate("-PLAYER"), 344, 110);

  ctx.fillStyle = "#feac4e";
  ctx.fillText(("" + column1.points).lpad(" ", 7), 40, 142);
  ctx.fillText(("" + column2.points).lpad(" ", 7), 344, 142);

  ctx.fillStyle = "#ffffff";

  var rows = [
    {
      points: column1.basicTankPoints,
      points2: column2.basicTankPoints,
      image: "tank_basic_up_c0_t1",
    },
    {
      points: column1.fastTankPoints,
      points2: column2.fastTankPoints,
      image: "tank_fast_up_c0_t1",
    },
    {
      points: column1.powerTankPoints,
      points2: column2.powerTankPoints,
      image: "tank_power_up_c0_t1",
    },
    {
      points: column1.armorTankPoints,
      points2: column2.armorTankPoints,
      image: "tank_armor_up_c0_t1",
    },
  ];

  var rowY = [190, 238, 286, 334];
  var tankY = [169, 217, 265, 313];
  var arrowY = [178, 226, 274, 322];

  rows.forEach(function (row, i) {
    var y = rowY[i];

    ctx.fillText(
      ("" + row.points.getCounter() * row.points.getValue()).lpad(" ", 4),
      24,
      y,
    );
    ctx.fillText(Language.translate("PTS"), 104, y);
    ctx.fillText(("" + row.points.getCounter()).lpad(" ", 2), 168, y);
    ctx.drawImage(ImageManager.getImage("arrow"), 224, arrowY[i]);

    ctx.drawImage(ImageManager.getImage(row.image), 240, tankY[i]);

    var arrow = ImageManager.getImage("arrow");
    ctx.save();
    ctx.translate(272 + 14, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(arrow, 0, arrowY[i]);
    ctx.restore();
    ctx.fillText(("" + row.points2.getCounter()).lpad(" ", 2), 320, y);
    ctx.fillText(Language.translate("PTS"), 376, y);
    ctx.fillText(
      ("" + row.points2.getCounter() * row.points2.getValue()).lpad(" ", 4),
      432,
      y,
    );
  });

  var whiteLine = ImageManager.getImage("white_line");
  ctx.drawImage(whiteLine, 16, 346);
  ctx.drawImage(whiteLine, 144, 346);
  ctx.drawImage(whiteLine, 272, 346);
  ctx.drawImage(whiteLine, 400, 346);

  ctx.fillText(Language.translate("TOTAL"), 48, 366);
  ctx.fillText(Language.translate("TOTAL"), 392, 366);
  if (self._drawTotal) {
    ctx.fillText(("" + column1.tanksCount).lpad(" ", 2), 152, 366);
    ctx.fillText(("" + column2.tanksCount).lpad(" ", 2), 344, 366);
  }
};
