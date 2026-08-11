var SoundManager = (function() {
  var sounds = {
    stage_start: null,
    game_over: null,
    bullet_shot: null,
    bullet_hit_1: null,
    bullet_hit_2: null,
    explosion_1: null,
    explosion_2: null,
    pause: null,
    powerup_appear: null,
    powerup_pick: null,
    statistics_1: null,
  };
  
  for (var i in sounds) {
    var snd = new Audio("sound/" + i + ".ogg");
    sounds[i] = snd;
  }
  
  var muted = false;
  
  return {
    play: function (sound) {
      if (muted) {
        return;
      }
      sounds[sound].play();
    },
    setMuted: function (value) {
      muted = value;
    },
    isMuted: function () {
      return muted;
    },
    toggleMuted: function () {
      muted = !muted;
      return muted;
    },
  };
})();
