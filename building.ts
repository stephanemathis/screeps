
export function tick() {
    createBuildingIfNecessary();
}

export function createBuildingIfNecessary() {

    if (Game.time % 10 == 0) {
        for (var roomName in Game.rooms) {
            var room = Game.rooms[roomName];
            if (room.controller && room.controller.my) {
                var targets = room.find(FIND_CONSTRUCTION_SITES);

                if (!targets.length) {
                    var nextStructure = getNextStructure(room);

                    if (nextStructure !== null) {
                        var position = getPositionForStructure(nextStructure, room);

                        if (position !== null) {
                            console.log("Creating building (" + room.name + ") : " + nextStructure + " (" + position.x + "-" + position.y + ")");
                            room.createConstructionSite(position.x, position.y, nextStructure);
                        }
                    }
                }
            }
        }
    }
}

export function getNextStructure(room: Room): string {
    var controllerLevel = room.controller.level;

    var structPriority = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_CONTAINER, STRUCTURE_RAMPART, STRUCTURE_STORAGE];

    for (var i = 0; i < structPriority.length; i++) {
        var struct = structPriority[i];

        var max = getMaxStructureNumber(struct, controllerLevel, room);
        var count = countExistingStructures(struct, room);

        if (count < max)
            return struct;
    }

    return null;
}

export function countExistingStructures(struct: string, room: Room): number {
    var result = room.find(FIND_STRUCTURES, {
        filter: { structureType: struct }
    });

    return result.length;
}

//Voir pour le nombre max d'objet par level : http://support.screeps.com/hc/en-us/articles/203086021-Global-control
export function getMaxStructureNumber(struct: string, level: number, room: Room): number {
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
            var towers = room.find<Tower>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });
            var spawns = room.find(FIND_MY_SPAWNS);

            var nbOfRampartsToBuild = spawns.length + towers.length;

            if (level >= 5) {
                var innerRampartCount = 0;

                findInnerRampartZone(room, (objects) => {
                    var terrain = objects.filter(p => { return p.type == "terrain" })[0];
                    return terrain.terrain !== "wall";
                }, (pos) => {
                    innerRampartCount++;
                    return true;
                });

                nbOfRampartsToBuild += innerRampartCount;
            }

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


    if (struct == STRUCTURE_SPAWN) {
        if (level < 1)
            return 0;
        else if (level < 7)
            return 1;
        else if (level < 8)
            return 2;
        else
            return 3;
    }

    if (struct == STRUCTURE_STORAGE) {
        if (level < 4)
            return 0;
        else return 1;
    }

    if (struct == STRUCTURE_POWER_SPAWN) {
        if (level < 8)
            return 0;
        else return 1;
    }

    return 0;
}

export function getPositionForStructure(struct: string, room: Room): RoomPosition {

    if (struct == STRUCTURE_EXTENSION) {
        return findPositionForExtension(struct, room);
    }

    if (struct == STRUCTURE_TOWER || struct == STRUCTURE_SPAWN || struct == STRUCTURE_STORAGE || struct == STRUCTURE_POWER_SPAWN) {
        return findPositionForImportantStuff(struct, room);
    }

    if (struct == STRUCTURE_RAMPART) {
        return findPositionForRampart(struct, room);
    }

    if (struct == STRUCTURE_CONTAINER) {
        return findPositionForContainer(struct, room);
    }

    return null;
}


export function findPositionForExtension(struct: string, room: Room): RoomPosition {
    var startingPoint = room.controller.pos;
    var distanceFromCenter = 1;
    var reservedSpot = 1; // Pour le link

    var structs = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_POWER_SPAWN];

    for (var i = 0; i < structs.length; i++) {
        reservedSpot += getMaxStructureNumber(structs[i], 8, room) - countExistingStructures(structs[i], room);
    }

    var search = true;

    while (search) {
        var top = startingPoint.y - (distanceFromCenter);
        var bottom = startingPoint.y + (distanceFromCenter);
        var left = startingPoint.x - (distanceFromCenter);
        var right = startingPoint.x + (distanceFromCenter);

        if (top < 5)
            top = 5;

        if (left < 5)
            left = 5;

        if (bottom > 45)
            bottom = 45;

        if (right > 45)
            right = 45;

        var allZoneResult = room.lookAtArea(top, left, bottom, right, false);

        for (var yLoop in allZoneResult) {
            for (var xLoop in allZoneResult[yLoop]) {
                var x = parseInt(xLoop);
                var y = parseInt(yLoop);
                // On recherche uniquement sur l'extérieur du cadre, car l'intérieur est déjà vérifié aux itérations précédentes
                if (x == left || x == right || y == top || y == bottom) {
                    // On place seulement sur les cases impaires pour laisser de la place entre les extensions
                    if ((x + y) % 2 == 1) {
                        var objectsOnPos = <LookAtResultWithPos[]>allZoneResult[y][x];

                        if (objectsOnPos.length == 1) {
                            var object = objectsOnPos[0];
                            if (object.type == "terrain" && object.terrain !== "wall") {
                                // Cette case est libre, on regarde si on a assez d'emplacement réservé et assez loin du controleur
                                if (reservedSpot <= 0 && ((Math.abs(room.controller.pos.x - x) > 3 || Math.abs(room.controller.pos.y - y) > 3))) {
                                    return new RoomPosition(x, y, room.name);
                                }
                                reservedSpot--;
                            }
                        }
                    }

                }
            }
        }

        distanceFromCenter++;
    }
}

