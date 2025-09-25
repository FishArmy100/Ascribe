import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import theme from "./theme";
import AppProviders from "./components/providers/AppProviders";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppProviders>
			<ThemeProvider theme={theme}>
				<CssBaseline/>
				<App />
			</ThemeProvider>
		</AppProviders>
	</React.StrictMode>,
);
