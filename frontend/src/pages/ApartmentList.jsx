import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Pagination
} from '@mui/material';
import { getApartments } from '../utils/api';
import ApartmentCard from '../components/ApartmentCard';
import SearchFilters from '../components/SearchFilters';

const ApartmentList = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({});

  const fetchApartments = async (currentPage, currentFilters) => {
    try {
      setLoading(true);
      setError('');
      const response = await getApartments({ 
        page: currentPage, 
        ...currentFilters 
      });
      setApartments(response.data.apartments);
      setTotalPages(Math.ceil(response.data.total / 9)); // Assuming 9 items per page
    } catch (err) {
      setError('Failed to load apartments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments(page, filters);
  }, [page, filters]);

  const handleFilterChange = (newFilters) => {
    setPage(1); // Reset to first page when filters change
    setFilters(newFilters);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Available Apartments
      </Typography>
      
      <SearchFilters onFilterChange={handleFilterChange} />
      
      {error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : apartments.length === 0 ? (
        <Typography sx={{ mt: 4 }}>No apartments found matching your criteria.</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {apartments.map((apartment) => (
              <Grid item key={apartment._id} xs={12} sm={6} md={4}>
                <ApartmentCard apartment={apartment} />
              </Grid>
            ))}
          </Grid>
          
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination 
              count={totalPages} 
              page={page} 
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default ApartmentList; 