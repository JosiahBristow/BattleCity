var Language = {};

Language.ENGLISH = 'english';
Language.CHINESE = 'chinese';

Language.current = Language.ENGLISH;

Language.translations = {
  chinese: {
    '1 PLAYER': '1 玩家',
    '2 PLAYERS': '2 玩家',
    'PLAYER + AI': '玩家 + AI 队友',
    'MORE': '更多',
    'MY MAP': '我的地图',
    'HELP': '帮助',
    'CHEAT': '作弊金手指',
    'EDITOR': '高级地图编辑器',
    'BRICK': '砖墙',
    'STEEL': '钢墙',
    'WATER': '水',
    'TREES': '树',
    'BASE': '基地',
    'CLEAR': '清除',
    'ITEM': '物品',
    'ENEMY CONFIG': '敌人配置',
    'F/G/H/T: SHAPE': 'F/G/H/T: 调整形状',
    'TAB: CONFIG': 'Tab: 配置',
    'TAB: MAP': 'Tab: 地图',
    'B TO SAVE': 'B 保存',
    'INVINCIBLE': '无敌',
    'INFINITE LIVES': '无限生命',
    'INFINITE BULLETS': '无限子弹',
    'FREEZE ENEMIES': '冻结敌人',
    'ONE HIT KILL': '一击必杀',
    'MAX POWER': '满级火力',
    'FAST SPEED': '快速移动',
    'INVINCIBLE BASE': '基地无敌',
    'RED SCREEN': '红屏模式',
    'J TO TOGGLE': 'J 切换',
    'NO CUSTOM MAP': '暂无自定义地图',
    'J TO PLAY': 'J 选择',
    'STAGE SELECT': '关卡选择',
    'PREV': '上一关',
    'NEXT': '下一关',
    'J TO START': 'J 开始',
    'ESC TO GO BACK': 'ESC 返回',
    'GO TO STAGE': '跳转关卡',
    'TYPE NUMBER TO JUMP': '输入数字直接跳转',
    'BACK': '返回',
    'CONSTRUCTION': '地图编辑器',
    'SAVED': '已保存',
    'HI- 20000': '最高分 20000',
    'ALL RIGHTS RESERVED': '版权所有',
    'STAGE': '关卡',
    'PTS': '分',
    'TOTAL': '总计',
    '-PLAYER': '-玩家',
    'GAME': '游戏',
    'OVER': '结束',
    'PAUSE': '暂停',
    'LOADING': '加载中',
    'CONTROLS': '操作说明',
    'MOVE': '移动',
    'FIRE': '射击',
    'SELECT': '选择',
    'PAUSE': '暂停',
    'EXIT': '退出',
    'MUTE': '静音',
    'ARROWS / WASD': '方向键 / WASD',
    'J / /': 'J / /',
    'ENTER': '回车选择',
    'CTRL': 'Ctrl',
    'P': 'P',
    'ESC': 'ESC',
    'M': 'M',
    'P: PAUSE': 'P：暂停',
    'ESC: EXIT': 'ESC：退出',
    'M: MUTE': 'M：静音',
    'P1: WASD + J': '玩家1：WASD + J',
    'P2: ARROWS + /': '玩家2：方向键 + /',
    'F: FULLSCREEN': 'F：全屏',
    'L: LANGUAGE': 'L：切换语言',
    'S: SAVE MAP': 'S：保存地图',
    'PRESS ENTER TO GO BACK': '按回车返回'
  }
};

Language.translate = function (text) {
  if (Language.current == Language.CHINESE) {
    var translations = Language.translations.chinese;
    if (translations[text] !== undefined) {
      return translations[text];
    }
  }
  return text;
};

Language.toggle = function () {
  if (Language.current == Language.ENGLISH) {
    Language.current = Language.CHINESE;
  }
  else {
    Language.current = Language.ENGLISH;
  }
};

Language.refreshHelpText = function () {
  $('[data-i18n]').each(function () {
    var key = $(this).attr('data-i18n');
    $(this).text(Language.translate(key));
  });
};
