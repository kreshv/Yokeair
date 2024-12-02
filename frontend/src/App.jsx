import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ApartmentList from './pages/ApartmentList';
import ApartmentDetail from './pages/ApartmentDetail';
import LocationSelector from './pages/LocationSelector';
import PropertyListing from './pages/PropertyListing';
import PropertyAmenities from './pages/PropertyAmenities';
import Dashboard from './pages/Dashboard';
import SearchFilters from './pages/SearchFilters';
import Profile from './pages/client/Profile';
import MyApplications from './pages/client/MyApplications';
import SavedListings from './pages/client/SavedListings';

// Context
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './components/Snackbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      dark: '#115293',
    },
  },
  typography: {
    h2: {
      fontSize: '3rem',
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="/location-selector" element={<LocationSelector />} />
                <Route path="/search-filters" element={<SearchFilters />} />
                <Route path="/property-listing" element={<PropertyListing />} />
                <Route path="/property-amenities" element={<PropertyAmenities />} />
                <Route path="/apartments" element={<ApartmentList />} />
                <Route path="/apartments/:id" element={<ApartmentDetail />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/my-applications" element={<MyApplications />} />
                <Route path="/saved-listings" element={<SavedListings />} />
              </Route>
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>
            </Routes>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
