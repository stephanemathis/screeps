
export function run(creep: Creep) {

    var turnConsumed = false;
    var turnGoal = Memory.turnGoal[creep.room.name];

    turnConsumed = creep.goToRoomIfNecessary();

    // On va chercher de l'énergie
    if (!turnConsumed) {
        if (creep.carry.energy == creep.carryCapacity)
            creep.memory.dispatch = true;
        else if (!creep.carry.energy)
            creep.memory.dispatch = false;

        if (creep.memory.dispatch == false) {

            creep.findAndPickEnergy();
            turnConsumed = true;
        }
    }

    // On upgrade le controller si bientot downgradé
    if (!turnConsumed) {
        if (creep.room.controller && creep.room.controller.my && creep.room.controller.ticksToDowngrade < 1000) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            turnConsumed = true;
        }
    }

    // On cherche les structures qui ont besoin d'énergie (Spawn, Extension, ...)
    if (!turnConsumed) {
        if (turnGoal.fillEnergyTargetId === undefined) {
            var targetsFillEnergy = <Structure[]>creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            });

            if (targetsFillEnergy.length > 0) {
                turnGoal.fillEnergyTargetId = targetsFillEnergy[0].id;
            }
            else {
                turnGoal.fillEnergyTargetId = null;
            }
        }

        if (turnGoal.fillEnergyTargetId) {
            let fillEnergyTarget = Game.getObjectById<Structure>(turnGoal.fillEnergyTargetId);

            if (creep.transfer(fillEnergyTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(fillEnergyTarget);
            }
            turnConsumed = true;
        }
    }

    // On cherche ce qu'on peut réparer
    if (!turnConsumed) {
        if (turnGoal.repairTargetId === undefined) {
            if (Memory.buildingUpgradeInfo === undefined)
                Memory.buildingUpgradeInfo = {};

            var maxHits = getRampartMaxHits(creep.room);

            var repairTargets = <Spawn[] | Structure[]>creep.room.find(FIND_MY_STRUCTURES, {
                filter: (structure: Structure) => {

                    if (structure.structureType != STRUCTURE_RAMPART) {
                        return false;
                    }
                    else {
                        var possibleStructure = structure;

                        if (possibleStructure.hits >= maxHits) {
                            Memory.buildingUpgradeInfo[possibleStructure.id] = false;
                        }

                        if (possibleStructure.hits < maxHits * 0.8) {
                            Memory.buildingUpgradeInfo[possibleStructure.id] = true;
                            return true;
                        }
                        else {
                            return !!Memory.buildingUpgradeInfo[possibleStructure.id];
                        }
                    }
                }
            });

            if (repairTargets.length) {
                turnGoal.repairTargetId = repairTargets[0].id;
            } else {
                turnGoal.repairTargetId = null;
            }
        }

        if (turnGoal.repairTargetId) {
            var repairTarget = Game.getObjectById<Structure>(turnGoal.repairTargetId);
            if (creep.repair(repairTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(repairTarget);
            }
            turnConsumed = true;
        }
    }

    // Sinon on cherche ce qu'il faut construire
    if (!turnConsumed) {
        if (turnGoal.constructionSiteId === undefined) {
            var targets = <ConstructionSite[]>creep.room.find(FIND_CONSTRUCTION_SITES);
            if (targets.length)
                turnGoal.constructionSiteId = targets[0].id;
            else
                turnGoal.constructionSiteId = null;
        }

        if (turnGoal.constructionSiteId) {
            var buildTarget = Game.getObjectById<ConstructionSite>(turnGoal.constructionSiteId);
            if (creep.build(buildTarget) == ERR_NOT_IN_RANGE) {
                creep.moveTo(buildTarget);
            }
            turnConsumed = true;
        }
    }

    // On cherche les Storages qui ont besoin d'énergie
    if (!turnConsumed) {
        if (turnGoal.fillStorageTargetId === undefined) {
            let storages = <Storage[]>creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_STORAGE;
                }
            });

            if (storages.length > 0) {
                let storage = storages[0];
                if (storage.store.energy < getDesiredStorageCapacity(creep.room))
                    turnGoal.fillStorageTargetId = storage.id;
                else turnGoal.fillStorageTargetId = null;
            }
            else {
                turnGoal.fillStorageTargetId = null;
            }
        }

        if (turnGoal.fillStorageTargetId) {
            let storageTarget = Game.getObjectById<Storage>(turnGoal.fillStorageTargetId);

            if (creep.transfer(storageTarget, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(storageTarget);
            }
            turnConsumed = true;
        }
    }

    // Sinon on upgrade simplement le controller
    if (!turnConsumed) {
        if (creep.room.controller && creep.room.controller.my) {
            if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
            turnConsumed = true;
        }
    }
}

export function getRampartMaxHits(room: Room): number {
    if (room.controller && room.controller.my) {
        var level = room.controller.level;

        if (level < 5)
            return 50000;
        else if (level < 7)
            return 300000;
        else if (level < 8)
            return 1000000;
        else return 1000000;
    }
    else
        return 0;
}

export function getDesiredStorageCapacity(room: Room): number {
    if (room.controller && room.controller.my) {
        return room.energyCapacityAvailable * 3;
    }
    else
        return 0;
}