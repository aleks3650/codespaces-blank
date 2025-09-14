import { useSocketStore } from '../../state/Store';
import type {SocketStore}  from '../../state/Store';
import { socket } from '../../socket/socket';
import { ItemIcon } from './ItemIcon';

const selectInventory = (state: SocketStore) => state.players[socket.id!]?.inventory ?? [];

export const InventoryBar = () => {
    const inventory = useSocketStore(selectInventory);

    return (
        <div className="inventory-bar-container">
            {inventory.map((item, index) => (
                <ItemIcon 
                    key={`${item.itemId}-${index}`} 
                    inventorySlot={index} 
                    itemId={item.itemId} 
                    quantity={item.quantity} 
                />
            ))}
        </div>
    );
};