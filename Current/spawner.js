var building = require("building");
var _ = require('lodash');

module.exports = {

    tick()
    {
        this.init();
        this.respawnDeadCreeps();
        this.spawnIfNecessary();
    },

    init()
    {
        for(var roomName in Game.rooms) {

            if(Memory[roomName] === undefined) {
                if(Memory[roomName].spawnQueue === undefined)
                    Memory[roomName].spawnQueue = {spawnQueue : ["citizen", "citizen", "citizen", "miner", "miner", "citizen"]};
            }

            if(_.filter(Game.flags, (f) => { return f.name == roomName }).length == 0) {
                Game.rooms[roomName].createFlag(25, 25, roomName);
            }
        }

        if (Memory.CreepCount === undefined) {
            Memory.CreepCount = 0;
        }
    },

    addToSpawnQueue(creepsRole, front, roomName)
    {
        if (front) {
            Memory[roomName].spawnQueue.unshift(creepsRole);
        }
        else {
            if (creepsRole.constructor === Array) {
                Memory[roomName].spawnQueue = Memory[roomName].spawnQueue.concat(creepsRole);
            }
            else {
                Memory[roomName].spawnQueue.push(creepsRole);
            }
        }

    },

    spawnIfNecessary()
    {
        for (var spawnName in Game.spawns) {
            var spawn = Game.spawns[spawnName];

            if (spawn.spawning == null) {
                var roomName = spawn.room.name;
                var roomSpawnQueue = Memory[roomName].spawnQueue;
                if (roomSpawnQueue.length > 0) {
                    var nextCreepRole = roomSpawnQueue[0];
                    if (!nextCreepRole) {
                        roomSpawnQueue.shift();
                        if (roomSpawnQueue.length > 0)
                            nextCreepRole = roomSpawnQueue[0];
                    }

                    if (nextCreepRole) {
                        var parts = this.getParts(nextCreepRole, spawn);

                        var spawnReslt = spawn.canCreateCreep(parts);

                        if (spawnReslt === 0) {
                            var result = spawn.createCreep(parts, nextCreepRole + " " + Memory.CreepCount, {role: nextCreepRole, roomName: spawn.room.name});

                            console.log("Creating new creep : " + nextCreepRole);

                            Memory.spawnQueue.shift();
                            Memory.CreepCount += 1;
                        }
                    }
                }
            }
        }
    },

    getParts(role, spawn)
    {
        var maxEnergy = spawn.room.energyCapacityAvailable;

        // A la fin du tableau ça recommance ex : WORK, WORK, MOVE => WORK, WORK, MOVE, WORK, WORK, MOVE, ..
        var idealParts = {
            "upgrader": [WORK, MOVE, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, MOVE],
            "upgraderMaxParts": 18,
            "citizen": [WORK, MOVE, CARRY, MOVE, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE],
            "citizenMaxParts": 18,
            "miner": [MOVE, WORK, WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE],
            "minerMaxParts": 10,
            "claimer": [MOVE, CLAIM, MOVE, WORK],
            "claimerMaxParts": 9999
        };

        var availableParts = idealParts[role];
        var parts = [];
        var hasEnoughenergy = true;
        var index = 0;
        var totalEnergy = 0;

        while (hasEnoughenergy) {
            var nextPart = availableParts[index % availableParts.length];

            var cost = this.getPartCost(nextPart);

            var totalCost = cost + totalEnergy;

            if (totalCost > maxEnergy || parts.length >= idealParts[role + "MaxParts"]) {
                hasEnoughenergy = false;
            }
            else {
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
        for (var i in Memory.creeps) {
            if (!Game.creeps[i] && Memory.creeps[i].role != "claimer") {
                this.addToSpawnQueue(Memory.creeps[i].role, true, Memory.creeps[i].roomName);
                delete Memory.creeps[i];
            }
        }

    },

    addClaimerIfNecessary() {
        var targetSpawn = null;

        for (var spawnName in Game.spawns) {
            var spawn = Game.spawns[spawnName];

            if(spawn.room.energyCapacityAvailable > this.getPartCost([CLAIM, MOVE])) {
                if(!targetSpawn || targetSpawn.room.energyCapacityAvailable < spawn.room.energyCapacityAvailable)
                    targetSpawn = spawn;
            }
        }

        if(targetSpawn != null) {
            if(Memory[roomName].spawnQueue.includes("claimer") == false) {
                if (_.filter((Game.creeps, (c) => { return c.memory.role == "claimer" })).length == 0) {
                    this.addToSpawnQueue("claimer", false, targetSpawn.room.name);
                }
            }
        }
    },
};
