import { useState } from 'react';
import {
  Paper,
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
} from '@mui/material';

const SearchFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    borough: '',
    neighborhood: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Min Price"
              name="minPrice"
              type="number"
              value={filters.minPrice}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Max Price"
              name="maxPrice"
              type="number"
              value={filters.maxPrice}
              onChange={handleChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Bedrooms"
              name="bedrooms"
              value={filters.bedrooms}
              onChange={handleChange}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="0">Studio</MenuItem>
              <MenuItem value="1">1</MenuItem>
              <MenuItem value="2">2</MenuItem>
              <MenuItem value="3">3</MenuItem>
              <MenuItem value="4">4+</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Borough"
              name="borough"
              value={filters.borough}
              onChange={handleChange}
            >
              <MenuItem value="">Any</MenuItem>
              <MenuItem value="Manhattan">Manhattan</MenuItem>
              <MenuItem value="Brooklyn">Brooklyn</MenuItem>
              <MenuItem value="Queens">Queens</MenuItem>
              <MenuItem value="Bronx">Bronx</MenuItem>
              <MenuItem value="Staten Island">Staten Island</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="contained" 
              type="submit"
              sx={{ height: '100%' }}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default SearchFilters; 