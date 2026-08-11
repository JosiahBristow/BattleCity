(function () {
  'use strict';

  var isMobile = Globals.IS_TOUCH;

  if (!isMobile) return;

  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = 'css/mobile.css';
  document.head.appendChild(link);

  var KEY_MAP = {
    up:    [38],
    down:  [40],
    left:  [37],
    right: [39],
    a:     [74],
    b:     [32],
    start: [13],
    select:[17],
    f:     [70],
    l:     [76],
    c:     [67],
    esc:   [27],
    m:     [77],
    p:     [80],
    tab:   [9],
    s:     [83]
  };

  var activeKeys = {};

  function keyDown(keyCode) {
    if (activeKeys[keyCode]) return;
    activeKeys[keyCode] = true;
    document.dispatchEvent(new KeyboardEvent('keydown', {
      keyCode: keyCode, which: keyCode, charCode: keyCode,
      bubbles: true, cancelable: true
    }));
  }

  function keyUp(keyCode) {
    if (!activeKeys[keyCode]) return;
    activeKeys[keyCode] = false;
    document.dispatchEvent(new KeyboardEvent('keyup', {
      keyCode: keyCode, which: keyCode, charCode: keyCode,
      bubbles: true, cancelable: true
    }));
  }

  function releaseAll() {
    Object.keys(activeKeys).forEach(function (k) {
      if (activeKeys[k]) keyUp(parseInt(k));
    });
  }

  function bindButton(el, action) {
    var codes = KEY_MAP[action];
    if (!codes) return;

    el.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      codes.forEach(keyDown);
    }, { passive: false });

    el.addEventListener('touchend', function (e) {
      e.preventDefault();
      e.stopPropagation();
      codes.forEach(keyUp);
    }, { passive: false });

    el.addEventListener('touchcancel', function (e) {
      e.preventDefault();
      codes.forEach(keyUp);
    }, { passive: false });
  }

  function bindDpadButton(el, action) {
    var codes = KEY_MAP[action];
    if (!codes) return;

    el.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      codes.forEach(keyDown);
    }, { passive: false });

    el.addEventListener('touchend', function (e) {
      e.preventDefault();
      e.stopPropagation();
      codes.forEach(keyUp);
    }, { passive: false });

    el.addEventListener('touchcancel', function (e) {
      e.preventDefault();
      codes.forEach(keyUp);
    }, { passive: false });
  }

  function build() {
    var overlay = document.createElement('div');
    overlay.id = 'mobile-overlay';

    overlay.innerHTML =
      '<div id="dpad-area">' +
        '<div id="dpad">' +
          '<div class="dpad-btn dpad-up" data-dir="up"></div>' +
          '<div class="dpad-btn dpad-left" data-dir="left"></div>' +
          '<div class="dpad-btn dpad-center"></div>' +
          '<div class="dpad-btn dpad-right" data-dir="right"></div>' +
          '<div class="dpad-btn dpad-down" data-dir="down"></div>' +
        '</div>' +
      '</div>' +

      '<div id="btn-area">' +
        '<div class="action-row">' +
          '<button class="ctrl-btn btn-a" data-action="a">A</button>' +
          '<button class="ctrl-btn btn-b" data-action="b">B</button>' +
        '</div>' +
        '<div class="meta-row">' +
          '<button class="ctrl-btn btn-select" data-action="select">SEL</button>' +
          '<button class="ctrl-btn btn-start" data-action="start">STA</button>' +
        '</div>' +
      '</div>' +

      '<div id="utility-bar">' +
        '<button class="util-btn" data-action="f" title="Fullscreen">F</button>' +
        '<button class="util-btn" data-action="p" title="Pause">P</button>' +
        '<button class="util-btn" data-action="esc" title="Exit">ESC</button>' +
        '<button class="util-btn" data-action="l" title="Language">L</button>' +
        '<button class="util-btn" data-action="m" title="Mute">M</button>' +
        '<button class="util-btn" data-action="c" title="Cycle">C</button>' +
        '<button class="util-btn" data-action="tab" title="Tab">TAB</button>' +
        '<button class="util-btn" data-action="s" title="Save">S</button>' +
        '<button class="util-btn" id="btn-red" title="Red Screen">RED</button>' +
        '<button class="util-btn" id="btn-landscape" title="Landscape">横屏</button>' +
      '</div>';

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.dpad-btn[data-dir]').forEach(function (btn) {
      bindDpadButton(btn, btn.getAttribute('data-dir'));
    });

    overlay.querySelectorAll('[data-action]').forEach(function (btn) {
      var action = btn.getAttribute('data-action');
      if (btn.classList.contains('dpad-btn')) return;
      bindButton(btn, action);
    });

    var redBtn = document.getElementById('btn-red');
    redBtn.addEventListener('click', function () {
      Cheat.redScreen = !Cheat.redScreen;
      if (Cheat.redScreen) {
        redBtn.classList.add('active');
      } else {
        redBtn.classList.remove('active');
      }
    });

    var landscapeBtn = document.getElementById('btn-landscape');
    landscapeBtn.addEventListener('click', function () {
      var on = !document.body.classList.contains('mobile-landscape');
      setLandscape(on);
    });

    function setLandscape(on) {
      document.body.classList.toggle('mobile-landscape', on);
      if (on) {
        landscapeBtn.classList.add('active');
        landscapeBtn.textContent = '退出';
      } else {
        landscapeBtn.classList.remove('active');
        landscapeBtn.textContent = '横屏';
      }
      updateRotateHint();
    }

    var rotateHint = null;
    function updateRotateHint() {
      var landscape = document.body.classList.contains('mobile-landscape');
      var portrait = window.innerHeight > window.innerWidth;
      if (landscape && portrait) {
        if (!rotateHint) {
          rotateHint = document.createElement('div');
          rotateHint.id = 'rotate-hint';
          rotateHint.innerHTML = '<span>请旋转至横屏</span><small>Rotate to Landscape</small>';
          document.body.appendChild(rotateHint);
        }
        rotateHint.style.display = '';
      }
      else if (rotateHint) {
        rotateHint.style.display = 'none';
      }
    }

    function updateOrientationClass() {
      if (window.innerWidth > window.innerHeight) {
        document.body.classList.add('landscape');
      } else {
        document.body.classList.remove('landscape');
      }
      updateRotateHint();
    }

    updateOrientationClass();
    window.addEventListener('resize', updateOrientationClass);
    window.addEventListener('orientationchange', function () {
      setTimeout(updateOrientationClass, 100);
      setTimeout(releaseAll, 100);
    });
    window.addEventListener('blur', releaseAll);

    document.addEventListener('touchstart', function (e) {
      if (e.target === document.body || e.target === document.documentElement) {
        releaseAll();
      }
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
