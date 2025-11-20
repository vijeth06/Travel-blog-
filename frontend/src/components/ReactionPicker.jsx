import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Tooltip,
  Badge as MuiBadge
} from '@mui/material';
import {
  ThumbUp,
  Favorite,
  EmojiObjects,
  School,
  AutoAwesome,
  SentimentVerySatisfied,
  SentimentDissatisfied
} from '@mui/icons-material';
import { addReaction, removeReaction, getReactions, getMyReaction } from '../api/reactions';

const reactionTypes = [
  { type: 'like', label: 'Like', icon: ThumbUp, color: '#2196F3' },
  { type: 'love', label: 'Love', icon: Favorite, color: '#E91E63' },
  { type: 'helpful', label: 'Helpful', icon: EmojiObjects, color: '#FFC107' },
  { type: 'inspiring', label: 'Inspiring', icon: AutoAwesome, color: '#9C27B0' },
  { type: 'informative', label: 'Informative', icon: School, color: '#4CAF50' },
  { type: 'wow', label: 'Wow', icon: SentimentVerySatisfied, color: '#FF9800' },
];

const ReactionPicker = ({ targetType, targetId, size = 'medium' }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reactions, setReactions] = useState([]);
  const [myReaction, setMyReaction] = useState(null);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    loadReactions();
    loadMyReaction();
  }, [targetType, targetId]);

  const loadReactions = async () => {
    try {
      const res = await getReactions(targetType, targetId);
      setReactions(res.data?.data?.reactions || []);
      setSummary(res.data?.data?.summary || []);
    } catch (err) {
      console.error('Failed to load reactions', err);
    }
  };

  const loadMyReaction = async () => {
    try {
      const res = await getMyReaction(targetType, targetId);
      setMyReaction(res.data?.data);
    } catch (err) {
      console.error('Failed to load my reaction', err);
    }
  };

  const handleReactionClick = async (reactionType) => {
    try {
      if (myReaction?.reactionType === reactionType) {
        await removeReaction({ targetType, targetId });
        setMyReaction(null);
      } else {
        await addReaction({ targetType, targetId, reactionType });
        setMyReaction({ reactionType });
      }
      loadReactions();
      setAnchorEl(null);
    } catch (err) {
      console.error('Failed to react', err);
    }
  };

  const totalReactions = summary.reduce((sum, s) => sum + s.count, 0);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="React">
        <IconButton
          size={size}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            color: myReaction ? reactionTypes.find(r => r.type === myReaction.reactionType)?.color : 'inherit'
          }}
        >
          <MuiBadge badgeContent={totalReactions > 0 ? totalReactions : null} color="primary">
            {myReaction ? 
              React.createElement(reactionTypes.find(r => r.type === myReaction.reactionType)?.icon || ThumbUp) : 
              <ThumbUp />
            }
          </MuiBadge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {reactionTypes.map(({ type, label, icon: Icon, color }) => {
          const count = summary.find(s => s.type === type)?.count || 0;
          return (
            <MenuItem
              key={type}
              onClick={() => handleReactionClick(type)}
              selected={myReaction?.reactionType === type}
            >
              <Icon sx={{ mr: 1, color }} />
              <Typography>{label}</Typography>
              {count > 0 && (
                <Typography variant="caption" sx={{ ml: 'auto', pl: 2, color: 'text.secondary' }}>
                  {count}
                </Typography>
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default ReactionPicker;
