var building = require("building");

module.exports = {

    tick()
    {
        this.init();
        this.respawnDeadCreeps();
        this.spawnIfNecessary();
    },

    init()
    {
        if(Memory.spawnQueue === undefined)
        {
            Memory.spawnQueue = ["citizen", "miner", "miner", "citizen", "citizen", "citizen"];
        }
        
        if(Memory.CreepCount === undefined)
        {
            Memory.CreepCount = 0;
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

                    var spawnReslt = spawn.canCreateCreep(parts);

                    if(spawnReslt === 0)
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
        var maxEnergy = 300 + building.countExistingStructures(STRUCTURE_EXTENSION, spawn.room) * 50;

        // A la fin du tableau ?a recommance ex : WORK, WORK, MOVE => WORK, WORK, MOVE, WORK, WORK, MOVE, ..
        var idealParts = {
            "upgrader" : [WORK, MOVE, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, MOVE],
            "citizen" : [WORK, MOVE, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, MOVE],
            "miner" : [MOVE, CARRY, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, WORK, WORK]
        };

        var availableParts = idealParts[role];
        var parts = [];
        var hasEnoughenergy = true;
        var index = 0;
        var totalEnergy = 0;

        while(hasEnoughenergy)
        {
            var nextPart = availableParts[index % availableParts.length];

            var cost = this.getPartCost(nextPart);

            var totalCost = cost + totalEnergy;

            if(totalCost > maxEnergy)
            {
                hasEnoughenergy = false;
            }
            else
            {
                parts.push(nextPart);
                totalEnergy += cost;
                index = index + 1;
            }
        }

        return parts.sort();
    },

    getPartCost(part)
    {
        var bodyCost = {
          "move": 50,
          "carry": 50,
          "work": 100,
          "heal": 250,
          "tough": 10,
          "attack": 80,
          "ranged_attack": 150,
          "claim": 600
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
