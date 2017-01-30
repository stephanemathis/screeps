
export function tick()
{
    createBuildingIfNecessary();
}

export function createBuildingIfNecessary()
{
    for (var roomName in Game.rooms) {
        var room = Game.rooms[roomName];
        var targets = room.find(FIND_CONSTRUCTION_SITES);

        if (!targets.length) {
            var nextStructure = getNextStructure(room);

            if (nextStructure !== null) {
                var position = getPositionForStructure(nextStructure, room);

                if (position !== null) {
                    console.log("Creating building : " + nextStructure + " (" + position.x + "-" + position.y + ")");
                    room.createConstructionSite(position.x, position.y, nextStructure);
                }
            }
        }
    }
}

export function getNextStructure(room: Room)
{
    var controllerLevel = room.controller.level;

    var structPriority = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_RAMPART, STRUCTURE_CONTAINER];

    for (var i = 0; i < structPriority.length; i++) {
        var struct = structPriority[i];

        var max = getMaxStructureNumber(struct, controllerLevel, room);
        var count = countExistingStructures(struct, room);

        if (count < max)
            return struct;
    }

    return null;
}

export function countExistingStructures(struct: string, room: Room)
{
    var result = room.find(FIND_MY_STRUCTURES, {
        filter: {structureType: struct}
    });

    return result.length;
}

//Voir pour le nombre max d'objet par level : http://support.screeps.com/hc/en-us/articles/203086021-Global-control
export function getMaxStructureNumber(struct: string, level: number, room: Room)
{
    if (struct == STRUCTURE_EXTENSION) {
        if (level < 2)
            return 0;
        else if (level == 2)
            return 5;
        else return 10 * (level - 2);
    }

    if (struct == STRUCTURE_TOWER) {
        if (level < 3)
            return 0;
        else if (level < 5)
            return 1;
        else if (level < 7)
            return 2;
        else if (level < 8)
            return 3;
        else
            return 6;
    }

    if (struct == STRUCTURE_RAMPART) {

        if (level < 3)
            return 0;
        else {
            var towers = room.find<Tower>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            var nbOfRampartsToBuild = room.find(FIND_MY_SPAWNS).length + towers.length;
            return nbOfRampartsToBuild;
        }
    }

    if (struct == STRUCTURE_CONTAINER) {
        if (level < 2)
            return 0;
        else {
            var sources = room.find(FIND_SOURCES);
            return sources.length;
        }
    }


    if(struct == STRUCTURE_SPAWN) {
        if(level < 1)
            return 0;
        else if(level < 7)
            return 1;
        else if(level < 8)
            return 2;
        else
            return 3;
    }

    return 0;
}

export function getPositionForStructure(struct: string, room: Room)
{
    if (struct == STRUCTURE_TOWER || struct == STRUCTURE_EXTENSION || struct == STRUCTURE_SPAWN) {
        var startingPoint = null;

        if (struct == STRUCTURE_TOWER || struct == STRUCTURE_SPAWN) {
            startingPoint = room.controller.pos;
        }
        else {
            var spawns = room.find<Spawn>(FIND_MY_STRUCTURES, {filter: (s) => s.structureType == STRUCTURE_SPAWN});
            startingPoint = spawns[0].pos;
        }

        var distance = 1;

        var search = true;

        while (search) {
            var top = startingPoint.y - (distance);
            var bottom = startingPoint.y + (distance);
            var left = startingPoint.x - (distance);
            var right = startingPoint.x + (distance);

            if (top < 5)
                top = 5;

            if (left < 5)
                left = 5;

            if (bottom > 45)
                bottom = 45;

            if (right > 45)
                right = 45;

            var result = room.lookAtArea(top, left, bottom, right, false);

            for (var y = top; y <= bottom; y++) {
                for (var x = left; x <= right; x++) {
                    if ((x + y) % 2 == 1) {
                        var objectsOnPosition = result[y][x];

                        if (objectsOnPosition.length === 1 && objectsOnPosition[0].type == "terrain" && objectsOnPosition[0].terrain !== "wall") {
                            search = false;
                            return new RoomPosition(x, y, room.name);
                        }
                    }
                }
            }

            distance++;
        }
    }

    if (struct == STRUCTURE_RAMPART) {

        var spawns = room.find<Spawn>(FIND_MY_SPAWNS);

        for(var i = 0 ; i < spawns.length; i++) {
            var spawn = spawns[i];
            var results = room.lookAt(spawn.pos);

            var hasRampart = false;
            for (var j = 0; j < results.length; j++) {
                if (results[j].type == "structure" && results[j].structure.structureType == STRUCTURE_RAMPART) {
                    hasRampart = true;
                }
            }
            if (!hasRampart) {
                return spawn.pos;
            }
        }

        var towers = room.find<Tower>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});

        for (var i = 0; i < towers.length; i++) {
            var results = room.lookAt(towers[i].pos);

            var hasRampart = false;

            for (var j = 0; j < results.length; j++) {
                if (results[j].type == "structure" && results[j].structure.structureType == STRUCTURE_RAMPART) {
                    hasRampart = true;
                }
            }

            if (!hasRampart) {
                return towers[i].pos;
            }
        }
    }

    if (struct == STRUCTURE_CONTAINER) {
        var sources = room.find<Source>(FIND_SOURCES);
        for (var i = 0; i < sources.length; i++) {
            var pos = sources[i].pos;
            var result = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true);

            var numberOfContainer = (<any>result).filter((p) => {
                return p.type === "structure" && p.structure.structureType == "container"
            });

            if (numberOfContainer.length == 0) {
                var path = room.findPath(room.controller.pos, sources[i].pos, {ignoreCreeps: true});
                if(path.length == 0) {
                    path = room.findPath(room.find<Spawn>(FIND_MY_SPAWNS)[0].pos, sources[i].pos, {ignoreCreeps: true});
                }
                var lastStep = path.length == 1 ? path[0] : path[path.length - 2];
                if(lastStep)
                    return new RoomPosition(lastStep.x, lastStep.y, room.name);
            }
        }
    }

    return null;
}
