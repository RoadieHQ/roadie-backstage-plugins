import React, {useState, useEffect, useCallback} from 'react';
import {useUserInfo} from '../../../hooks';

type MyJiraTicketsCardProps = {
    userId: string;
};

const JiraTicketSkeleton = () => {
    return <Skeleton key={index} variant="rect" style={{fontSize: '5rem', borderRadius: '8px', margin: 3}}/>
}

const JiraTicketsSkeletonView = () => {
    const [skeletons, setSkeletons] = useState<number[]>([0, 1, 2, 3]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSkeletons((prevSkeletons) => [...prevSkeletons, prevSkeletons.length]);
        }, 5);

        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            {skeletons.map((_, index) => (
                <JiraTicketSkeleton />
            ))}
        </div>
    );
}

export const Content = (props: MyJiraTicketsCardProps) => {
    const {userId} = props;
    const {user, loading, error, tickets} = useUserInfo(userId);
    
    const [cards, setCards] = useState(tickets || []);
    const classes = useStyles();

    useEffect(() => {
        setCards(tickets || []);
    }, [tickets]);

    if (loading) return <JiraTicketsSkeletonView />
    
    if (error) {
        return <Typography>Error loading tickets: {error.message}</Typography>;
    }

    if (!cards || cards.length === 0) {
        return <Typography>No tickets to show</Typography>;
    }

    return cards.map((ticket, index) => (
        <DraggableCard key={ticket.key} id={ticket.key} index={index} moveCard={moveCard}>
        </DraggableCard>
    ));
}