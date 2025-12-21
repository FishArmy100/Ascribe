import { ViewHistoryContextType } from "@components/providers/ViewHistoryProvider";
import * as bible from "@interop/bible";
import { HRefSrc } from "@interop/html_text";

export function get_handle_ref_clicked_callback(
	set_bible_version_state: (s: bible.BibleDisplaySettings) => Promise<void>,
	bible_version_state: bible.BibleDisplaySettings,
	view_history: ViewHistoryContextType,
	on_click: () => void)
{
	return (href: HRefSrc) => 
	{
		on_click();
		const update_bible_version = (bible: string | null) => 
		{
			bible && set_bible_version_state({
				bible_version: bible,
				parallel_enabled: bible_version_state.parallel_enabled,
				parallel_version: bible_version_state.parallel_version,
				show_strongs: bible_version_state.show_strongs,
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
				entry: href.entry_id,
			})
		}
		else 
		{
			console.error(`Href failed: ${JSON.stringify(href)}`);
		}
	};
}
