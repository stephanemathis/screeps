
module.exports = {
    tick()
    {
        for(var roomName in Game.rooms)
        {
            var room = Game.rooms[roomName];
            var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
            
            if(hostiles.length > 0) {
                
                for(var spawnName in room.spawns)
                {
                    var spawn = room.spawns[spawnName];
                    if(spawn.hits < spawn.hitsMax)
                    {
                        spawn.activateSafeMode();
                    }
                }
                
                var username = hostiles[0].owner.username;
                if(username != "Invader")
                {
                    Game.notify(`User ${username} spotted in room ${roomName}`);
                }
                var towers = room.find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                    
                towers.forEach(tower => tower.attack(hostiles[0]));
            }
        }
    },
};