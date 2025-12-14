import { CircularProgress } from "@mui/material";
import React from "react";

export const LoadingSpinner = React.memo(() => (
	<CircularProgress
		size={60}
		thickness={4}
		sx={{
			position: "fixed",
			left: (theme) => `calc(50vw - ${theme.spacing(4)})`,
			top: (theme) => `calc(50vh - ${theme.spacing(4)})`
		}} />
));

LoadingSpinner.displayName = 'LoadingSpinner';
