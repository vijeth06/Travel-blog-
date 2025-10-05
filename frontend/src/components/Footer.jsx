import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  IconButton,
  Divider,
  Stack,
  Grid
} from '@mui/material';

import { 
  FlightTakeoff,
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material';

export default function Footer() {
  return (
    <Box sx={{ 
      backgroundColor: '#1a1a1a', 
      color: 'white', 
      pt: 6, 
      pb: 3 
    }}>
      <Container maxWidth="lg">
        {/* Main Footer Content */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Brand Section */}
          <Grid xs={12} md={4}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FlightTakeoff sx={{ mr: 1, fontSize: 30, color: '#1E88E5' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1E88E5' }}>
                  TravelBlog
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8, lineHeight: 1.6 }}>
                Your ultimate destination for authentic travel stories, insider tips, and inspiring adventures from around the world.
              </Typography>
            </Box>
            
            {/* Social Media */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
                Follow Us
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton sx={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  <Instagram />
                </IconButton>
                <IconButton sx={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  <YouTube />
                </IconButton>
                <IconButton sx={{ 
                  color: 'white', 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}>
                  <LinkedIn />
                </IconButton>
              </Stack>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Quick Links
            </Typography>
            <Stack spacing={2}>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Explore Destinations
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Travel Guides
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Photo Stories
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Write for Us
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Travel Forum
              </Link>
            </Stack>
          </Grid>

          {/* Support & Legal */}
          <Grid xs={12} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Support & Legal
            </Typography>
            <Stack spacing={2}>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Help Center
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Contact Us
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Privacy Policy
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Terms of Service
              </Link>
              <Link href="#" sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                '&:hover': { color: 'white' },
                transition: 'color 0.2s'
              }}>
                Cookie Policy
              </Link>
            </Stack>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ 
          borderColor: 'rgba(255,255,255,0.2)', 
          mb: 4 
        }} />

        {/* Bottom Section */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2024 TravelBlog. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Made with ❤️ for travelers worldwide
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
