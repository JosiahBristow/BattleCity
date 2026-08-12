describe("StageListMenuItem", function () {
  it("has correct name", function () {
    var sceneManager = new SceneManager(new EventManager());
    var item = new StageListMenuItem(sceneManager);
    expect(item.getName()).toEqual("STAGE LIST");
  });

  it("navigates to stage list scene", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    spyOn(sceneManager, 'toStageListScene');
    var item = new StageListMenuItem(sceneManager);
    item.execute();
    expect(sceneManager.toStageListScene).toHaveBeenCalled();
  });
});
