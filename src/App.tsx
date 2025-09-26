import React from "react";
import { use_bible_info } from "./components/providers/BibleInfoProvider";

export default function App(): React.ReactElement
{
	const { bible_infos } = use_bible_info();


	return <>
		{ bible_infos["KJV"].name }
	</>

	// return (
	// 	<Box sx={{ flexGrow: 1 }}>
	// 		<TopBar
	// 			right_aligned={1}
	// 		>
	// 			<ImageButton 
	// 				image={images.alarm_clock}
	// 				tooltip="Alarm clock"
	// 				onClick={() => {
	// 					set_button_state(!button_state)
	// 				}}
	// 				active={button_state}
	// 			/>
	// 			<SearchBar on_search={() => {
	// 				return {
	// 					is_error: true,
	// 					error_message: null,
	// 				}
	// 			}}/>
	// 			<ImageDropdown 
	// 				image={images.unordered_list}
	// 				tooltip="Menu"
	// 				on_select={(v) => {
	// 					console.log(`Selected option: ${v}`);
	// 				}}
	// 				options={[
	// 					{ image: images.gear_complex, tooltip: "Settings", value: 0 },
	// 					{ image: images.note_plus, tooltip: "Notes", value: 1 },
	// 					{ image: images.info, tooltip: "Help", value: 2 },
	// 				]}
	// 			/>
	// 		</TopBar>

	// 		<TopBarSpacer/>

	// 		<Box sx={{ p: 2 }}>
	// 			{Array.from({ length: 40 }, (_, i) => (
	// 				<Typography key={i} component="p">
	// 					Content {i + 1}
	// 				</Typography>
	// 			))}
	// 		</Box>
	// 	</Box>

	// )
}
