import { use_bible_display_settings } from "@components/providers/BibleDisplaySettingsProvider";
import { use_view_history, ViewHistoryContextType } from "@components/providers/ViewHistoryProvider";
import * as bible from "@interop/bible";
import { HRefSrc } from "@interop/html_text";
import { useCallback, useEffect, useRef } from "react";

export function use_handle_href_clicked_callback(): (href: HRefSrc) => void 
{
	const { bible_display_settings: bible_version_state, set_bible_display_settings: set_bible_version_state } = use_bible_display_settings();
	const view_history = use_view_history();
	const handle_ref_clicked = get_handle_ref_clicked_callback(
		set_bible_version_state, 
		bible_version_state, 
		view_history, 
		() => {}
	);

	const handle_ref_clicked_ref = useRef(handle_ref_clicked);
	useEffect(() => {
		handle_ref_clicked_ref.current = handle_ref_clicked;
	}, [handle_ref_clicked]);

	const ref_clicked_callback = useCallback((href: HRefSrc) => {
		handle_ref_clicked_ref.current(href)
	}, [handle_ref_clicked_ref]);

	return ref_clicked_callback;
}

export function get_handle_ref_clicked_callback(
	set_bible_version_state: (s: bible.BibleDisplaySettings) => Promise<void>,
	bible_display_settings: bible.BibleDisplaySettings,
	view_history: ViewHistoryContextType,
	on_click: () => void): (href: HRefSrc) => void
{
	return (href: HRefSrc) => 
	{
		on_click();
		const update_bible_version = (bible: string | null) => 
		{
			bible && set_bible_version_state({
				bible_version: bible,
				parallel_enabled: bible_display_settings.parallel_enabled,
				parallel_version: bible_display_settings.parallel_version,
				show_strongs: bible_display_settings.show_strongs,
				shown_modules: bible_display_settings.shown_modules
			});
		};

		if (href.type === "ref_id") 
		{
			const id = href.id.id;
			const bible = href.id.bible;
			update_bible_version(bible);

			if (id.type === "range")
			{
				if (id.from.type !== "book" &&
					id.to.type !== "book" &&
					id.from.book === id.to.book &&
					id.from.chapter === id.to.chapter) 
				{
					let start_verse: number | null = null;
					if (id.from.type !== "chapter") 
					{
						start_verse = id.from.verse;
					}

					let end_verse: number | null = null;
					if (id.to.type !== "chapter") 
					{
						end_verse = id.to.verse;
					}

					const book = id.from.book;
					if (start_verse !== null) 
					{
						const chapter = id.from.chapter;
						view_history.push({
							type: "verse",
							chapter: { book, chapter },
							start: start_verse,
							end: end_verse,
						});
					}
					else 
					{
						view_history.push({
							type: "chapter",
							chapter: { book, chapter: 1 }
						});
					}
				}
				else 
				{
					const atom = id.from;
					const book = atom.book;
					if (atom.type === "book") {
						view_history.push({
							type: "chapter",
							chapter: { book, chapter: 1 }
						});
					}
					else if (atom.type === "chapter") 
					{
						const chapter = atom.chapter;
						view_history.push({
							type: "chapter",
							chapter: { book, chapter }
						});
					}
					else 
					{
						const chapter = atom.chapter;
						const verse = atom.verse;

						view_history.push({
							type: "verse",
							chapter: { book, chapter },
							start: verse,
							end: null,
						});
					}
				}
			}
			else 
			{
				const book = id.atom.book;
				if (id.atom.type === "book") {
					view_history.push({
						type: "chapter",
						chapter: { book, chapter: 1 }
					});
				}
				else if (id.atom.type === "chapter") {
					const chapter = id.atom.chapter;
					view_history.push({
						type: "chapter",
						chapter: { book, chapter }
					});
				}
				else 
				{
					const chapter = id.atom.chapter;
					const verse = id.atom.verse;

					view_history.push({
						type: "verse",
						chapter: { book, chapter },
						start: verse,
						end: null,
					});
				}
			}
		}
		else if (href.type === "module_ref")
		{
			view_history.push({
				type: "module_inspector",
				module: href.module,
				selector: { type: "entry", id: href.entry_id},
			})
		}
		else 
		{
			console.error(`Href failed: ${JSON.stringify(href)}`);
		}
	};
}
