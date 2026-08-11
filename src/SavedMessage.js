function SavedMessage() {
  this._visible = false;
  this._timer = 0;
  this._duration = 60;
  this._name = null;
}

SavedMessage.prototype.show = function (name) {
  this._name = name || null;
  this._visible = true;
  this._timer = 0;
};

SavedMessage.prototype.update = function () {
  if (!this._visible) {
    return;
  }
  this._timer++;
  if (this._timer >= this._duration) {
    this._visible = false;
  }
};

SavedMessage.prototype.draw = function (ctx) {
  if (!this._visible) {
    return;
  }
  ctx.fillStyle = "#e44437";
  if (this._name) {
    ctx.fillText(Language.translate('SAVED') + ": " + this._name, 150, 240);
  }
  else {
    ctx.fillText(Language.translate('SAVED'), 180, 240);
  }
};
