import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { Box, Typography, useTheme } from "@mui/material";
import { useMemo } from "react";


export default function Footer(): React.ReactElement
{
    const theme = useTheme();
    const i18n = use_app_i18n();
    const content = useMemo(() => {
        return __t("footer", "Ascribe © 2026")
    }, [i18n])

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: theme.palette.primary.dark,
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
                {content}
            </Typography>
        </Box>
    )
}