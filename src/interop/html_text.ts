import React from "react";
import { RefId } from "./bible/ref_id";
import { StrongsNumber } from "./bible/strongs";

export type HtmlText = Block[]

export type Block =
	| { type: "paragraph"; content: Inline[] }
	| { type: "heading"; level: number; content: Inline[] }
	| { type: "list"; ordered: boolean; items: Block[][] }
	| { type: "horizontal_rule" };

export type Inline =
	| { type: "text"; text: string }
	| { type: "underline"; content: Inline[] }
	| { type: "italic"; content: Inline[] }
	| { type: "bold"; content: Inline[] }
	| { type: "strike"; content: Inline[] }
	| { type: "image"; src: string; alt?: string }
	| { type: "anchor"; href: HRefSrc; content: Inline[] }
	| { type: "line_break" };

export type HRefSrc =
	| { type: "ref_id"; value: RefId }
	| { type: "strongs"; value: StrongsNumber }
	| { type: "module_ref"; module_alias: string; entry_id: number };