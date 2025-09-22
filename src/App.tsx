import React, { useState } from "react";
import * as images from "./assets"
import { Box, Container, Typography, Slider, Stack } from "@mui/material";
import ImageButton from "./components/ImageButton";
import { use_settings } from "./components/SettingsContext";

export default function App(): React.ReactElement
{
	let { set_settings } = use_settings();

	return (
		<Box
			sx={{
				width: "100%",
				height: "100%",
				boxSizing: "border-box",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Stack
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Container>
					<ImageButton image={images.alarm_clock} tooltip="Ascribe!" onClick={() => {
						console.log("Button clicked!")
					}} active></ImageButton>
				</Container>
				<Container>
					<Slider 
						max={2}
						min={0.5}
						step={0.1}
						defaultValue={1}
						onChange={(_, v) => set_settings({ ui_scale: v as number })}
					/>
				</Container>
			</Stack>

		</Box>
	)
}
