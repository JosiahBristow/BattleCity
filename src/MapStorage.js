var MapStorage = {};

MapStorage.STORAGE_KEY = 'battle_city_custom_maps';

MapStorage.maps = null;
MapStorage.currentMap = null;
MapStorage.usingCustomMap = false;
MapStorage.selectedIndex = 0;

MapStorage.save = function (mapText) {
  var maps = MapStorage.getMaps();
  var existing = null;
  for (var i = 0; i < maps.length; ++i) {
    if (maps[i].map == mapText) {
      existing = maps[i];
      MapStorage.selectedIndex = i;
      break;
    }
  }
  if (existing) {
    MapStorage.currentMap = mapText;
    return existing.name;
  }
  var name = MapStorage._nextName();
  maps.push({name: name, map: mapText, tanks: null});
  MapStorage._setMaps(maps);
  MapStorage.currentMap = mapText;
  MapStorage.selectedIndex = maps.length - 1;
  return name;
};

MapStorage.saveMapWithTanks = function (mapText, tanks) {
  var maps = MapStorage.getMaps();
  var existing = null;
  for (var i = 0; i < maps.length; ++i) {
    if (maps[i].map == mapText) {
      existing = maps[i];
      MapStorage.selectedIndex = i;
      break;
    }
  }
  if (existing) {
    existing.tanks = tanks;
    MapStorage._setMaps(maps);
    MapStorage.currentMap = mapText;
    return existing.name;
  }
  var name = MapStorage._nextName();
  maps.push({name: name, map: mapText, tanks: tanks});
  MapStorage._setMaps(maps);
  MapStorage.currentMap = mapText;
  MapStorage.selectedIndex = maps.length - 1;
  return name;
};

MapStorage.loadTanks = function () {
  var map = MapStorage.getMap(MapStorage.selectedIndex);
  if (map && map.tanks) {
    return map.tanks;
  }
  return null;
};

MapStorage.getMaps = function () {
  if (MapStorage.maps === null) {
    try {
      var data = localStorage.getItem(MapStorage.STORAGE_KEY);
      if (data) {
        MapStorage.maps = JSON.parse(data);
      }
      else {
        var oldData = localStorage.getItem('battle_city_custom_map');
        if (oldData) {
          MapStorage.maps = [{name: 'CUSTOM 1', map: oldData}];
          MapStorage._setMaps(MapStorage.maps);
        }
        else {
          MapStorage.maps = [];
        }
      }
    }
    catch (e) {
      MapStorage.maps = [];
    }
  }
  return MapStorage.maps;
};

MapStorage._setMaps = function (maps) {
  MapStorage.maps = maps;
  try {
    localStorage.setItem(MapStorage.STORAGE_KEY, JSON.stringify(maps));
  }
  catch (e) {}
};

MapStorage.getMap = function (index) {
  var maps = MapStorage.getMaps();
  if (index < 0 || index >= maps.length) {
    return null;
  }
  return maps[index];
};

MapStorage.getCount = function () {
  return MapStorage.getMaps().length;
};

MapStorage.hasMap = function () {
  return MapStorage.getCount() > 0;
};

MapStorage._nextName = function () {
  var maps = MapStorage.getMaps();
  var used = {};
  maps.forEach(function (m) {
    used[m.name] = true;
  });
  var i = 1;
  while (used['CUSTOM ' + i]) {
    ++i;
  }
  return 'CUSTOM ' + i;
};

MapStorage.load = function () {
  var map = MapStorage.getMap(MapStorage.selectedIndex);
  return map ? map.map : null;
};

MapStorage.loadByName = function (name) {
  var maps = MapStorage.getMaps();
  for (var i = 0; i < maps.length; ++i) {
    if (maps[i].name == name) {
      MapStorage.selectedIndex = i;
      return maps[i].map;
    }
  }
  return null;
};

MapStorage.getIndexByName = function (name) {
  var maps = MapStorage.getMaps();
  for (var i = 0; i < maps.length; ++i) {
    if (maps[i].name == name) {
      return i;
    }
  }
  return -1;
};

MapStorage.selectByName = function (name) {
  var index = MapStorage.getIndexByName(name);
  if (index !== -1) {
    MapStorage.selectedIndex = index;
    return true;
  }
  return false;
};

MapStorage.removeByName = function (name) {
  var index = MapStorage.getIndexByName(name);
  if (index !== -1) {
    MapStorage.remove(index);
    return true;
  }
  return false;
};

MapStorage.updateByName = function (name, mapText, tanks) {
  var index = MapStorage.getIndexByName(name);
  var maps = MapStorage.getMaps();
  if (index !== -1) {
    maps[index].map = mapText;
    maps[index].tanks = tanks || null;
    MapStorage._setMaps(maps);
    return true;
  }
  return false;
};

MapStorage.saveStage = function (name, mapText, tanks) {
  if (MapStorage.updateByName(name, mapText, tanks)) {
    MapStorage.selectByName(name);
    return name;
  }
  var maps = MapStorage.getMaps();
  maps.push({name: name, map: mapText, tanks: tanks || null});
  MapStorage._setMaps(maps);
  MapStorage.selectedIndex = maps.length - 1;
  MapStorage.currentMap = mapText;
  return name;
};

MapStorage.select = function (index) {
  MapStorage.selectedIndex = index;
};

MapStorage.getSelectedIndex = function () {
  return MapStorage.selectedIndex;
};

MapStorage.remove = function (index) {
  var maps = MapStorage.getMaps();
  if (index < 0 || index >= maps.length) {
    return;
  }
  maps.splice(index, 1);
  MapStorage._setMaps(maps);
  if (MapStorage.selectedIndex >= maps.length) {
    MapStorage.selectedIndex = Math.max(0, maps.length - 1);
  }
  if (maps.length == 0) {
    MapStorage.selectedIndex = 0;
    MapStorage.currentMap = null;
  }
};

MapStorage.rename = function (index, newName) {
  var maps = MapStorage.getMaps();
  if (index < 0 || index >= maps.length) {
    return;
  }
  maps[index].name = newName;
  MapStorage._setMaps(maps);
};

MapStorage.update = function (index, mapText, tanks) {
  var maps = MapStorage.getMaps();
  if (index < 0 || index >= maps.length) {
    return;
  }
  maps[index].map = mapText;
  maps[index].tanks = tanks || null;
  MapStorage._setMaps(maps);
};

MapStorage.activate = function () {
  MapStorage.usingCustomMap = true;
};

MapStorage.deactivate = function () {
  MapStorage.usingCustomMap = false;
};
