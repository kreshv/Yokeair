import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material';
import React, { lazy, Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ApartmentList = lazy(() => import('./pages/ApartmentList'));
const ApartmentDetail = lazy(() => import('./pages/ApartmentDetail'));
const LocationSelector = lazy(() => import('./pages/LocationSelector'));
const PropertyListing = lazy(() => import('./pages/PropertyListing'));
const PropertyAmenities = lazy(() => import('./pages/PropertyAmenities'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SearchFilters = lazy(() => import('./pages/SearchFilters'));
const Profile = lazy(() => import('./pages/client/Profile'));
const MyApplications = lazy(() => import('./pages/client/MyApplications'));
const SavedListings = lazy(() => import('./pages/client/SavedListings'));
const EditProperty = lazy(() => import('./pages/EditProperty'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));

// Context
import { AuthProvider } from './context/AuthContext';
import { SnackbarProvider } from './context/SnackbarContext';

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

const PageTransition = ({ children }) => {
  return children;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SnackbarProvider>
          <Router>
            <PageTransition>
              <Suspense fallback={<CircularProgress />}>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/apartments/:id" element={<Home />} />
                    <Route path="/location-selector" element={<LocationSelector />} />
                    <Route path="/search-filters" element={<SearchFilters />} />
                    <Route path="/property-listing" element={<PropertyListing />} />
                    <Route path="/property-amenities" element={<PropertyAmenities />} />
                    <Route path="/apartments" element={<ApartmentList />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-applications" element={<MyApplications />} />
                    <Route path="/saved-listings" element={<SavedListings />} />
                    <Route path="/property-listing/:id" element={<EditProperty />} />
                    <Route path="/properties/:id" element={<PropertyDetail />} />
                  </Route>
                  <Route element={<AuthLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                  </Route>
                </Routes>
              </Suspense>
            </PageTransition>
          </Router>
        </SnackbarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
