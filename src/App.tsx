import React from "react";
import { Box, Divider, Typography } from "@mui/material";
import TopBar from "./components/TopBar";
import SearchBar from "./components/searchbar/SearchBar";
import * as images from "./assets";
import ImageDropdown from "./components/ImageDropdown";
import TopBarSpacer from "./components/TopBarSpacer";
import ChapterPicker from "./components/bible/ChapterPicker";
import { pretty_print_chapter } from "./interop/bible";
import VersionSelector from "./components/bible/VersionSelector";
import { invoke } from "@tauri-apps/api/core";
import BiblePage from "./pages/BiblePage";

export default function App(): React.ReactElement
{	

	return <BiblePage/>;

	return (
		<Box sx={{ flexGrow: 1 }}>
			<TopBar
				right_aligned={1}
			>
				<VersionSelector/>
				<ChapterPicker on_select={(c) => console.log(`Selected: ${pretty_print_chapter(c)}`)}/>
				<Divider 
						orientation="vertical" 
						flexItem 
					/>
				<SearchBar on_search={async (term) => {
					let error = await invoke<string | null>("test_search", {
						input_str: term
					});

					return {
						is_error: error !== null,
						error_message: error
					}
				}}/>
				<ImageDropdown 
					image={images.unordered_list}
					tooltip="Menu"
					on_select={(v) => {
						console.log(`Selected option: ${v}`);
					}}
					options={[
						{ image: images.gear_complex, tooltip: "Settings", value: 0 },
						{ image: images.note_plus, tooltip: "Notes", value: 1 },
						{ image: images.info, tooltip: "Help", value: 2 },
					]}
				/>
			</TopBar>

			<TopBarSpacer/>

			<Box sx={{ p: 2 }}>
				{Array.from({ length: 40 }, (_, i) => (
					<Typography key={i} component="p">
						Content {i + 1}
					</Typography>
				))}
			</Box>
		</Box>

	)
}
