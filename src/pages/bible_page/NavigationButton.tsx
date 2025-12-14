import * as images from "@assets";
import { ImageButton } from "@components/index";
import { useTheme } from "@mui/material";
import React from "react";

export const NavigationButton = React.memo(({
	direction, onClick, buttonWidth, buttonSpacing
}: {
	direction: 'left' | 'right';
	onClick: () => void;
	buttonWidth: number;
	buttonSpacing: number;
}) => {
	const theme = useTheme();
	const isLeft = direction === 'left';

	return (
		<ImageButton
			image={isLeft ? images.arrow_left : images.arrow_right}
			tooltip={`To ${isLeft ? 'previous' : 'next'} chapter`}
			sx={{
				position: "fixed",
				top: `calc(50% - 30vh / 2)`,
				[isLeft ? 'left' : 'right']: theme.spacing(buttonSpacing),
				minHeight: "30vh",
				height: "30vh",
				minWidth: (theme) => theme.spacing(buttonWidth),
				width: (theme) => theme.spacing(buttonWidth),
			}}
			on_click={onClick} />
	);
});
NavigationButton.displayName = 'NavigationButton';
