import React from 'react';
import { useDrag, useDrop } from 'react-dnd';

const ItemType = 'CARD';

const DraggableCard = ({ id, index, moveCard, children }) => {
    const ref = React.useRef(null);

    const [, drop] = useDrop({
        accept: ItemType,
        hover(item: { id: string; index: number }) {
            if (item.index !== index) {
                moveCard(item.index, index);
                item.index = index;
            }
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemType,
        item: { id, index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
            {children}
        </div>
    );
};

export default DraggableCard;