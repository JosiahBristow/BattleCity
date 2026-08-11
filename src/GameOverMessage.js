function GameOverMessage() {
  this.x = 210;
  this.y = Globals.CANVAS_HEIGHT + 16;
}

GameOverMessage.prototype.draw = function (ctx) {
  ctx.fillStyle = "#e44437";
  ctx.fillText(Language.translate('GAME'), this.x, this.y);
  ctx.fillText(Language.translate('OVER'), this.x, this.y + 16);
};
