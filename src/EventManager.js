function EventManager() {
  this._subscribers = {};
}

EventManager.prototype.addSubscriber = function (subscriber, events) {
  for (var i in events) {
    if (!this._subscribers[events[i]]) {
      this._subscribers[events[i]] = [];
    }
    this._subscribers[events[i]].push(subscriber);
  }
};

EventManager.prototype.removeSubscriber = function (subscriber) {
  for (var i in this._subscribers) {
    for (var j in this._subscribers[i]) {
      if (this._subscribers[i][j] === subscriber) {
        this._subscribers[i].splice(j, 1);
      }
    }
  }
};

EventManager.prototype.removeAllSubscribers = function () {
  this._subscribers = {};
};

EventManager.prototype.fireEvent = function (event) {
  var subscribers = this._subscribers[event.name];
  if (!subscribers) {
    return;
  }
  // Dispatch from a snapshot: a subscriber that removes itself (or others)
  // mid-dispatch must not cause the remaining subscribers to be skipped.
  var snapshot = subscribers.slice();
  for (var i = 0; i < snapshot.length; ++i) {
    snapshot[i].notify(event);
  }
};
