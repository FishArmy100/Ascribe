import React, { useEffect } from "react";
import BiblePage from "./pages/bible_page/BiblePage";
import { List, RowComponentProps, useDynamicRowHeight, useListRef } from "react-window";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import SearchPage from "./pages/search_page/SearchPage";
import SettingsPage from "./pages/settings_page/SettingsPage";
import ModuleListPage from "./pages/module_list/ModuleListPage";
import ModuleInspectorPage from "./pages/module_inspector/ModuleInspectorPage";

export default function App(): React.ReactElement
{
	const view_history = use_view_history();
	let current = view_history.get_current().current;
	if (current.type === "chapter" || current.type === "verse")
	{
		return <BiblePage entry={current}/>;
	}
	else if (current.type === "word_search")
	{
		return <SearchPage entry={current}/>
	}
	else if (current.type === "settings")
	{
		return <SettingsPage />
	}
	else if (current.type === "module_list")
	{
		return <ModuleListPage />
	}
	else if (current.type === "module_inspector")
	{
		return <ModuleInspectorPage entry={current}/>
	}
	else
	{
		console.log("Should not have gotten here");
		return <></>
	}
}