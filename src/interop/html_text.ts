import React from "react";
import { RefId } from "./bible/ref_id";
import { StrongsNumber } from "./bible/strongs";

export type HtmlText = {
	nodes: Node[]
};

export type Node = 
	| { type: "paragraph", content: Node[] }
	| { type: "heading", level: HeadingLevel, content: Node[] }
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
	| { type: "ref_id"; id: RefId }
	| { type: "strongs"; strongs: StrongsNumber }
	| { type: "module_ref"; module_alias: string; module: string, entry_id: number };

type HeadingLevel = 1 | 2 | 3;

export class HtmlTextHelper
{
	static basic_heading(level: HeadingLevel, text: string): Node 
	{
		return HtmlTextHelper.heading(level, HtmlTextHelper.bold(HtmlTextHelper.text(text)))
	}

	static text(text: string): Node
	{
		return { type: "text", text }
	}

	static heading(level: HeadingLevel, ...content: Node[]): Node
	{
		return { type: "heading", level, content }
	}

	static bold(...content: Node[]): Node
	{
		return { type: "bold", content }
	}

	static italic(...content: Node[]): Node
	{
		return { type: "italic", content }
	}

	static underline(...content: Node[]): Node
	{
		return { type: "underline", content };
	}

	static strike(...content: Node[]): Node 
	{
		return { type: "strike", content }
	}
}