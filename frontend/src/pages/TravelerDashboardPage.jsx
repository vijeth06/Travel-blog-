import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  FlightTakeoff,
  Public,
  CalendarToday,
  AttachMoney,
  TrendingUp,
  Star,
  Collections,
  Article
} from '@mui/icons-material';
import { getTravelerDashboard, getTravelerTimeline, getTravelMap } from '../api/analytics';

const TravelerDashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      loadTimeline();
    } else if (activeTab === 2) {
      loadMapData();
    }
  }, [activeTab, selectedYear]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getTravelerDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const response = await getTravelerTimeline(selectedYear);
      setTimeline(response.data);
    } catch (error) {
      console.error('Failed to load timeline:', error);
    }
  };

  const loadMapData = async () => {
    try {
      const response = await getTravelMap();
      setMapData(response.data);
    } catch (error) {
      console.error('Failed to load map data:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: 2, 
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>No dashboard data available</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        My Travel Dashboard
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Timeline" />
        <Tab label="Travel Map" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Trip Statistics */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Trip Statistics
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Trips"
                value={dashboard.trips.total}
                icon={<FlightTakeoff sx={{ color: '#1976d2', fontSize: 32 }} />}
                color="#1976d2"
                subtitle={`${dashboard.trips.recent} this month`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Countries Visited"
                value={dashboard.destinations.countries}
                icon={<Public sx={{ color: '#2e7d32', fontSize: 32 }} />}
                color="#2e7d32"
                subtitle={`${dashboard.destinations.continents} continents`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Days"
                value={dashboard.trips.totalDays}
                icon={<CalendarToday sx={{ color: '#ed6c02', fontSize: 32 }} />}
                color="#ed6c02"
                subtitle="Days planned"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Budget"
                value={`$${dashboard.trips.totalCost.toLocaleString()}`}
                icon={<AttachMoney sx={{ color: '#9c27b0', fontSize: 32 }} />}
                color="#9c27b0"
                subtitle={`$${dashboard.bookings.totalSpent.toLocaleString()} spent`}
              />
            </Grid>
          </Grid>

          {/* Content & Engagement */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Content & Engagement
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Blogs Written"
                value={dashboard.content.blogs}
                icon={<Article sx={{ color: '#d32f2f', fontSize: 32 }} />}
                color="#d32f2f"
                subtitle={`${dashboard.content.published} published`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Collections"
                value={dashboard.content.collections}
                icon={<Collections sx={{ color: '#0288d1', fontSize: 32 }} />}
                color="#0288d1"
                subtitle={`${dashboard.content.publicCollections} public`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Badges Earned"
                value={dashboard.achievements.badges}
                icon={<Star sx={{ color: '#f57c00', fontSize: 32 }} />}
                color="#f57c00"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Upcoming Trips"
                value={dashboard.trips.upcoming}
                icon={<TrendingUp sx={{ color: '#388e3c', fontSize: 32 }} />}
                color="#388e3c"
                subtitle={`${dashboard.trips.completed} completed`}
              />
            </Grid>
          </Grid>

          {/* Recent Activity */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              Recent Activity (Last 30 Days)
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {dashboard.trips.recent}
                  </Typography>
                  <Typography color="textSecondary">Trips Created</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {dashboard.content.recent}
                  </Typography>
                  <Typography color="textSecondary">Blogs Published</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {dashboard.bookings.recent}
                  </Typography>
                  <Typography color="textSecondary">Bookings Made</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Travel Timeline
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Year"
              >
                {[2025, 2024, 2023, 2022, 2021].map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Status/Info</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {timeline.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No activity for {selectedYear}
                    </TableCell>
                  </TableRow>
                ) : (
                  timeline.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={item.type} 
                          size="small"
                          color={
                            item.type === 'trip' ? 'primary' :
                            item.type === 'booking' ? 'secondary' : 'default'
                          }
                        />
                      </TableCell>
                      <TableCell>{item.title}</TableCell>
                      <TableCell>{item.destination?.country || 'N/A'}</TableCell>
                      <TableCell>
                        {item.type === 'trip' && item.status && (
                          <Chip label={item.status} size="small" />
                        )}
                        {item.type === 'blog' && `${item.views || 0} views`}
                        {item.cost && `$${item.cost}`}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeTab === 2 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Countries I've Explored
          </Typography>
          
          {mapData && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                  {mapData.totalCountries}
                </Typography>
                <Typography color="textSecondary">Countries Visited</Typography>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Country</TableCell>
                      <TableCell>Continent</TableCell>
                      <TableCell align="right">Trips</TableCell>
                      <TableCell align="right">Blogs</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mapData.countries.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No travel data yet. Start planning your first trip!
                        </TableCell>
                      </TableRow>
                    ) : (
                      mapData.countries.map((country, index) => (
                        <TableRow key={index}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{country.country}</TableCell>
                          <TableCell>{country.continent}</TableCell>
                          <TableCell align="right">{country.trips}</TableCell>
                          <TableCell align="right">{country.blogs}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default TravelerDashboardPage;
