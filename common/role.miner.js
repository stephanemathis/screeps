var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.carry.energy == creep.carryCapacity)
        {
            creep.drop(RESOURCE_ENERGY);
        }
        else 
        {
            if(!creep.memory.targetSourceId)
            {
                var sources = creep.room.find(FIND_SOURCES);
                for(var i = 0 ; i < sources.length ; i++)
                {
                    var pos = sources[0].pos;
                    var result = creep.room.lookAtArea(pos.y - 1, pos.x - 12, pos.y + 1, pos.x + 1, true);
                    
                    var numberOfMiners = result.filter((p) => { p.type == "creep" && p.creep.memory.role == "miner" });
                    
                    if(numberOfMiners == 0)
                    {
                        var isSpotReserved = false;
                        for(var creepName in Game.creeps)
                        {
                            if(Game.creeps[creepName].memory.targetSourceId == sources[i].id)
                                isSpotReserved = true;
                        }
                        if(!isSpotReserved)
                            creep.memory.targetSourceId = sources[i].id;
                    }
                }
            }
            
            var source = Game.getObjectById(creep.memory.targetSourceId);
            
            if(!source)
                creep.memory.targetSourceId = null;
            
            if(creep.harvest(source) == ERR_NOT_IN_RANGE) 
            {
                creep.moveTo(source);
            }
        }
    }
};

module.exports = roleMiner;
