import { itemData } from '../../constants/items';
import { useActionStore } from '../../state/Store';

interface ItemIconProps {
    inventorySlot: number;
    itemId: string;
    quantity: number;
}

export const ItemIcon = ({ inventorySlot, itemId, quantity }: ItemIconProps) => {
    const itemDef = itemData.get(itemId);
    const { selectedAction, selectAction } = useActionStore();

    const isSelected = selectedAction?.type === 'item' && selectedAction.inventorySlot === inventorySlot;
    
    const handleSelect = () => {
        selectAction({ type: 'item', id: itemId, inventorySlot });
    };

    if (!itemDef) return null;
    
    const className = `item-icon ${isSelected ? 'selected' : ''}`;
    const iconPath = `/icons/${itemDef.id}.png`;

    return (
        <div className={className} onClick={handleSelect}>
            <img src={iconPath} alt={itemDef.name} className="item-icon-image" />
            <div className="item-quantity">{quantity}</div>
            <div className="item-hotkey">{inventorySlot + 5}</div>
        </div>
    );
};