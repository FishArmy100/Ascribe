import * as images from "@assets";
import { ImageButton } from "@components/index";
import { useTheme } from "@mui/material";
import React from "react";
import use_bible_page_strings from "./bible_page_strings";

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
	const strings = use_bible_page_strings();

	return (
		<ImageButton
			image={isLeft ? images.arrow_left : images.arrow_right}
			tooltip={strings.chapter_nav_tooltip(direction)}
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
