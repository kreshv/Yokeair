import { Typography, Container } from '@mui/material';
import { useParams } from 'react-router-dom';

const ApartmentDetail = () => {
  const { id } = useParams();
  
  return (
    <Container>
      <Typography variant="h2">Apartment Details</Typography>
      <Typography>Apartment ID: {id}</Typography>
    </Container>
  );
};

export default ApartmentDetail; 