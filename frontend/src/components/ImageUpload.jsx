import { useState } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CircularProgress from '@mui/material/CircularProgress';

const ImageUpload = ({ 
    onUpload, 
    existingImages = [], 
    onDelete = () => {}, 
    onUpdateOrder = () => {} 
}) => {
    const [loading, setLoading] = useState(false);

    const handleFileChange = async (event) => {
        const files = event.target.files;
        if (files) {
            setLoading(true);
            try {
                // Upload files one by one
                for (let i = 0; i < files.length; i++) {
                    const formData = new FormData();
                    formData.append('images', files[i]); // Using 'images' as the field name
                    await onUpload(formData);
                }
            } catch (error) {
                console.error('Upload error:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const reorderedImages = Array.from(existingImages);
        const [removed] = reorderedImages.splice(result.source.index, 1);
        reorderedImages.splice(result.destination.index, 0, removed);
        onUpdateOrder(reorderedImages);
    };

    const getImageUrl = (image) => {
        if (image instanceof File) {
            return URL.createObjectURL(image);
        }
        return image.url || image;
    };

    return (
        <Box>
            <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleFileChange}
            />
            <label htmlFor="image-upload">
                <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadIcon />}
                    sx={{
                        mb: 2,
                        color: '#000',
                        borderColor: '#000',
                        '&:hover': {
                            borderColor: '#00008B',
                            color: '#00008B'
                        }
                    }}
                >
                    Upload Images
                </Button>
            </label>

            {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, opacity: 0.8 }}>
                    <CircularProgress color="primary" />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Uploading images, please wait...
                    </Typography>
                </Box>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="imageUpload" direction="horizontal">
                    {(provided) => (
                        <Box 
                            ref={provided.innerRef} 
                            {...provided.droppableProps} 
                            sx={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: 2,
                                mt: 2 
                            }}
                        >
                            {existingImages.map((image, index) => (
                                <Draggable 
                                    key={`image-${index}`} 
                                    draggableId={`image-${index}`} 
                                    index={index}
                                >
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            sx={{
                                                position: 'relative',
                                                width: 120,
                                                height: 120,
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(image)}
                                                alt={`Property image ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                            <IconButton
                                                onClick={() => onDelete(image)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                    transition: 'all 0.3s ease-in-out',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                        transform: 'scale(1.1)',
                                                        color: '#FF0000'
                                                    }
                                                }}
                                                size="small"
                                            >
                                                <DeleteIcon sx={{ fontSize: 20 }} />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>

            {existingImages.length > 0 && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                    {existingImages.length} image{existingImages.length !== 1 ? 's' : ''} selected
                </Typography>
            )}
        </Box>
    );
};

export default ImageUpload; 