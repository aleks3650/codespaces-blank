import { itemData } from '../../constants/items';
import { useActionStore } from '../../state/Store';

// Definicja propsów dla komponentu
interface ItemIconProps {
    inventorySlot: number;
    itemId: string;
    quantity: number;
}

export const ItemIcon = ({ inventorySlot, itemId, quantity }: ItemIconProps) => {
    const itemDef = itemData.get(itemId);
    const { selectedAction, selectAction } = useActionStore();

    // Sprawdzamy, czy ten przedmiot jest aktualnie wybrany
    const isSelected = selectedAction?.type === 'item' && selectedAction.inventorySlot === inventorySlot;
    
    // Kliknięcie na ikonę teraz tylko ją WYBIERA
    const handleSelect = () => {
        selectAction({ type: 'item', id: itemId, inventorySlot });
    };

    if (!itemDef) return null;
    
    // Używamy operatora warunkowego do dodania klasy 'selected'
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