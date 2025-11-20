import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import PlaceIcon from '@mui/icons-material/Place';
import CommentIcon from '@mui/icons-material/Comment';
import CardTravelIcon from '@mui/icons-material/CardTravel';
import TimelineIcon from '@mui/icons-material/Timeline';
import { formatDistanceToNow } from 'date-fns';
import { getUserTimeline } from '../api/timeline';
import { useNavigate } from 'react-router-dom';

const iconMap = {
  blog: <FlightTakeoffIcon />,
  favorite_place: <PlaceIcon />,
  comment: <CommentIcon />,
  booking: <CardTravelIcon />,
};

const TimelineWidget = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getUserTimeline(10);
        if (!mounted) return;
        setItems(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load timeline', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleClick = (item) => {
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <Card>
      <CardHeader
        avatar={<TimelineIcon color="primary" />}
        title="Journey timeline"
        subheader="Recent stories, saved places, bookings and comments"
      />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Your travel journey will appear here as you write stories, save places, book trips, and comment.
          </Typography>
        ) : (
          <List dense>
            {items.map((item) => (
              <ListItem
                key={`${item.type}-${item.date}-${item.link}`}
                button
                onClick={() => handleClick(item)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {iconMap[item.type] || <TimelineIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.title}
                  secondary={
                    <>
                      {item.description && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ display: 'block' }}
                        >
                          {item.description}
                        </Typography>
                      )}
                      {item.date && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.disabled"
                        >
                          {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default TimelineWidget;
