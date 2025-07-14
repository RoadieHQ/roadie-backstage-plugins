import { useState, useEffect, useCallback } from 'react';
import { Typography, Card, Avatar, Grid, Link } from '@material-ui/core';
import { useUserInfo } from '../../../hooks';
import Skeleton from '@material-ui/lab/Skeleton';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableCard from '../../DraggableCard';
import { makeStyles } from '@material-ui/core/styles';
import { TicketSummary, UserSummary } from '../../../types';

const useStyles = makeStyles(theme => ({
  container: {
    overflowY: 'auto',
    maxHeight: '100%',
  },
  title: {
    fontWeight: Number(theme.typography.fontWeightBold),
    color: 'darkgray',
  },
  link: {
    color: theme.palette.text.primary,
    '&:hover': {
      color: '#539bf5',
      fill: '#539bf5',
    },
    '&:first-child': {
      paddingRight: '4px',
    },
  },
  secondaryText: {
    color: theme.palette.text.secondary,
  },
}));

type MyJiraTicketsCardProps = {
  userId: string;
};

type JiraTicketCardProps = {
  user: UserSummary;
  ticket: TicketSummary;
  index: number;
  moveCard: any;
};

type JiraTicketsListViewProps = {
  user: UserSummary;
  tickets: TicketSummary[];
};

const JiraTicketSkeleton = () => {
  return (
    <Skeleton
      variant="rect"
      style={{ fontSize: '5rem', borderRadius: '8px', margin: 3 }}
    />
  );
};

const JiraTicketsSkeletonView = () => {
  return (
    <div>
      {Array.from({ length: 5 }).map(() => (
        <JiraTicketSkeleton />
      ))}
    </div>
  );
};

const JiraTicketCard = ({
  user,
  ticket,
  index,
  moveCard,
}: JiraTicketCardProps) => {
  const classes = useStyles();

  return (
    <DraggableCard
      key={ticket.key}
      id={ticket.key}
      index={index}
      moveCard={moveCard}
    >
      <Card style={{ marginBottom: '1em', padding: '1em' }}>
        <Grid container spacing={2}>
          <Grid
            container
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Grid item>
              <Typography variant="body2" className={classes.title}>
                <img
                  src={ticket?.issuetype?.iconUrl}
                  alt={ticket?.issuetype?.name}
                  title={ticket?.issuetype?.name}
                  width="15px"
                  style={{ marginRight: '5px', marginBottom: '-3px' }}
                />
                {ticket.parent ? (
                  <>
                    <Link
                      href={`${user?.url}/browse/${ticket?.parent}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                      className={`${classes.secondaryText} ${classes.link}`}
                    >
                      {ticket.parent}
                    </Link>
                    {' / '}
                    <Link
                      href={`${user?.url}/browse/${ticket?.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="none"
                      className={`${classes.secondaryText} ${classes.link}`}
                    >
                      {ticket.key}
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`${user?.url}/browse/${ticket?.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    className={`${classes.secondaryText} ${classes.link}`}
                  >
                    {ticket.key}
                  </Link>
                )}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    marginLeft: '5px',
                  }}
                >
                  <img
                    src={ticket?.priority?.iconUrl}
                    alt={ticket?.priority?.name}
                    title={ticket?.priority?.name}
                    width="15px"
                    style={{ marginRight: '5px' }}
                  />
                  <Typography style={{ fontSize: '1rem' }}>
                    {ticket?.priority?.name}
                  </Typography>
                </span>
              </Typography>
            </Grid>
            <Grid item>
              <Typography variant="body2" color="textSecondary">
                <img
                  src={ticket?.status?.iconUrl}
                  alt={ticket?.status?.name}
                  title={ticket?.status?.name}
                  width="15px"
                  style={{ marginRight: '5px' }}
                />
                {ticket?.status?.name}
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2">{ticket.summary}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container direction="row" alignItems="center">
              {ticket.assignee && (
                <Avatar
                  src={ticket.assignee.avatarUrl}
                  style={{ width: '30px', height: '30px' }}
                />
              )}
              <Typography
                variant="body2"
                style={{ marginLeft: '8px' }}
                className={classes.secondaryText}
              >
                {ticket.assignee ? ticket.assignee.displayName : 'Unassigned'}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Card>
    </DraggableCard>
  );
};

const JiraTicketsListView = ({ user, tickets }: JiraTicketsListViewProps) => {
  const [cards, setCards] = useState(tickets || []);

  useEffect(() => {
    setCards(tickets || []);
  }, [tickets]);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragCard = cards[dragIndex];
      const updatedCards = [...cards];
      updatedCards.splice(dragIndex, 1);
      updatedCards.splice(hoverIndex, 0, dragCard);
      setCards(updatedCards);
    },
    [cards],
  );

  return (
    <DndProvider backend={HTML5Backend}>
      {cards.map((ticket, index) => (
        <JiraTicketCard
          user={user}
          ticket={ticket}
          index={index}
          moveCard={moveCard}
        />
      ))}
    </DndProvider>
  );
};

export const Content = (props: MyJiraTicketsCardProps) => {
  const { userId } = props;
  const { user, loading, error, tickets } = useUserInfo(userId);

  if (loading) return <JiraTicketsSkeletonView />;

  if (error) {
    return <Typography>Error loading tickets: {error.message}</Typography>;
  }

  if (!user) {
    return <Typography>User not found</Typography>;
  }

  if (!tickets || tickets.length === 0) {
    return <Typography>No tickets to show</Typography>;
  }

  return <JiraTicketsListView user={user} tickets={tickets} />;
};
