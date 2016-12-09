var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.carry.energy == creep.carryCapacity)
        {
            creep.drop(RESOURCE_ENERGY);
        }
        else
        {
            // On va chercher de l'énergie
            var sources = creep.room.find(FIND_SOURCES);
            if(creep.harvest(sources[0]) == ERR_NOT_IN_RANGE)
            {
                creep.moveTo(sources[0]);
            }
        }
    }
};

module.exports = roleMiner;