export function findPositionForImportantStuff(struct: string, room: Room): RoomPosition {
    var startingPoint = room.controller.pos;
    var distanceFromCenter = 1;

    var search = true;

    while (search) {
        var top = startingPoint.y - (distanceFromCenter);
        var bottom = startingPoint.y + (distanceFromCenter);
        var left = startingPoint.x - (distanceFromCenter);
        var right = startingPoint.x + (distanceFromCenter);

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

        distanceFromCenter++;
    }
}

export function findPositionForRampart(struct: string, room: Room): RoomPosition {

    var spawns = room.find<Spawn>(FIND_MY_SPAWNS);

    for (var i = 0; i < spawns.length; i++) {
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

    var towers = room.find<Tower>(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_TOWER } });

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

    var rampartPos: RoomPosition = null;

    findInnerRampartZone(room, (objects) => {
        var terrain = objects.filter(p => { return p.type == "terrain" })[0];
        var ok = terrain.terrain !== "wall";

        if (ok) {
            
            return objects.filter(p => { return p.type == "structure" && p.structure.structureType == STRUCTURE_RAMPART }).length == 0;
        }
        else
            return false;

    }, (pos) => {
        if (!rampartPos)
            rampartPos = pos;

        return false;
    });

    return rampartPos;
}


export function findPositionForContainer(struct: string, room: Room): RoomPosition {
    var sources = room.find<Source>(FIND_SOURCES);
    for (var i = 0; i < sources.length; i++) {
        var pos = sources[i].pos;
        var result = room.lookAtArea(pos.y - 1, pos.x - 1, pos.y + 1, pos.x + 1, true);

        var numberOfContainer = (<any>result).filter((p) => {
            return p.type === "structure" && p.structure.structureType == "container"
        });

        if (numberOfContainer.length == 0) {
            var path = room.findPath(room.controller.pos, sources[i].pos, { ignoreCreeps: true });
            if (path.length == 0) {
                path = room.findPath(room.find<Spawn>(FIND_MY_SPAWNS)[0].pos, sources[i].pos, { ignoreCreeps: true });
            }
            var lastStep = path.length == 1 ? path[0] : path[path.length - 2];
            if (lastStep)
                return new RoomPosition(lastStep.x, lastStep.y, room.name);
        }
    }
}

/**
 * Explore la zone autour du controleur.
 * considerPos : retourne true si la position est valide pour unr hasRampart
 * onPosFound : retourne true s'il faut continuer de chercher sur la même distance
 */
export function findInnerRampartZone(room: Room, considerPos: (objects: LookAtResultWithPos[]) => boolean, onPosFound: (pos: RoomPosition) => boolean) {
    var innerWallDistance = 4;
    //On va regarder autour de 3 puis 4 etc, la 1ere extension et ça sera ça la limite, c'est plus simple

    var search = true;
    var startingPoint = room.controller.pos;

    while (search) {
        var top = startingPoint.y - (innerWallDistance);
        var bottom = startingPoint.y + (innerWallDistance);
        var left = startingPoint.x - (innerWallDistance);
        var right = startingPoint.x + (innerWallDistance);

        if (top < 5)
            top = 5;

        if (left < 5)
            left = 5;

        if (bottom > 45)
            bottom = 45;

        if (right > 45)
            right = 45;

        var allZoneResult = room.lookAtArea(top, left, bottom, right, false);

        for (var yLoop in allZoneResult) {
            for (var xLoop in allZoneResult[yLoop]) {
                var x = parseInt(xLoop);
                var y = parseInt(yLoop);
                // On recherche uniquement sur l'extérieur du cadre, car l'intérieur est déjà vérifié aux itérations précédentes
                if (x == left || x == right || y == top || y == bottom) {
                    var objectsOnPos = <LookAtResultWithPos[]>allZoneResult[y][x];

                    if (considerPos(objectsOnPos)) {
                        var continueSearch = onPosFound(new RoomPosition(x, y, room.name));
                        search = false;

                        if (!continueSearch) {
                            break;
                        }
                    }
                }
            }
        }

        innerWallDistance++;
    }
}