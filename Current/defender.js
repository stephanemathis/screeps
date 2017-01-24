"use strict";
function tick() {
    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            var spawns = room.find(FIND_MY_SPAWNS);
            for (var i = 0; i < spawns.length; i++) {
                var spawn = spawns[i];
                if (spawn.hits < spawn.hitsMax) {
                    room.controller.activateSafeMode();
                }
            }
            var username = hostiles[0].owner.username;
            if (username != "Invader") {
                Game.notify("User " + username + " spotted in room " + roomName);
            }
            var towers = room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
            towers.forEach(function (tower) { return tower.attack(hostiles[0]); });
        }
    }
}
exports.tick = tick;
