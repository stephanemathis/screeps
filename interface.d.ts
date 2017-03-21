interface Memory {
    controllerLevel: {[roomName: string]: number};
    buildingUpgradeInfo: {[buildingId: string]: boolean};
    creepCount: number;
    spawnQueue: {[roomName: string]: SpawnQueueTarget[]};
    turnGoal: {[roomName: string]: TurnGoal};
    roomGoal: {[roomName: string]: RoomGoal};
    attackStep: number;
}

interface Creep {
    findAndPickEnergy(): void;
    goToRoomIfNecessary(): boolean;
    memory: any | CreepMemory;
}

interface SpawnQueueTarget {
    role: string;
    roomName: string;
    maxParts: number;
    respawnAfterDeath: boolean;
    secondaryRole: string;
}

interface CreepMemory {
    roomName: string;
    role: string;
    secondaryRole: string;
    respawnAfterDeath: boolean;

    targetSourceId?: string;
    dispatch?: boolean;
    upgrading?: boolean;
}

interface TurnGoal {
    constructionSiteId?: string;
    repairTargetId?: string;
    fillEnergyTargetId?: string;
    energyContainerTargetId?: string;
    fillStorageTargetId?: string;
}

interface RoomGoal {
    energyContainerTargetId?: string;
}