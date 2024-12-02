import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress, Alert } from '@mui/material';
import { deleteProperty } from '../utils/api';

const PropertyCard = ({ property, onStatusChange, onDelete }) => {
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
        // ... existing card content ...

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
    );
};

export default PropertyCard; 