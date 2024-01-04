import { Entity, store } from "@graphprotocol/graph-ts";
import { CleanOrder, MangroveOrder, Order, Stack } from "../generated/schema";

const getStack = (type: string): Stack => {
    let stack = Stack.load(type);
    if (stack === null) {
        stack = new Stack(type);
        stack.ids = ``;

        stack.save();
    }
    return stack;
}


function getLatestFromStack(type: string, shouldThrow: boolean): Entity | null {
    const stack = getStack(type);
    const ids = stack.ids;
    const idsArray = ids.split('|');
    const id =idsArray[idsArray.length - 1]
    const entity = store.get(type, id);
    if(entity === null && shouldThrow) {
        throw new Error(`Entity ${type} with ${id} id not found`);
    }
    return  entity;
}

export function getLatestOrderFromStack(): Order {
    const order = getLatestFromStack("Order", true);
    return changetype<Order>(order);
};

export function getLatestMangroveOrderFromStack(): MangroveOrder | null {
    const order = getLatestFromStack("MangroveOrder", false);
    return changetype<MangroveOrder | null>(order);
}

export function getLatestCleanOrderFromStack(): CleanOrder | null {
    const order = getLatestFromStack("CleanOrder", false);
    return changetype<CleanOrder | null>(order);
}

function addToStack(type: string, entity: Entity ): void {
    const orderStack = getStack(type);
    if(type == "Order") {
        const order = changetype<Order>(entity);
        orderStack.ids = `${orderStack.ids}|${order.id}`;    
    } else if(type == "MangroveOrder") {
        const order = changetype<MangroveOrder>(entity);
        orderStack.ids = `${orderStack.ids}|${order.id}`;    
    } else if(type == "CleanOrder") {
        const order = changetype<CleanOrder>(entity);
        orderStack.ids = `${orderStack.ids}|${order.id}`;    
    }
    orderStack.save();
}

export function addOrderToStack(order: Order): void {
    addToStack("Order", order);
}

export function addMangroveOrderToStack(order: MangroveOrder): void {
    addToStack("MangroveOrder", order);
}

export function addCleanOrderToStack(order: CleanOrder): void {
    addToStack("CleanOrder", order);
}

function removeLatestFromStack(type: string ): void {
    let stack = getStack(type);
    const ids = stack.ids;
    for (let i = ids.length - 1; i >= 0; --i) {
        if (ids.at(i) == '|' || i == 0) {
            stack.ids = ids.slice(0, i);
            break;
        }
    }

    stack.save();
}

export function removeLatestOrderFromStack(): void {
    removeLatestFromStack("Order");
}

export function removeLatestMangroveOrderFromStack(): void {
    removeLatestFromStack("MangroveOrder");
}

export function removeLatestCleanOrderFromStack(): void {
    removeLatestFromStack("CleanOrder");
}
