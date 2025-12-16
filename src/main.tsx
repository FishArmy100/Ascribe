import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline } from "@mui/material";
import AppProviders from "./components/providers/AppProviders";
import AppInitializer from "./components/AppInitializer";
import "./utils/extensions";
import "./components/bible/BibleWord.css";
import AppThemeProvider from "@components/providers/AppThemeProvider";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppProviders>
			<AppThemeProvider>
				<CssBaseline/>
				<AppInitializer>
					<App />
				</AppInitializer>
			</AppThemeProvider>
		</AppProviders>
	</React.StrictMode>
);
