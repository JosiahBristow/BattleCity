var Editor = {};

Editor.Structure = {
  CLEAR: 'clear',
  BRICK: 'brick',
  STEEL: 'steel',
  WATER: 'water',
  SNOW: 'snow',
  TREES: 'trees',
  BASE: 'base',
  SPAWN1: 'spawn1',
  SPAWN2: 'spawn2',
  ENEMY1: 'enemy1',
  ENEMY2: 'enemy2',
  ENEMY3: 'enemy3'
};

Editor.createEmptyGrid = function () {
  var grid = [];
  for (var i = 0; i < 13; ++i) {
    grid.push([]);
    for (var j = 0; j < 13; ++j) {
      grid[i].push({type: Editor.Structure.CLEAR, hex: 0});
    }
  }
  return grid;
};

Editor.defaultGrid = function () {
  var grid = Editor.createEmptyGrid();
  grid[12][6] = {type: Editor.Structure.BASE, hex: 0};
  var fort = [
    [12, 5, {type: Editor.Structure.BRICK, hex: 0b0010 | 0b1000}],
    [12, 7, {type: Editor.Structure.BRICK, hex: 0b0001 | 0b0100}],
    [11, 5, {type: Editor.Structure.BRICK, hex: 0b1000}],
    [11, 6, {type: Editor.Structure.BRICK, hex: 0b0100 | 0b1000}],
    [11, 7, {type: Editor.Structure.BRICK, hex: 0b0100}]
  ];
  fort.forEach(function (f) {
    grid[f[0]][f[1]] = f[2];
  });
  return grid;
};

Editor.serializeGrid = function (grid) {
  var sprites = [];
  var offsetX = Globals.UNIT_SIZE;
  var offsetY = Globals.TILE_SIZE;
  for (var row = 0; row < 13; ++row) {
    for (var col = 0; col < 13; ++col) {
      var cell = grid[row][col];
      var x = offsetX + col * Globals.UNIT_SIZE;
      var y = offsetY + row * Globals.UNIT_SIZE;
      if (cell.type == Editor.Structure.BASE) {
        sprites.push('Base(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.SPAWN1) {
        sprites.push('Player1(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.SPAWN2) {
        sprites.push('Player2(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.ENEMY1) {
        sprites.push('Enemy1(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.ENEMY2) {
        sprites.push('Enemy2(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.ENEMY3) {
        sprites.push('Enemy3(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.WATER) {
        sprites.push('Water(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.SNOW) {
        sprites.push('Snow(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.TREES) {
        sprites.push('Trees(' + x + ',' + y + ')');
      }
      else if (cell.type == Editor.Structure.BRICK) {
        var hex = cell.hex;
        if (hex & 0b0001) sprites.push('BrickWall(' + x + ',' + y + ')');
        if (hex & 0b0010) sprites.push('BrickWall(' + (x + 16) + ',' + y + ')');
        if (hex & 0b0100) sprites.push('BrickWall(' + x + ',' + (y + 16) + ')');
        if (hex & 0b1000) sprites.push('BrickWall(' + (x + 16) + ',' + (y + 16) + ')');
      }
      else if (cell.type == Editor.Structure.STEEL) {
        var hex2 = cell.hex;
        if (hex2 & 0b0001) sprites.push('SteelWall(' + x + ',' + y + ')');
        if (hex2 & 0b0010) sprites.push('SteelWall(' + (x + 16) + ',' + y + ')');
        if (hex2 & 0b0100) sprites.push('SteelWall(' + x + ',' + (y + 16) + ')');
        if (hex2 & 0b1000) sprites.push('SteelWall(' + (x + 16) + ',' + (y + 16) + ')');
      }
    }
  }
  return sprites.join(';');
};

Editor.defaultBots = function () {
  return [
    {type: Tank.Type.BASIC, count: 10},
    {type: Tank.Type.FAST, count: 4},
    {type: Tank.Type.POWER, count: 3},
    {type: Tank.Type.ARMOR, count: 3}
  ];
};

Editor.serializeBots = function (bots) {
  var result = [];
  bots.forEach(function (bot) {
    for (var i = 0; i < bot.count; ++i) {
      result.push(bot.type);
    }
  });
  return result;
};

Editor.botsCount = function (bots) {
  var total = 0;
  bots.forEach(function (bot) {
    total += bot.count;
  });
  return total;
};
