# Battle City

一个基于浏览器、纯 ES5 JavaScript 实现的 NES《坦克大战》(Battle City) 复刻版。无需构建工具、无需安装依赖，直接用浏览器打开即可游玩。

## 在线试玩

👉 <https://josiahbristow.github.io/BattleCity/>

## 运行方式

直接用浏览器打开 `index.html` 即可（使用静态文件服务器效果更佳）。

游戏主循环为 `setInterval`（50 FPS），每帧依次触发键盘事件、`sceneManager.update()` 与 `sceneManager.draw(ctx)`。

## 功能特性

- 完整复刻 NES《坦克大战》单人 / 双人模式
- 内置多张关卡地图
- AI 敌人与友军
- 关卡编辑器（地图编辑 / 高级编辑）
- 地图管理（保存、重命名、删除）
- 作弊菜单
- 中英文双语界面（`L` 键切换）
- 音效与像素字体（prstart / zpix）
- 手机端适配：虚拟 D-pad 摇杆 + 按键，自动模拟键盘操作

## 操作说明

### 桌面版

| 按键 | 功能 |
|------|------|
| 方向键 / WASD | 移动（P1: WASD，P2: 方向键） |
| J | 射击（P1） |
| / | 射击（P2） |
| Enter / P | 确认 / 暂停 |
| ESC | 退出到主菜单 |
| F | 全屏 |
| L | 切换语言 |
| M | 静音 |
| S | 保存地图 |
| TAB / C | 编辑器切换 / 循环形状 |

### 手机版

打开页面即自动适配触屏，屏幕底部显示像素风格虚拟按键：

- **左侧 D-pad**：移动（方向键 / WASD）
- **A / B**：射击（J / 空格）
- **STA / SEL**：Start（Enter）/ Select（Ctrl）
- **F / P / ESC / L / M / C / TAB / S**：与桌面版相同功能的快捷按键
- **RED**：红屏模式开关——开启后敌人移动更快、子弹更快，画面呈红色脉动（经典 NES 红屏硬模式）
- **横屏**：横屏模式开关——开启后若手机仍处于竖屏会提示旋转屏幕，旋转后自动切换横屏布局（画布居中、摇杆左下、按键右下、工具栏顶部）；设备自动旋转到横屏也会启用该布局

> 手机端通过向 `document` 派发合成键盘事件（keydown / keyup）来模拟实体键盘，与桌面版输入完全兼容。桌面版界面保持原样，不受手机样式影响。红屏模式也可在作弊菜单（MORE → CHEAT → RED SCREEN）中开启。

## 项目结构

```
css/             样式（BattleCity.css 桌面、mobile.css 手机端）
fonts/           像素字体
images/          游戏素材 PNG
sound/           音效 OGG
lib/             第三方库（jQuery、Stats、Jasmine）
src/             ES5 源码（每个文件定义一个全局构造函数）
spec/            Jasmine 单元测试
index.html       唯一入口（以 <script> 顺序加载依赖）
```

## 技术架构

- **EventManager**：发布 / 订阅事件中枢，对象间通过命名事件解耦（如 `Sprite.Event.MOVED`）
- **Sprite + Controller**：游戏角色由精灵（位置 / 速度 / 方向）与控制器（订阅键盘事件）配对组成
- **SceneManager**：管理场景，驱动每帧的 `update()` / `draw(ctx)`
- **Keyboard**：统一键盘输入管理，每帧将事件队列派发给订阅者
- **Utils.js**：必须先加载，定义了 `Function.prototype.subclass`（fork 式继承）与 `Object.size`

## 测试

使用 Jasmine 1.2.0（`lib/jasmine-1.2.0/`），测试文件位于 `spec/`（与 `src/` 一一对应）。

> 仓库未包含 SpecRunner.html，需要手动创建一个 runner：依次加载三个 lib/jasmine 资源 → 按 `index.html` 中的 `<script>` 顺序加载所有 `src/*.js` → 再加载全部 `spec/*Spec.js`。

## 版权说明

本项目为学习用途的粉丝复刻，素材与音效来源于经典 NES 游戏《坦克大战》。原始版权归各自所有者所有。
