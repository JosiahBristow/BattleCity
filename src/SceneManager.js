function SceneManager(eventManager) {
  this._eventManager = eventManager;
  this._scene = null;
}

SceneManager.prototype._clearScene = function () {
  this._eventManager.removeAllSubscribers();
  CanvasMouse.clearAll();
};

SceneManager.prototype.setScene = function (scene) {
  this._scene = scene;
};

SceneManager.prototype.getScene = function () {
  return this._scene;
};

SceneManager.prototype.toLoadingScene = function () {
  this._clearScene();
  this._scene = new LoadingScene(this);
};

SceneManager.prototype.toMainMenuScene = function (arrived) {
  this._clearScene();
  this._scene = new MainMenuScene(this);
  
  if (arrived) {
    this._scene.nextMenuItem();
    this._scene.arrived();
  }
};

SceneManager.prototype.toGameScene = function (stage, player, playerCount, stageConfig) {
  this._clearScene();
  this._scene = new GameScene(this, stage, player, playerCount, stageConfig);
};

SceneManager.prototype.toConstructionScene = function () {
  this._clearScene();
  this._scene = new Construction(this);
};

SceneManager.prototype.toMyMapScene = function () {
  this._clearScene();
  this._scene = new MapManageScene(this);
};

SceneManager.prototype.toMapManageScene = function () {
  this._clearScene();
  this._scene = new MapManageScene(this);
};

SceneManager.prototype.toMapRenameScene = function (index, backMethod) {
  this._clearScene();
  this._scene = new MapRenameScene(this, index, backMethod);
};

SceneManager.prototype.toMyMapPlayerScene = function () {
  this._clearScene();
  this._scene = new MyMapPlayerScene(this);
};

SceneManager.prototype.toMoreScene = function () {
  this._clearScene();
  this._scene = new MoreScene(this);
};

SceneManager.prototype.toStageSelectScene = function () {
  this._clearScene();
  this._scene = new StageSelectScene(this);
};

SceneManager.prototype.toStageListScene = function () {
  this._clearScene();
  this._scene = new StageListScene(this);
};

SceneManager.prototype.toStagePlayerScene = function (stage) {
  this._clearScene();
  this._scene = new StagePlayerScene(this, stage, 'toStageSelectScene');
};

SceneManager.prototype.toHelpScene = function () {
  this._clearScene();
  this._scene = new HelpScene(this);
};

SceneManager.prototype.toCheatScene = function () {
  this._clearScene();
  this._scene = new CheatScene(this);
};

SceneManager.prototype.toAdvancedEditorScene = function (backMethod) {
  this._clearScene();
  this._scene = new AdvancedEditorScene(this, backMethod);
};

SceneManager.prototype.toStageStatisticsScene = function (stage, player, gameOver, player2) {
  this._clearScene();
  this._scene = new StageStatisticsScene(this, stage, player, gameOver, player2);
};

SceneManager.prototype.toGameOverScene = function () {
  this._clearScene();
  this._scene = new GameOverScene(this);
};

SceneManager.prototype.toDemoScene = function () {
  this._clearScene();
  this._scene = new DemoGameScene(this);
};

SceneManager.prototype.update = function () {
  this._scene.update();
};

SceneManager.prototype.draw = function (ctx) {
  this._scene.draw(ctx);
};

SceneManager.prototype.getEventManager = function () {
  return this._eventManager;
};
