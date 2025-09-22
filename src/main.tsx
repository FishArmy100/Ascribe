import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppSettingsProvider } from "./components/SettingsContext";
import { CssBaseline } from "@mui/material";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<AppSettingsProvider>
			<CssBaseline/>
			<App />
		</AppSettingsProvider>
	</React.StrictMode>,
);
