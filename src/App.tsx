import React, { useState } from "react";
import * as images from "./assets"
import { Box, Container, Typography, Slider, Stack, useTheme, AppBar, Toolbar } from "@mui/material";
import ImageButton from "./components/ImageButton";
import { use_settings } from "./components/SettingsContext";
import TopBar from "./components/TopBar";
import TopBarSpacer from "./components/TopBarSpacer";

export default function App(): React.ReactElement
{
	const theme = useTheme();
	const { set_settings } = use_settings();

	const [ button_state, set_button_state ] = useState(false);

	return (
		<Box sx={{ flexGrow: 1 }}>
			<TopBar>
				<ImageButton 
					image={images.alarm_clock}
					tooltip="Alarm clock"
					onClick={() => {
						set_button_state(!button_state)
					}}
					active={button_state}
				/>
			</TopBar>

			<TopBarSpacer/>

			<Box sx={{ p: 2 }}>
				{Array.from({ length: 40 }, (_, i) => (
					<Typography key={i} component="p">
						Content {i + 1}
					</Typography>
				))}
			</Box>
		</Box>

	)
}
