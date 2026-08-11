describe("MainMenuController", function () {
  it("subscribe", function () {
    var eventManager = new EventManager();
    spyOn(eventManager, 'addSubscriber');
    var menu = new MainMenu();
    var controller = new MainMenuController(eventManager, menu);
    expect(eventManager.addSubscriber).toHaveBeenCalledWith(controller, [Keyboard.Event.KEY_PRESSED]);
  });
  
  describe("#notify", function () {
    describe("Keyboard.Event.KEY_PRESSED", function () {
      it("Keyboard.Key.DOWN", function () {
        var menu = new MainMenu();
        var eventManager = new EventManager();
        var controller = new MainMenuController(eventManager, menu);
        spyOn(controller, 'keyPressed');
        controller.notify({'name': Keyboard.Event.KEY_PRESSED, 'key': Keyboard.Key.DOWN});
        expect(controller.keyPressed).toHaveBeenCalledWith(Keyboard.Key.DOWN);
      });
    });
  });
  
  describe("#keyPressed", function () {
    it("Keyboard.Key.DOWN", function () {
      var menu = new MainMenu();
      var eventManager = new EventManager();
      var controller = new MainMenuController(eventManager, menu);
      spyOn(menu, 'nextItem');
      controller.keyPressed(Keyboard.Key.DOWN);
      expect(menu.nextItem).toHaveBeenCalled();
    });
    
    it("Keyboard.Key.UP", function () {
      var menu = new MainMenu();
      var eventManager = new EventManager();
      var controller = new MainMenuController(eventManager, menu);
      spyOn(menu, 'prevItem');
      controller.keyPressed(Keyboard.Key.UP);
      expect(menu.prevItem).toHaveBeenCalled();
    });
    
    it("Keyboard.Key.START", function () {
      var menu = new MainMenu();
      var eventManager = new EventManager();
      var controller = new MainMenuController(eventManager, menu);
      spyOn(menu, 'executeCurrentItem');
      controller.keyPressed(Keyboard.Key.START);
      expect(menu.executeCurrentItem).toHaveBeenCalled();
    });
    
    it("Keyboard.Key.S - nextItem", function () {
      var menu = new MainMenu();
      var eventManager = new EventManager();
      var controller = new MainMenuController(eventManager, menu);
      spyOn(menu, 'nextItem');
      controller.keyPressed(Keyboard.Key.S);
      expect(menu.nextItem).toHaveBeenCalled();
    });
    
    it("Keyboard.Key.W - prevItem", function () {
      var menu = new MainMenu();
      var eventManager = new EventManager();
      var controller = new MainMenuController(eventManager, menu);
      spyOn(menu, 'prevItem');
      controller.keyPressed(Keyboard.Key.W);
      expect(menu.prevItem).toHaveBeenCalled();
    });
    
    it("Keyboard.Key.J - executeCurrentItem", function () {
      var menu = new MainMenu();
      var eventManager = new EventManager();
      var controller = new MainMenuController(eventManager, menu);
      spyOn(menu, 'executeCurrentItem');
      controller.keyPressed(Keyboard.Key.J);
      expect(menu.executeCurrentItem).toHaveBeenCalled();
    });
    
    it("unactive", function () {
      var menu = new MainMenu();
      var eventManager = new EventManager();
      var controller = new MainMenuController(eventManager, menu);
      controller.deactivate();
      spyOn(menu, 'executeCurrentItem');
      controller.keyPressed(Keyboard.Key.START);
      expect(menu.executeCurrentItem).not.toHaveBeenCalled();
    });
  });
});
