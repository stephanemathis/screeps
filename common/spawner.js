/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('spawner');
 * mod.thing == 'a thing'; // true
 */

module.exports = {

    init() 
    {
        if(Memory.spawnQueue === undefined)
        {
            Memory.spawnQueue = ["harvester", "harvester", "upgrader", "upgrader", "upgrader"];
        }
    },
    
    addToSpawnQueue(creepsRole, front) 
    {
        if(front)
        {
            Memory.spawnQueue.unshift(creepsRole);
        }
        else {
            if(creepsRole.constructor === Array)
            {
                Memory.spawnQueue = Memory.spawnQueue.concat(creepsRole);
            }
            else {
                Memory.spawnQueue.push(creepsRole);
            }
        }
            
    },

    spawnIfNecessary()
    {
        var spawn = Game.spawns.Spawn1;
        
        if(spawn.spawning == null) 
        {
            if(Memory.spawnQueue.length > 0)
            {
                var nextCreepRole = Memory.spawnQueue[0];
                
                if(spawn.canCreateCreep(this.getParts(nextCreepRole)) === 0)
                {
                    var result = spawn.createCreep([WORK, CARRY, MOVE], nextCreepRole+ " " + Memory.CreepCount, {role: nextCreepRole});
                    
                    console.log("Creating new creep : " + nextCreepRole);
                    
                    Memory.spawnQueue.shift();
                    Memory.CreepCount += 1;
                }
            }
        }
    },

    getParts(role) 
    {
        //A terme il y aura d'autres choses ici en fonction de l'énergie et du niveau du controller
        return [WORK, CARRY, MOVE];    
    },

    respawnDeadCreeps() {
        for(var i in Memory.creeps) 
        {
            if(!Game.creeps[i]) {
                this.addToSpawnQueue(Memory.creeps[i].role, true);
                delete Memory.creeps[i];
            }
        }

    },
};



























