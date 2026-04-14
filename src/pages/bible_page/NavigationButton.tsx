import * as images from "@assets";
import { ImageButton } from "@components/index";
import { useTheme } from "@mui/material";
import React from "react";
import use_bible_page_strings from "./bible_page_strings";
import { play_sfx } from "@interop/sfx";

export type NavigationButtonProps = {
	direction: 'left' | 'right';
	on_click: () => void;
	button_width: number;
	button_spacing: number;
}

export const NavigationButton = React.memo(({
	direction, 
	on_click, 
	button_width, 
	button_spacing
}: NavigationButtonProps) => {
	const theme = useTheme();
	const isLeft = direction === 'left';
	const strings = use_bible_page_strings();

	const handle_click = () => {
		play_sfx("page_turn");
		on_click();
	}

	return (
		<ImageButton
			image={isLeft ? images.arrow_left : images.arrow_right}
			tooltip={strings.chapter_nav_tooltip(direction)}
			sx={{
				position: "fixed",
				top: `calc(50% - 30vh / 2)`,
				[isLeft ? 'left' : 'right']: theme.spacing(button_spacing),
				minHeight: "30vh",
				height: "30vh",
				minWidth: (theme) => theme.spacing(button_width),
				width: (theme) => theme.spacing(button_width),
			}}
			on_click={handle_click} />
	);
});
NavigationButton.displayName = 'NavigationButton';
