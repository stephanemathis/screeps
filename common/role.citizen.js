var roleCitizen = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.carry.energy == creep.carryCapacity)
            creep.memory.dispatch = true;
        else if(!creep.carry.energy)
            creep.memory.dispatch = false;

        if(creep.memory.dispatch == false)
        {
            // On va chercher de l'énergie

            var sources = creep.room.find(FIND_DROPPED_ENERGY);
            if(creep.pickup(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
            else {
                sources = creep.room.find(FIND_SOURCES);
                if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
                {
                    creep.moveTo(sources[0]);
                }
            }
        }
        else {
            // On cherche les structures qui ont besoin d'énergie (Spawn, Extension, ...)
            var targetsFillEnergy = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TOWER || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            });

            if(targetsFillEnergy.length > 0) {
                if(creep.transfer(targetsFillEnergy[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targetsFillEnergy[0]);
                }
            }
            else {
                // Sinon on cherche ce qu'il faut construire
                var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
                if(targets.length)
                {
                    if(creep.build(targets[0]) == ERR_NOT_IN_RANGE)
                    {
                        creep.moveTo(targets[0]);
                    }
                }
                else {
                    //Et sinon on update le controller
                    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.controller);
                    }

                }
            }
        }
    }
};

module.exports = roleCitizen;
