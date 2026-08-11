describe("BackMenuItem", function () {
  it("#execute - with destination", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new BackMenuItem(sceneManager, 'toMoreScene');
    spyOn(sceneManager, 'toMoreScene');
    item.execute();
    expect(sceneManager.toMoreScene).toHaveBeenCalled();
  });
  
  it("#execute - default to main menu", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new BackMenuItem(sceneManager);
    spyOn(sceneManager, 'toMainMenuScene');
    item.execute();
    expect(sceneManager.toMainMenuScene).toHaveBeenCalled();
  });
});
