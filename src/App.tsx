import React, { useEffect } from "react";
import BiblePage from "./pages/bible_page/BiblePage";
import { List, RowComponentProps, useDynamicRowHeight, useListRef } from "react-window";

export default function App(): React.ReactElement
{	
	return <BiblePage/>;
}