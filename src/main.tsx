import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import AppProviders from "./components/providers/AppProviders";
import AppInitializer from "./components/AppInitializer";
import "./utils/extensions";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppProviders>
			<ThemeProvider theme={theme}>
				<CssBaseline/>
				<AppInitializer>
					<App />
				</AppInitializer>
			</ThemeProvider>
		</AppProviders>
	</React.StrictMode>,
);
