import React, { useState, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';

const LazyImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  placeholder, 
  className,
  style,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <Box 
      ref={imgRef}
      sx={{ 
        width: width || '100%', 
        height: height || 'auto',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      className={className}
    >
      {!isLoaded && !error && (
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={height || 200}
          animation="wave"
        />
      )}
      
      {isInView && (
        <img
          src={error ? placeholder || '/placeholder-image.jpg' : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            position: error ? 'relative' : 'absolute',
            top: 0,
            left: 0
          }}
          {...props}
        />
      )}
    </Box>
  );
};

export default React.memo(LazyImage);
