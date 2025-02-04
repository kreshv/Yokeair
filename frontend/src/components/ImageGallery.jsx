import React, { useState } from 'react';
import { Box, IconButton, Modal } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';

const ImageGallery = ({ images = [] }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleImageClick = (index) => {
        setSelectedImage(images[index]);
        setCurrentImageIndex(index);
    };

    const handleClose = () => {
        setSelectedImage(null);
    };

    const handlePrevious = (e) => {
        e.stopPropagation();
        const newIndex = (currentImageIndex - 1 + images.length) % images.length;
        setSelectedImage(images[newIndex]);
        setCurrentImageIndex(newIndex);
    };

    const handleNext = (e) => {
        e.stopPropagation();
        const newIndex = (currentImageIndex + 1) % images.length;
        setSelectedImage(images[newIndex]);
        setCurrentImageIndex(newIndex);
    };

    return (
        <>
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { 
                    xs: '1fr',
                    sm: 'repeat(auto-fill, minmax(200px, 1fr))'
                },
                gap: 1,
                width: '100%',
                position: 'relative'
            }}>
                {images.map((image, index) => (
                    <Box
                        key={index}
                        onClick={() => handleImageClick(index)}
                        sx={{
                            position: 'relative',
                            paddingTop: '75%', // 4:3 aspect ratio
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 0.8
                            }
                        }}
                    >
                        <img
                            src={image.url || image}
                            alt={`Property ${index + 1}`}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    </Box>
                ))}
            </Box>

            <Modal
                open={!!selectedImage}
                onClose={handleClose}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& .MuiBackdrop-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)'
                    }
                }}
            >
                <Box sx={{ 
                    position: 'relative',
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    outline: 'none'
                }}>
                    <IconButton
                        onClick={handleClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: 'white',
                            zIndex: 1
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    {images.length > 1 && (
                        <>
                            <IconButton
                                onClick={handlePrevious}
                                sx={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }}
                            >
                                <NavigateBeforeIcon />
                            </IconButton>

                            <IconButton
                                onClick={handleNext}
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'white',
                                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }}
                            >
                                <NavigateNextIcon />
                            </IconButton>
                        </>
                    )}

                    <img
                        src={selectedImage?.url || selectedImage}
                        alt="Selected property"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            objectFit: 'contain'
                        }}
                    />
                </Box>
            </Modal>
        </>
    );
};

export default ImageGallery; 