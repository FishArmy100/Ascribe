import React, { useState } from "react";
import * as images from "./assets"
import { Box, Container, Typography, Slider, Stack, useTheme, AppBar, Toolbar } from "@mui/material";
import ImageButton from "./components/ImageButton";
import { use_settings } from "./components/providers/SettingsProvider";
import TopBar from "./components/TopBar";
import TopBarSpacer from "./components/TopBarSpacer";
import ImageDropdown from "./components/ImageDropdown";
import SearchBar from "./components/searchbar/SearchBar";
import LoadingScreen from "./pages/LoadingScreen";

export default function App(): React.ReactElement
{
	const theme = useTheme();
	const { set_settings } = use_settings();

	const [ button_state, set_button_state ] = useState(false);
	const [selected_value, set_selected_value] = useState("a");


	return <LoadingScreen/>

	return (
		<Box sx={{ flexGrow: 1 }}>
			<TopBar
				right_aligned={1}
			>
				<ImageButton 
					image={images.alarm_clock}
					tooltip="Alarm clock"
					onClick={() => {
						set_button_state(!button_state)
					}}
					active={button_state}
				/>
				<SearchBar on_search={() => {
					return {
						is_error: true,
						error_message: null,
					}
				}}/>
				<ImageDropdown 
					image={images.unordered_list}
					tooltip="Menu"
					on_select={(v) => {
						console.log(`Selected option: ${v}`);
					}}
					options={[
						{ image: images.gear_complex, tooltip: "Settings", value: 0 },
						{ image: images.note_plus, tooltip: "Notes", value: 1 },
						{ image: images.info, tooltip: "Help", value: 2 },
					]}
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
