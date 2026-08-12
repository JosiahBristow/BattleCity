var EditorUI = {};

// Draw a text button like fc93's TextButton. Returns nothing (hit testing is done
// by the caller using the returned rect).
EditorUI.drawTextButton = function (ctx, x, y, content, options) {
  var o = options || {};
  var spreadX = o.spreadX === undefined ? 8 : o.spreadX;
  var spreadY = o.spreadY === undefined ? 4 : o.spreadY;
  var textScale = o.textScale || 2;
  var selected = o.selected;
  var disabled = o.disabled;
  var stroke = o.stroke || "none";
  var textFill = o.textFill || "#ccc";
  var selectedTextFill = o.selectedTextFill || "#333";
  
  var w = EditorFont.measure(ctx, content, textScale) + 2 * spreadX;
  var h = 8 * textScale + 2 * spreadY;
  var bx = x - spreadX;
  var by = y - spreadY;
  
  ctx.fillStyle = "transparent";
  if (selected) {
    ctx.fillStyle = "#e91e63";
  }
  ctx.fillRect(bx, by, w, h);
  
  if (stroke && stroke != "none" && stroke != "transparent") {
    ctx.strokeStyle = stroke;
    ctx.setLineDash && ctx.setLineDash([4, 4]);
    ctx.strokeRect(bx, by, w, h);
    ctx.setLineDash && ctx.setLineDash([]);
  }
  
  var fill = selected ? selectedTextFill : textFill;
  if (disabled) {
    fill = "#888";
  }
  EditorFont.draw(ctx, content, x, y, textScale, fill);
  
  return {x: bx, y: by, w: w, h: h};
};

// Draw the map grid dashed lines like fc93's Grid component.
EditorUI.drawGridLines = function (ctx, x0, y0, size, hover) {
  ctx.strokeStyle = "steelblue";
  ctx.lineWidth = 1;
  ctx.setLineDash && ctx.setLineDash([2, 2]);
  var n = 13;
  var hasHover = !!hover;
  for (var i = 1; i <= n; ++i) {
    var isHoverCol = hasHover && (hover.col == i || hover.col == i - 1);
    var isHoverRow = hasHover && (hover.row == i || hover.row == i - 1);
    ctx.globalAlpha = isHoverCol ? 1 : 0.3;
    ctx.beginPath();
    ctx.moveTo(x0 + i * size, y0);
    ctx.lineTo(x0 + i * size, y0 + n * size);
    ctx.stroke();
    ctx.globalAlpha = isHoverRow ? 1 : 0.3;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + i * size);
    ctx.lineTo(x0 + n * size, y0 + i * size);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.setLineDash && ctx.setLineDash([]);
};

// Draw a highlighted cell rectangle (hover cursor)
EditorUI.drawHoverCell = function (ctx, x0, y0, col, row, size) {
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.strokeRect(x0 + col * size, y0 + row * size, size, size);
};
