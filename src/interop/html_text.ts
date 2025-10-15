import React from "react";
import { RefId } from "./bible/ref_id";
import { StrongsNumber } from "./bible/strongs";

export type HtmlText = {
	nodes: Node[]
}

export type Node = 
	| { type: "paragraph", content: Node[] }
	| { type: "heading", level: number, content: Node[] }
	| { type: "list", ordered: boolean, items: Node[] }
	| { type: "list_item", content: Node[] }
	| { type: "horizontal_rule" }
	| { type: "text", text: string }
	| { type: "underline", content: Node[] }
	| { type: "italic", content: Node[] }
	| { type: "bold", content: Node[] }
	| { type: "strike", content: Node[] }
	| { type: "image", src: string, alt: string | null }
	| { type: "anchor", href: HRefSrc, content: Node[] }
	| { type: "line_break" }

export type HRefSrc =
	| { type: "ref_id"; value: RefId }
	| { type: "strongs"; value: StrongsNumber }
	| { type: "module_ref"; module_alias: string; entry_id: number };