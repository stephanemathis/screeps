
export function tick() {
    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        if (room.controller && room.controller.my) {
            var hostiles = room.find<Creep>(FIND_HOSTILE_CREEPS);

            if (hostiles.length > 0) {

                var spawns = room.find(FIND_MY_SPAWNS);

                for (var i = 0; i < spawns.length; i++) {
                    var spawn = <Spawn>spawns[i];
                    if (spawn.hits < spawn.hitsMax) {
                        room.controller.activateSafeMode();
                    }
                }

                var username = hostiles[0].owner.username;
                if (username != "Invader") {
                    Game.notify(`User ${username} spotted in room ${roomName}`);
                }

                var towers = <Tower[]>room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

                for (var i = 0; i < towers.length; i++) {
                    var tower = towers[i];
                    var closestEnemyCreep = tower.pos.findClosestByRange(hostiles);
                    tower.attack(closestEnemyCreep);
                }
            }
            else {
                var structures = room.find<Structure>(FIND_STRUCTURES);

                var roads = structures.filter(s => { return (s.structureType == STRUCTURE_ROAD) && s.hits < s.hitsMax * 0.8; });

                if (roads.length > 0) {
                    var towers = <Tower[]>room.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
                    towers.forEach(tower => {
                        tower.repair(roads[0]);
                    });
                }
            }
        }
    }
}
