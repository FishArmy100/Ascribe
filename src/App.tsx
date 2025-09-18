import React, { useState } from "react";
import * as images from "./assets"
import { invoke } from "@tauri-apps/api/core";
import { Container, Typography } from "@mui/material";

export default function App(): React.ReactElement
{
	return (
		<Container
			maxWidth="sm"
		>
			<Typography variant="h1" align="center">
				Ascribe
			</Typography>
		</Container>)
}
