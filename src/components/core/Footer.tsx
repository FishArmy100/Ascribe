import { Box, Typography, useTheme } from "@mui/material";


export default function Footer(): React.ReactElement
{
    const theme = useTheme();
    return (
        <Box
            component="footer"
            sx={{
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                py: 1,
                mt: "auto",
            }}
        >
            <Typography 
                textAlign="center" 
                variant="body2" 
                fontStyle="italic"
            >
                Ascribe &copy; 2025
            </Typography>
        </Box>
    )
}