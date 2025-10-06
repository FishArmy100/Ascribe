import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import React from "react";
import TopBar, { use_top_bar_padding } from "../components/TopBar";
import VersionSelector from "../components/bible/VersionSelector";
import ChapterPicker from "../components/bible/ChapterPicker";
import SearchBar from "../components/searchbar/SearchBar";
import { invoke } from "@tauri-apps/api/core";
import ImageDropdown from "../components/ImageDropdown";
import * as images from "../assets"
import TopBarSpacer from "../components/TopBarSpacer";
import { use_view_history } from "../components/providers/ViewHistoryProvider";
import ImageButton, { get_button_size } from "../components/ImageButton";
import Footer from "../components/Footer";
import { use_settings } from "../components/providers/SettingsProvider";
import use_window_size from "../utils/use_window_size";


export default function BiblePage(): React.ReactElement
{
	const { settings } = use_settings()
	const button_width = get_button_size(settings);
	const theme = useTheme();
	const button_spacing = use_top_bar_padding(settings, theme);

	const button_space = button_width * 2 + button_spacing * 4;


    return (
        <Box>
			<BiblePageToolbar/>
			<TopBarSpacer/>
			
			<Box
				sx={{
					mt: 5,
					mb: `calc(100vh - (14 * ${theme.spacing()}))`,
					display: "flex",
					justifyContent: "center",
					width: "100%",
				}}
			>
				<Paper
					sx={{
						borderRadius: 2,
						width: `calc(100% - ${button_space}px)`,
						minWidth: `calc(100% - ${button_space}px)`,
					}}
				>
					<Box sx={{ p: 2 }}>
						{Array.from({ length: 40 }, (_, i) => (
							<Typography key={i} component="p">
								Content {i + 1}
							</Typography>
						))}
					</Box>
				</Paper>
			</Box>
			<Footer/>
		</Box>
    )
}

function BiblePageToolbar(): React.ReactElement
{
    const view_history = use_view_history();
    console.log(JSON.stringify(view_history.get_current()))
    console.log("disabled = " + (view_history.get_current().index >= view_history.get_current().count - 1))

    return (
        <TopBar
				right_aligned={1}
			>
				<VersionSelector/>
				<ChapterPicker on_select={(c) => view_history.push({
                    type: 'chapter',
                    chapter: c,
                })}/>
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
                <Divider 
                    orientation="vertical" 
                    flexItem 
                />
                <ImageButton
                    image={images.arrow_turn_left}
                    tooltip="To previous page"
                    disabled={view_history.get_current().index === 0}
                    on_click={() => view_history.retreat()}
                />
                <ImageButton
                    image={images.arrow_turn_right}
                    tooltip="To next page"
                    disabled={view_history.get_current().index >= view_history.get_current().count - 1}
                    on_click={() => view_history.advance()}
                />
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
    )
}