function SettingsController() {
  var self = this;
  this._allowExit = false;
  $(document).keydown(function (event) {
    self.keyPressed(event.which);
  });
  $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function () {
    self.onFullscreenChange();
  });
}

SettingsController.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.F) {
    this.toggleFullscreen();
  }
  else if (key == Keyboard.Key.L) {
    Language.toggle();
    Language.refreshHelpText();
  }
  else if (key == Keyboard.Key.M) {
    SoundManager.toggleMuted();
  }
};

SettingsController.prototype.isFullscreen = function () {
  return !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
};

SettingsController.prototype.requestFullscreen = function () {
  var canvas = document.getElementById('canvas');
  if (canvas.requestFullscreen) {
    canvas.requestFullscreen();
  }
  else if (canvas.webkitRequestFullscreen) {
    canvas.webkitRequestFullscreen();
  }
  else if (canvas.mozRequestFullScreen) {
    canvas.mozRequestFullScreen();
  }
  else if (canvas.msRequestFullscreen) {
    canvas.msRequestFullscreen();
  }
};

SettingsController.prototype.exitFullscreen = function () {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
  else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  }
  else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  }
  else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

SettingsController.prototype.toggleFullscreen = function () {
  if (this.isFullscreen()) {
    this._allowExit = true;
    this.exitFullscreen();
  }
  else {
    this._allowExit = false;
    this.requestFullscreen();
  }
};

SettingsController.prototype.onFullscreenChange = function () {
  if (!this.isFullscreen()) {
    if (!this._allowExit) {
      // ESC key exited fullscreen (browser built-in). Re-enter immediately.
      var self = this;
      setTimeout(function () {
        self.requestFullscreen();
      }, 50);
    }
    else {
      this._allowExit = false;
    }
  }
};
