
export function run(creep: Creep) {

    if(!creep.goToRoomIfNecessary()) {
        if (creep.carry.energy == creep.carryCapacity)
            creep.memory.dispatch = true;
        else if (!creep.carry.energy)
            creep.memory.dispatch = false;

        if (creep.memory.dispatch == false) {
            // On va chercher de l'énergie
            creep.findAndPickEnergy();
        }
        else {
            // On cherche les structures qui ont besoin d'énergie (Spawn, Extension, ...)
            var targetsFillEnergy = <Structure[]>creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            });

            if (targetsFillEnergy.length > 0) {
                if (creep.transfer(targetsFillEnergy[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetsFillEnergy[0]);
                }
            }
            else {
                // Sinon on cherche ce qu'il faut construire
                var targets = <ConstructionSite[]>creep.room.find(FIND_CONSTRUCTION_SITES);

                if (targets.length) {
                    if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0]);
                    }
                }
                else {

                    if (Memory.buildingUpgradeInfo === undefined)
                        Memory.buildingUpgradeInfo = {};

                    var repairTargets = <Spawn[] | Structure[]>creep.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {

                            if (structure.structureType != STRUCTURE_RAMPART)
                                return false;

                            var possibleStructure = structure;

                            if (possibleStructure.hits == possibleStructure.hitsMax) {
                                Memory.buildingUpgradeInfo[possibleStructure.id] = false;
                            }

                            if (possibleStructure.hits < possibleStructure.hitsMax * 0.5) {
                                Memory.buildingUpgradeInfo[possibleStructure.id] = true;
                                return true;
                            }
                            else {
                                return !!Memory.buildingUpgradeInfo[possibleStructure.id];
                            }
                        }
                    });

                    if (repairTargets.length > 0) {
                        if (creep.repair(repairTargets[0]) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(repairTargets[0]);
                        }
                    }
                    else {
                        //Et sinon on update le controller
                        if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(creep.room.controller);
                        }
                    }

                }
            }
        }
    }
}
