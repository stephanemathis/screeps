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

        for(var spawnName in Game.spawns)
        {
            var spawn = Game.spawns[spawnName];

            if(spawn.spawning == null)
            {
                if(Memory.spawnQueue.length > 0)
                {
                    var nextCreepRole = Memory.spawnQueue[0];
                    var parts = this.getParts(nextCreepRole, spawn);

                    if(spawn.canCreateCreep(parts) === 0)
                    {
                        var result = spawn.createCreep(parts, nextCreepRole+ " " + Memory.CreepCount, {role: nextCreepRole});

                        console.log("Creating new creep : " + nextCreepRole);

                        Memory.spawnQueue.shift();
                        Memory.CreepCount += 1;
                    }
                }
            }
        }
    },

    getParts(role, spawn)
    {
        return [WORK, CARRY, MOVE];
        // var maxEnergy = spawn.room.energyAvailable;
        //
        // // A la fin du tableau ça recommance ex : WORK, WORK, MOVE => WORK, WORK, MOVE, WORK, WORK, MOVE, ..
        // var idealParts = {
        //     "harvester": [WORK, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, WORK, MOVE],
        //     "builder": [WORK, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, WORK, MOVE],
        //     "upgrader" : [WORK, CARRY, MOVE, CARRY, CARRY, MOVE, CARRY, WORK, MOVE],
        //     //"miner" : [WORK, WORK, MOVE, WORK],
        //     //"transporter": [CARRY, CARRY, MOVE, MOVE],
        // };
        //
        // var availableParts = idealParts[role];
        // var parts = [];
        // var hasEnoughenergy = true;
        // var index = 0;
        // var totalEnergy = 0;
        //
        // while(hasEnoughenergy)
        // {
        //     var nextPart = availableParts[index];
        //     console.log(nextPart);
        //     var cost = this.getPartCost(nextPart);
        //     if(cost + totalEnergy < maxEnergy)
        //     {
        //         parts.push(nextPart);
        //         index++;
        //     }
        //     else
        //     {
        //         hasEnoughenergy = false;
        //     }
        // }
        //
        // return parts;
    },

    getPartCost(part)
    {
        var bodyCost = {
          "move": 50,
          "carry": 50,
          "work": 20,
          "heal": 200,
          "tough": 20,
          "attack": 80,
          "ranged_attack": 150
        };

        return bodyCost[part];
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
