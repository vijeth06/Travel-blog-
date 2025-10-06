import React from 'react';
import { Avatar, Badge, Tooltip, useTheme, alpha } from '@mui/material';
import { VerifiedUser, Star } from '@mui/icons-material';

const UserAvatar = ({ 
  user, 
  size = 40, 
  showBadge = true, 
  showTooltip = true,
  onClick,
  sx = {} 
}) => {
  const theme = useTheme();

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientColor = (name) => {
    if (!name) return ['#FF6B35', '#F7931E'];
    
    const colors = [
      ['#FF6B35', '#F7931E'], // Orange
      ['#1E88E5', '#42A5F5'], // Blue
      ['#27AE60', '#58D68D'], // Green
      ['#9C27B0', '#BA68C8'], // Purple
      ['#E91E63', '#F06292'], // Pink
      ['#FF5722', '#FF8A65'], // Deep Orange
      ['#00BCD4', '#4DD0E1'], // Cyan
      ['#8BC34A', '#AED581'], // Light Green
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const [color1, color2] = getGradientColor(user?.name);

  const avatarElement = (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      badgeContent={
        showBadge && user?.verified ? (
          <VerifiedUser 
            sx={{ 
              color: theme.palette.primary.main,
              fontSize: size * 0.3,
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '2px'
            }} 
          />
        ) : showBadge && user?.premium ? (
          <Star 
            sx={{ 
              color: theme.palette.warning.main,
              fontSize: size * 0.3,
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '2px'
            }} 
          />
        ) : null
      }
    >
      <Avatar
        src={user?.avatar}
        onClick={onClick}
        sx={{
          width: size,
          height: size,
          fontSize: size * 0.4,
          fontWeight: 600,
          background: `linear-gradient(135deg, ${color1}, ${color2})`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          border: `2px solid ${alpha(theme.palette.common.white, 0.8)}`,
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.15)}`,
          '&:hover': onClick ? {
            transform: 'scale(1.05)',
            boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.2)}`,
          } : {},
          ...sx
        }}
      >
        {getInitials(user?.name)}
      </Avatar>
    </Badge>
  );

  if (showTooltip && user?.name) {
    return (
      <Tooltip 
        title={
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>
              {user.name}
              {user.verified && ' ✓'}
            </div>
            {user.bio && (
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                {user.bio.length > 50 ? `${user.bio.slice(0, 50)}...` : user.bio}
              </div>
            )}
            {user.location && (
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 4 }}>
                📍 {user.location}
              </div>
            )}
          </div>
        }
        arrow
        placement="top"
      >
        {avatarElement}
      </Tooltip>
    );
  }

  return avatarElement;
};

export default UserAvatar;