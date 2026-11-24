import * as images from "@assets";
import { ImageButton } from "@components/index";
import { useTheme } from "@mui/material";
import React, { useMemo } from "react";
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
	const is_left = direction === 'left';
	const strings = use_bible_page_strings();

	const scrollbar_width = window.innerWidth - document.documentElement.clientWidth;
	const spacing = useMemo(() => {
		if (!is_left)
		{
			// HACK: move it slightly to make room for the scrollbar
			return 2 + button_spacing; 
		}
		else
		{
			return button_spacing;
		}
	}, [is_left, scrollbar_width])

	return (
		<ImageButton
			image={is_left ? images.arrow_left : images.arrow_right}
			tooltip={strings.chapter_nav_tooltip(direction)}
			sx={{
				position: "fixed",
				top: `calc(50% - 30vh / 2)`,
				[is_left ? 'left' : 'right']: theme.spacing(spacing),
				minHeight: "30vh",
				height: "30vh",
				minWidth: (theme) => theme.spacing(button_width),
				width: (theme) => theme.spacing(button_width),
			}}
			on_click={on_click} 
			sfx="page_turn"
		/>
	);
});
NavigationButton.displayName = 'NavigationButton';
