import { useState } from 'react';
import { 
    Button,
    Menu,
    MenuItem,
    Box,
    Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const SortButton = ({ onSort }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedSort, setSelectedSort] = useState('');

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSortSelect = (sortType) => {
        setSelectedSort(sortType);
        onSort(sortType);
        handleClose();
    };

    return (
        <Box>
            <Button
                onClick={handleClick}
                endIcon={<KeyboardArrowDownIcon />}
                sx={{
                    px: 2.5,
                    py: 1.2,
                    fontSize: '0.9rem',
                    fontWeight: 400,
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    backgroundColor: 'transparent',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '20px',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        backgroundColor: 'transparent',
                        transform: 'translateY(-4px)',
                        color: '#ADD8E6',
                    }
                }}
            >
                {selectedSort === 'price_asc' ? 'Low to High' : selectedSort === 'price_desc' ? 'High to Low' : 'Sort Listings'}
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        mt: 1,
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(10px)'
                    }
                }}
            >
                <MenuItem onClick={() => handleSortSelect('price_asc')}>
                    <Typography>Price: Low to High</Typography>
                </MenuItem>
                <MenuItem onClick={() => handleSortSelect('price_desc')}>
                    <Typography>Price: High to Low</Typography>
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default SortButton; 