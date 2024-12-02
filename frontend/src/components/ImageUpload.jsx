import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    Box,
    Button,
    Typography,
    IconButton,
    CircularProgress,
    ImageList,
    ImageListItem,
    ImageListItemBar
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const ImageUpload = ({ onUpload, existingImages = [], onDelete }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        setError('');
        
        try {
            const formData = new FormData();
            acceptedFiles.forEach(file => {
                formData.append('images', file);
            });
            
            await onUpload(formData);
        } catch (err) {
            setError('Failed to upload images');
            console.error('Upload error:', err);
        } finally {
            setUploading(false);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        maxSize: 5242880 // 5MB
    });

    return (
        <Box sx={{ width: '100%' }}>
            <Box
                {...getRootProps()}
                sx={{
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragActive ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                }}
            >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Drag & Drop Images Here
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    or click to select files
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Maximum file size: 5MB
                </Typography>
                {uploading && <CircularProgress sx={{ mt: 2 }} />}
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Box>

            {existingImages.length > 0 && (
                <ImageList sx={{ width: '100%', mt: 2 }} cols={3} rowHeight={164}>
                    {existingImages.map((image, index) => (
                        <ImageListItem key={image.url}>
                            <img
                                src={image.url}
                                alt={`Property image ${index + 1}`}
                                loading="lazy"
                                style={{ height: '100%', objectFit: 'cover' }}
                            />
                            <ImageListItemBar
                                actionIcon={
                                    <IconButton
                                        sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                                        onClick={() => onDelete(image)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            />
                        </ImageListItem>
                    ))}
                </ImageList>
            )}
        </Box>
    );
};

export default ImageUpload; 