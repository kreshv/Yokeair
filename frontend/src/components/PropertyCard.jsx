import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress, Alert, Paper, Typography } from '@mui/material';
import { deleteProperty } from '../utils/api';
import { styled } from '@mui/material/styles';

const StyledPropertyCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '15px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.2s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
}));

const PropertyCard = ({ property, onStatusChange, onDelete, selected, onSelect }) => {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const handleDeleteConfirm = async () => {
        setIsDeleting(true);
        setDeleteError('');
        
        try {
            await deleteProperty(property._id);
            setDeleteDialogOpen(false);
            onDelete(); // Refresh the property list
        } catch (error) {
            setDeleteError('Failed to delete property. Please try again.');
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <StyledPropertyCard>
            <Typography variant="h6" noWrap>
                {property.building.address.street} - Unit {property.unitNumber}
            </Typography>
            <Typography noWrap>
                {property.building.address.neighborhood}, {property.building.address.borough}
            </Typography>
            <Typography noWrap>
                {property.bedrooms} BR | ${property.price}/month
            </Typography>
            <Typography 
                sx={{ 
                    color: property.status === 'available' ? 'success.main' : 
                           property.status === 'in_contract' ? 'warning.main' : 'error.main',
                    fontWeight: 'bold',
                    marginTop: 'auto', // Pushes the status text to the bottom
                    alignSelf: 'flex-end', // Aligns the status text to the right
                }}
            >
                {formatStatus(property.status)}
            </Typography>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => !isDeleting && setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Listing</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this listing? This action cannot be undone.
                        All associated images will also be deleted.
                    </DialogContentText>
                    {deleteError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)} 
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDeleteConfirm} 
                        color="error"
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </StyledPropertyCard>
    );
};

export default PropertyCard; 