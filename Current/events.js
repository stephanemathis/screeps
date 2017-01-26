"use strict";
var spawner = require("./spawner");
function tick() {
    init();
    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var controllerLevel = room.controller.level;
        if (controllerLevel != Memory.controllerLevel[roomName])
            onControllerLevelChanged(controllerLevel, room);
        var spawns = room.find(FIND_MY_SPAWNS);
        if (spawns.length == 0 && room.controller.my) {
            var creeps = room.find(FIND_MY_CREEPS);
            if (creeps.length == 0) {
                var spawn = spawner.getBiggestSpawn();
                var isAlreadyInSpawn = Memory.spawnQueue[spawn.room.name].filter(function (t) { return t.roomName == roomName; }).length > 0;
                var isAlreadyComing = false;
                if (!isAlreadyComing) {
                    for (var name in Game.creeps) {
                        var creep = Game.creeps[name];
                        if (creep.memory.roomName == roomName)
                            isAlreadyComing = true;
                    }
                }
                if (!isAlreadyInSpawn && !isAlreadyComing) {
                    console.log("Du renfort pour la salle " + roomName);
                    spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen", false, room.name), false, spawn.room.name);
                    spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen", false, room.name), false, spawn.room.name);
                    spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen", false, room.name), false, spawn.room.name);
                }
            }
        }
    }
    for (var flagName in Game.flags) {
        var flag = Game.flags[flagName];
        if (flagName == "Conquest" && !Game.flags[flag.pos.roomName]) {
            spawner.addClaimerIfNecessary();
        }
    }
}
exports.tick = tick;
function init() {
    if (Memory.controllerLevel === undefined)
        Memory.controllerLevel = {};
    if (Memory.buildingUpgradeInfo === undefined)
        Memory.buildingUpgradeInfo = {};
    for (var roomName in Game.rooms) {
        if (Memory.controllerLevel[roomName] === undefined)
            Memory.controllerLevel[roomName] = Game.rooms[roomName].controller.level;
    }
}
exports.init = init;
function onControllerLevelChanged(newLevel, room) {
    Memory.controllerLevel[room.name] = newLevel;
    console.log("New controller level : " + newLevel);
    if (newLevel == 2) {
        var sourcesCount = room.find(FIND_SOURCES).length;
        spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
        if (sourcesCount > 1) {
            spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
            spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
            spawner.addToSpawnQueue(spawner.getSpawnQueueTarget("citizen"), false, room.name);
        }
    }
    for (var structureName in Memory.buildingUpgradeInfo) {
        Memory.buildingUpgradeInfo[structureName] = true;
    }
}
exports.onControllerLevelChanged = onControllerLevelChanged;
