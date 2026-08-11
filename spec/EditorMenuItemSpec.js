describe("EditorMenuItem", function () {
  it("#execute", function () {
    var eventManager = new EventManager();
    var sceneManager = new SceneManager(eventManager);
    var item = new EditorMenuItem(sceneManager);
    spyOn(sceneManager, 'toAdvancedEditorScene');
    item.execute();
    expect(sceneManager.toAdvancedEditorScene).toHaveBeenCalled();
  });
});
