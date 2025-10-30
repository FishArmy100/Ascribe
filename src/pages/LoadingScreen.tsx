import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function LoadingScreen(): React.ReactElement
{
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
				Loading, please wait...
			</Typography>
		</Box>
	);
};
