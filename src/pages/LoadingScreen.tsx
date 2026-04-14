import React, { useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";

export default function LoadingScreen(): React.ReactElement
{
	const i18n = use_app_i18n();

	const text = useMemo(() => {
		return __t("loading_screen.message", "Loading, please wait...")
	}, [i18n])

	return (
		<Box
			sx={{
				height: "100vh",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				bgcolor: "background.default",
				color: "text.primary",
			}}
		>
			<CircularProgress size={60} thickness={4} />
			<Typography variant="h6" sx={{ mt: 2 }}>
				{text}
			</Typography>
		</Box>
	);
};
