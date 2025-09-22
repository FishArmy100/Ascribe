import React, { useState } from "react";
import * as images from "./assets"
import { Box, Container, Typography, Slider } from "@mui/material";
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
			<ImageButton image={images.alarm_clock} tooltip="Ascribe!" onClick={() => {
				console.log("Button clicked!")
			}}></ImageButton>
			
			<Slider 
				max={2}
				min={0.5}
				onChange={(_, v) => set_settings({ ui_scale: v })}
			/>

		</Box>
	)
}
