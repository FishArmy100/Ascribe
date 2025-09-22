import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppSettingsProvider } from "./components/SettingsContext";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppSettingsProvider>
			<ThemeProvider theme={theme}>
				<CssBaseline/>
				<App />
			</ThemeProvider>
		</AppSettingsProvider>
	</React.StrictMode>,
);
