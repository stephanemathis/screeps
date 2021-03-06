
export function tick() {
    init();
    respawnDeadCreeps();
    spawnIfNecessary();
}

export function init() {
    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        if (room.controller && room.controller.my) {
            if (Memory.spawnQueue === undefined)
                Memory.spawnQueue = {};

            if (Memory.spawnQueue[roomName] === undefined) {

                var sourcesCount = Game.rooms[roomName].find<Source>(FIND_SOURCES).length;

                Memory.spawnQueue[roomName] = [
                    getSpawnQueueTarget("citizen", true),
                    getSpawnQueueTarget("citizen", true),
                    getSpawnQueueTarget("citizen", true)
                ];

                if (sourcesCount > 0)
                    Memory.spawnQueue[roomName].push(getSpawnQueueTarget("miner", true));
                if (sourcesCount > 1)
                    Memory.spawnQueue[roomName].push(getSpawnQueueTarget("miner", true));

                Memory.spawnQueue[roomName].push(getSpawnQueueTarget("citizen", true));
            }
        }
    }
    if (Memory.creepCount === undefined) {
        Memory.creepCount = 0;
    }
}

export function addToSpawnQueue(spawnTarget: SpawnQueueTarget, front: boolean, spawnRoomName: string) {
    if (front) {
        Memory.spawnQueue[spawnRoomName].unshift(spawnTarget);
    }
    else {
        Memory.spawnQueue[spawnRoomName].push(spawnTarget);
    }
}

export function spawnIfNecessary() {

    for (var roomName in Game.rooms) {
        var spawns = Game.rooms[roomName].find<Spawn>(FIND_MY_SPAWNS);

        for (var i = 0; i < spawns.length; i++) {
            var spawn = spawns[i];

            if (spawn.spawning == null) {
                var roomName = spawn.room.name;
                var roomSpawnQueue = Memory.spawnQueue[roomName];

                if (roomSpawnQueue && roomSpawnQueue.length > 0) {
                    var nextSpawnTarget = roomSpawnQueue[0];

                    if (!nextSpawnTarget) {
                        roomSpawnQueue.shift();
                        if (roomSpawnQueue.length > 0)
                            nextSpawnTarget = roomSpawnQueue[0];
                    }

                    if (nextSpawnTarget) {
                        var parts = getParts(nextSpawnTarget, spawn);
                        var spawnReslt = spawn.canCreateCreep(parts);
                        if (spawnReslt === 0) {
                            var creepRoom = nextSpawnTarget.roomName;
                            if (!creepRoom)
                                creepRoom = roomName;
                            var result = spawn.createCreep(parts, nextSpawnTarget.role + " " + Memory.creepCount, getCreepMemory(creepRoom, nextSpawnTarget.role, nextSpawnTarget.respawnAfterDeath, nextSpawnTarget.secondaryRole));
                            console.log("Creating new creep : " + nextSpawnTarget.role);
                            Memory.spawnQueue[roomName].shift();
                            Memory.creepCount += 1;
                            // Break pour seulement spawner une fois par tour, car l'énergie n'est pas consommée tout de suite
                            break;
                        }
                    }
                }
            }
        }
    }





}

export function getParts(spawnTarget: SpawnQueueTarget, spawn: Spawn): string[] {
    var maxEnergy = spawn.room.energyCapacityAvailable;
    var idealParts = {
        "upgrader": [WORK, MOVE, CARRY, CARRY, MOVE, MOVE, MOVE, WORK, MOVE],
        "upgraderMaxParts": 18,
        "citizen": [MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY],
        "citizenMaxParts": 16,
        "miner": [MOVE, WORK, WORK, MOVE, WORK, MOVE, WORK, MOVE, WORK, MOVE],
        "minerMaxParts": 10,
        "claimer": [MOVE, CLAIM],
        "claimerMaxParts": 2,
        "squadattacker": [MOVE, ATTACK],
        "squadattackerMaxParts": 50,
        "squadhealer": [MOVE, HEAL],
        "squadhealerMaxParts": 50
    };
    var availableParts = idealParts[spawnTarget.role + (spawnTarget.secondaryRole ? spawnTarget.secondaryRole : "")];
    var parts = [];
    var hasEnoughenergy = true;
    var index = 0;
    var totalEnergy = 0;
    var maxNbParts = Math.min(idealParts[spawnTarget.role + (spawnTarget.secondaryRole ? spawnTarget.secondaryRole : "") + "MaxParts"], spawnTarget.maxParts);

    while (hasEnoughenergy) {
        var nextPart = availableParts[index % availableParts.length];
        var cost = getPartCost(nextPart);
        var totalCost = cost + totalEnergy;
        if (totalCost > maxEnergy || parts.length >= maxNbParts) {
            hasEnoughenergy = false;
        }
        else {
            parts.push(nextPart);
            totalEnergy += cost;
            index = index + 1;
        }
    }

    return parts;
}

export function getPartCost(part: string) {
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
}

export function respawnDeadCreeps() {
    for (var i in Memory.creeps) {
        if (!Game.creeps[i]) {
            if (Memory.creeps[i].respawnAfterDeath)
                addToSpawnQueue(getSpawnQueueTarget(Memory.creeps[i].role, true), true, Memory.creeps[i].roomName);
            delete Memory.creeps[i];
        }
    }
}

export function getBiggestSpawn(roomNameToIgnore: string): Spawn {
    var targetSpawn: Spawn = null;
    for (var spawnName in Game.spawns) {
        var spawn = Game.spawns[spawnName];
        if (roomNameToIgnore != spawn.room.name && Game.rooms[spawn.room.name].find(FIND_MY_CREEPS).length && (!targetSpawn || targetSpawn.room.energyCapacityAvailable < spawn.room.energyCapacityAvailable))
            targetSpawn = spawn;
    }
    return targetSpawn;
}

export function addClaimerIfNecessary(roomNameToIgnore: string) {
    var targetSpawn = getBiggestSpawn(roomNameToIgnore);

    if (targetSpawn != null) {
        if (Memory.spawnQueue[targetSpawn.room.name].filter(st => { return st.role == "claimer" }).length == 0) {
            var nbOfclaimer = 0;
            for (var creepName in Game.creeps) {
                var creep = Game.creeps[creepName];
                if (creep.memory.role == "claimer")
                    nbOfclaimer = nbOfclaimer + 1;
            }

            if (nbOfclaimer == 0)
                addToSpawnQueue(getSpawnQueueTarget("claimer", false, roomNameToIgnore), false, targetSpawn.room.name);
        }
    }
}

export function getSpawnQueueTarget(role: string, respawnAfterDeath = true, roomName?: string, maxParts?: number, secondaryRole?: string): SpawnQueueTarget {
    return {
        role: role,
        roomName: roomName,
        maxParts: !!maxParts ? maxParts : 50,
        respawnAfterDeath: respawnAfterDeath === undefined ? true : respawnAfterDeath,
        secondaryRole: secondaryRole
    };
}

export function getCreepMemory(roomName: string, role: string, respawnAfterDeath: boolean, secondaryRole: string): CreepMemory {
    return {
        roomName: roomName,
        role: role,
        respawnAfterDeath: respawnAfterDeath,
        secondaryRole: secondaryRole
    };
}
