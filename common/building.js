module.exports = {

    tick()
    {
        this.createBuildingIfNecessary();
    },

    createBuildingIfNecessary()
    {

        for(var roomName in Game.rooms)
        {

            var room = Game.rooms[roomName];
            var targets = room.find(FIND_CONSTRUCTION_SITES);

            if(!targets.length)
            {

                var nextStructure = this.getNextStructure(room);

                if(nextStructure !== null)
                {

                    var position = this.getPositionForStructure(nextStructure, room);

                    if(position !== null)
                    {
                        console.log("Creating building : " + nextStructure + " ("+position.x+"-"+position.y+")");
                        room.createConstructionSite(position.x, position.y, nextStructure);
                    }
                }
            }
        }
    },

    getNextStructure(room)
    {
        var controllerLevel = room.controller.level;

        var structPriority = [STRUCTURE_TOWER, STRUCTURE_EXTENSION];

        for(var i = 0 ; i < structPriority.length; i++)
        {
            var struct = structPriority[i];

            var max = this.getMaxStructureNumber(struct, controllerLevel);
            var count = this.countExistingStructures(struct, room);

            if(count < max)
            return struct;
        }

        return null;
    },

    countExistingStructures(struct, room)
    {
        var result = room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: struct }
        });

        return result.length;
    },

    //Voir pour le nombre max d'objet par level : http://support.screeps.com/hc/en-us/articles/203086021-Global-control
    getMaxStructureNumber(struct, level)
    {
        if(struct == STRUCTURE_EXTENSION)
        {
            if(level < 2)
            return 0;
            else if(level == 2)
            return 5;
            else return 10 * (level - 2);
        }

        if(struct == STRUCTURE_TOWER)
        {
            if(level < 3)
            return 0;
            else if(level < 5)
            return 1;
            else if(level < 7)
            return 2;
            else if(level < 8)
            return 3;
            else
            return 6;
        }

        return 0;
    },

    getPositionForStructure(struct, room)
    {
        if(struct == STRUCTURE_EXTENSION)
        {

            var pos = Game.spawns.Spawn1.pos;

            var result = room.lookAtArea(pos.y + 2, pos.x - 2, 49, pos.x + 2, false);

            var skipX = false;
            var skipY = false;

            for(var yPos in result)
            {
                for(var xPos in result[yPos])
                {
                    if(skipX)
                    {
                        skipX = false;
                    }
                    else {
                        skipX = true;
                        var objectsOnPosition = result[yPos][xPos];

                        if(objectsOnPosition.length === 1 && objectsOnPosition[0].type == "terrain" && objectsOnPosition[0].terrain !== "wall")
                        {
                            return new RoomPosition(xPos, yPos, room.name);
                        }
                    }
                }
            }
        }
        else if(struct == STRUCTURE_TOWER)
        {
            var pos = room.controller.pos;
            var result = room.lookAtArea(pos.y + 1, pos.x - 3, 49 - pos.y, pos.x + 3, false);

            for(var yPos in result)
            {
                for(var xPos in result[yPos])
                {
                    var objectsOnPosition = result[yPos][xPos];

                    if(objectsOnPosition.length === 1 && objectsOnPosition[0].type == "terrain" && objectsOnPosition[0].terrain !== "wall")
                    {
                        return new RoomPosition(xPos, yPos, room.name);
                    }
                }
            }
        }

        return null;
    },
};
