import * as building from "./building";

// Step 0 : Créer les creeps
// Step 1 : Restaurer les creeps pour qu'ils partent avec de la vie
// Step 2 : Attaquer

            //BUG car le temps que ça respawn, pendant un tour !!!


export function tick(creeps: Creep[]) {

    // Si pas de step, alors c'est qu'on ne désire pas attaquer
    if (Memory.attackStep === undefined)
        return;

    // Sinon on recupère la liste des attaquants, et s'il n'y en a pas, on ne fait rien
    var attackers = creeps.filter(c => { return c.memory.secondaryRole == "attacker" }).sort((aa, ab) => {
        if (aa.name < ab.name) return -1;
        if (aa.name > ab.name) return 1;
        return 0;
    });

    var healers = creeps.filter(c => { return c.memory.secondaryRole == "healer" });

    if (!attackers.length && Memory.attackStep > 0) {
        Memory.attackStep = undefined;
        console.log("Attaque : attaquant mort, stop.");
        return;
    }

    if (!attackers.length && !healers.length) {
        return;
    }

    // On attend que l'équipe spawn
    if (Memory.attackStep == 0) {

        var stillSpawning = false;
        for (var roomName in Game.rooms) {
            stillSpawning = stillSpawning || (Memory.spawnQueue[roomName] && Memory.spawnQueue[roomName].filter(st => { return st.role == "squad" }).length > 0);
        }

        if (!stillSpawning) {
            for (var spawnName in Game.spawns) {
                var currentlySpawning = Game.spawns[spawnName].spawning;
                console.log(JSON.stringify(currentlySpawning));
                stillSpawning = stillSpawning || (currentlySpawning && Memory.creeps[currentlySpawning.name].role == "squad");
            }
        }

        if (stillSpawning) {
            for (var i = 0; i < creeps.length; i++) {
                var creep = creeps[i];
                var waitingPos = building.getPositionForStructure(STRUCTURE_EXTENSION, creep.room);
                creep.moveTo(waitingPos);
            }
        }
        else {
            // Si plus rien n'est en attente, alors on peut passer à l'étape suivante
            console.log("Attaque : Passage à l'étape 1");
            Memory.attackStep = 1;
            return;
        }
    }

    if (Memory.attackStep == 1) {

        var creepNeedRenewing = false;
        for (var i = 0; i < creeps.length; i++) {
            var creep = creeps[i];
            if (creep.ticksToLive < 1450) {
                creepNeedRenewing = creepNeedRenewing || true;

                var spawner = creep.room.find<Spawn>(FIND_MY_SPAWNS).sort((sa, sb) => {
                    if (sa.name < sb.name) return -1;
                    if (sa.name > sb.name) return 1;
                    return 0;
                });

                if (spawner && spawner.length) {
                    if (spawner[0].renewCreep(creep)) {
                        creep.moveTo(spawner[0]);
                    }
                }
            }
        }

        if (!creepNeedRenewing) {
            console.log("Attaque : Passage à l'étape 2");
            Memory.attackStep = 2;
            return;
        }
    }

    // On déplace tout le monde vers la salle puis on attaque avec les healer qui suivent derrière
    if (Memory.attackStep == 2) {

        for (var i = 0; i < attackers.length; i++) {
            var creep = creeps[i];
            var moved = creep.goToRoomIfNecessary();

            if (!moved) {
                var spawn = creep.room.find<Spawn>(FIND_HOSTILE_SPAWNS);
                if (spawn && spawn.length) {
                    if (creep.attack(spawn[0])) {
                        creep.moveTo(spawn[0]);
                    }
                }
                else {
                    var enemyCreeps = creep.room.find<Creep>(FIND_HOSTILE_CREEPS).sort((ca, cb) => {
                        if (ca.name < cb.name) return -1;
                        if (ca.name > cb.name) return 1;
                        return 0;
                    });
                    if (enemyCreeps && enemyCreeps.length) {
                        if (creep.attack(enemyCreeps[0])) {
                            creep.moveTo(enemyCreeps[0]);
                        }
                    }
                    else {
                        var enemyStructure = creep.room.find<Structure>(FIND_HOSTILE_STRUCTURES).filter((s) => { return s.structureType != STRUCTURE_CONTROLLER });
                        if (enemyStructure && enemyStructure.length) {

                            if (creep.attack(enemyStructure[0])) {
                                creep.moveTo(enemyStructure[0]);
                            }
                        }
                    }
                }
            }
        }

        for (var i = 0; i < healers.length; i++) {
            var healer = healers[i];
            healer.moveTo(attackers[0]);

            if (creep.hits < creep.hitsMax / 2) {
                healer.heal(healer);
            }
            else {
                var result = healer.heal(attackers[0]);
            }
        }
    }

}
