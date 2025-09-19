import React, { useState } from "react";
import * as images from "./assets"
import { invoke } from "@tauri-apps/api/core";
import { Box, Container, Typography } from "@mui/material";
import ImageButton from "./components/ImageButton";

import { ascribe_logo } from "./assets";

export default function App(): React.ReactElement
{
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
			<ImageButton image={images.ascribe_logo} tooltip="Ascribe!" onClick={() => {
				console.log("Button clicked!")
			}} disabled></ImageButton>
		</Box>
	)
}
