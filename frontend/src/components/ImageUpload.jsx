import { useState, useRef } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import CircularProgress from '@mui/material/CircularProgress';

const ImageUpload = ({ 
    onUpload, 
    existingImages = [], 
    onDelete = () => {}, 
    onUpdateOrder = () => {},
    onError = () => {}
}) => {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        console.log('File change event triggered');
        const files = event.target.files;
        console.log('Selected files:', files);
        
        if (!files || files.length === 0) {
            console.error('No files selected');
            onError('Please select at least one image');
            return;
        }

        if (files.length > 20) {
            console.error('You can only upload a maximum of 20 images.');
            onError('You can only upload a maximum of 20 images');
            return;
        }

        // Validate file types and sizes
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!allowedTypes.includes(file.type)) {
                onError(`File "${file.name}" is not a supported image type. Please use JPG, PNG, or WebP files.`);
                return;
            }
            if (file.size > maxSize) {
                onError(`File "${file.name}" is too large. Maximum size is 5MB.`);
                return;
            }
        }

        try {
            // Create a single FormData object for all files
            const formData = new FormData();
            Array.from(files).forEach((file, index) => {
                formData.append('image', file);
                console.log(`Appending file ${index}:`, file.name);
            });
            
            console.log('FormData created with files:', formData.getAll('image').length);
            
            // Pass the files to parent component
            await onUpload(formData);
            
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            onError(error.message || 'Failed to process images');
        }
    };

    const handleButtonClick = () => {
        console.log('Upload button clicked');
        fileInputRef.current?.click();
    };

    const handleDragEnd = (result) => {
        const { source, destination } = result;
        
        // If dropped outside the list or no change in position
        if (!destination || 
            (source.index === destination.index && source.droppableId === destination.droppableId)) {
            return;
        }

        // Create a new array from the existing images
        const reorderedImages = Array.from(existingImages);
        
        // Remove the dragged item from its original position
        const [movedImage] = reorderedImages.splice(source.index, 1);
        
        // Insert the dragged item at its new position
        reorderedImages.splice(destination.index, 0, movedImage);
        
        // Update parent component with new order
        onUpdateOrder(reorderedImages);
    };

    const handleDeleteImage = (index) => {
        const newImages = [...existingImages];
        const deletedImage = newImages.splice(index, 1)[0];
        
        // Notify parent of deletion
        onDelete(deletedImage.public_id);
        
        onUpdateOrder(newImages);
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
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                multiple
                type="file"
                onChange={handleFileChange}
            />
            <Button
                variant="outlined"
                component="span"
                onClick={handleButtonClick}
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

            {loading && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, opacity: 0.8 }}>
                    <CircularProgress color="primary" />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Uploading images, please wait...
                    </Typography>
                </Box>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable 
                    droppableId="imageUpload"
                    renderClone={(provided, snapshot, rubric) => (
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
                                boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
                                transform: 'scale(1.05)',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                cursor: 'grabbing',
                                opacity: 0.8,
                                backgroundColor: '#fff',
                                zIndex: 1300
                            }}
                        >
                            <img
                                src={getImageUrl(existingImages[rubric.source.index])}
                                alt={`Property image ${rubric.source.index + 1}`}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    pointerEvents: 'none'
                                }}
                            />
                        </Box>
                    )}
                >
                    {(provided, snapshot) => (
                        <Box 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{ 
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '16px',
                                mt: 2,
                                minHeight: '300px',
                                padding: '8px',
                                backgroundColor: snapshot.isDraggingOver ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                                transition: 'all 0.2s ease',
                                borderRadius: '8px',
                                width: '100%',
                                position: 'relative',
                                alignItems: 'flex-start',
                                justifyContent: 'flex-start',
                                '& > *': {  // Add specific styling for direct children
                                    flex: '0 0 120px',  // Fixed width, no growing or shrinking
                                    margin: '0 !important',  // Override any margin
                                }
                            }}
                        >
                            {existingImages.map((image, index) => (
                                <Draggable 
                                    key={`image-${index}`} 
                                    draggableId={`image-${index}`} 
                                    index={index}
                                >
                                    {(provided, snapshot) => (
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
                                                boxShadow: snapshot.isDragging 
                                                    ? '0 8px 16px rgba(0,0,0,0.2)' 
                                                    : '0 2px 4px rgba(0,0,0,0.1)',
                                                transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
                                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                                cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                opacity: snapshot.isDragging ? 0.8 : 1,
                                                backgroundColor: '#fff',
                                                zIndex: snapshot.isDragging ? 1300 : 1,
                                                '&::before': snapshot.isDragging ? {
                                                    content: '""',
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                                    zIndex: 1
                                                } : {}
                                            }}
                                        >
                                            <img
                                                src={getImageUrl(image)}
                                                alt={`Property image ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                            <IconButton
                                                onClick={() => handleDeleteImage(index)}
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
                                                    },
                                                    zIndex: 2
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