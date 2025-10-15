import React from "react";
import { Block, HRefSrc, HtmlText, Inline } from "../interop/html_text";
import { Box, Typography, useTheme } from "@mui/material";

export type HtmlTextRendererProps = {
	on_href_click: (src: HRefSrc) => void,
    content: HtmlText,
}

export function HtmlTextRenderer({
	on_href_click: on_link_click,
    content
}: HtmlTextRendererProps): React.ReactElement 
{
    return (
        <Box>
            {content.map(c => (
                <HtmlBlockRenderer block={c} on_href_click={on_link_click}/>
            ))}
        </Box>
    )
}

export type HtmlBlockRendererProps = {
    on_href_click: (src: HRefSrc) => void,
    block: Block,
}

export function HtmlBlockRenderer({
    on_href_click,
    block,
}: HtmlBlockRendererProps): React.ReactElement
{
    const theme = useTheme();
    if (block.type === "heading")
    {
        let component: "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        if (block.level === 1) component = "h1";
        else if (block.level === 2) component = "h2";
        else if (block.level === 3) component = "h3";
        else if (block.level === 4) component = "h4";
        else if (block.level === 5) component = "h5";
        else if (block.level === 6) component = "h6";
        else component = "div";

        return (
            <Typography
                component={component}
            >
                {block.content.map(i => (
                    <HtmlInlineRenderer inline={i} on_href_click={on_href_click}/>
                ))}
            </Typography>
        )
    }
    else if (block.type === "horizontal_rule")
    {
        return <hr/>
    }
    else if (block.type === "list")
    {
        let component: "ul" | "ol" = block.ordered ? "ol" : "ul";

        return (
            <Box
                component={component}
                sx={{
                    paddingLeft: 2,
                    margin: 0,
                    "& li": {
                        fontSize: (theme) => theme.typography.body1.fontSize,
                        mb: 0.5,
                    },
                }}
            >
                {block.items.map((blocks, i) => (
                    <Box
                        key={i}
                        component="li"
                        sx={{
                            mb: 0.5,
                            pl: 1,
                        }}
                    >
                        {blocks.map(b => (
                            <HtmlBlockRenderer block={b} on_href_click={on_href_click}/>
                        ))}
                    </Box>
                ))}
            </Box>
        )
    }
    else if (block.type === "paragraph")
    {
        return (
            <Typography
                component="p"
                sx={{
                    ...theme.typography.body1
                }}
            >
                {block.content.map(i => (
                    <HtmlInlineRenderer inline={i} on_href_click={on_href_click}/>
                ))}
            </Typography>
        )
    }
    else 
    {
        return null as any;
    }
}

export type HtmlInlineRendererProps = {
    on_href_click: (src: HRefSrc) => void,
    inline: Inline,
}

export function HtmlInlineRenderer({
    on_href_click,
    inline
}: HtmlInlineRendererProps): React.ReactElement
{
    if (inline.type === "anchor")
    {
        return (
            <HtmlHRefSrcRenderer
                href={inline.href}
                on_click={on_href_click}
                content={inline.content}
            />
        )
    }
    else if (inline.type === "bold")
    {
        return (
            <strong>
                {inline.content.map(c => (
                    <HtmlInlineRenderer inline={c} on_href_click={on_href_click}/>
                ))}
            </strong>
        )
    }
    else if (inline.type === "italic")
    {
        return (
            <em>
                {inline.content.map(c => (
                    <HtmlInlineRenderer inline={c} on_href_click={on_href_click}/>
                ))}
            </em>
        )
    }
    else if (inline.type === "underline")
    {
        return (
            <u>
                {inline.content.map(c => (
                    <HtmlInlineRenderer inline={c} on_href_click={on_href_click}/>
                ))}
            </u>
        )
    }
    else if (inline.type === "strike")
    {
        return (
            <s>
                {inline.content.map(c => (
                    <HtmlInlineRenderer inline={c} on_href_click={on_href_click}/>
                ))}
            </s>
        )
    }
    else if (inline.type === "text")
    {
        return (
            <span>{inline.text}</span>
        )
    }
    else if (inline.type === "line_break")
    {
        return (
            <br/>
        )
    }
    else if (inline.type === "image")
    {
        console.log("TODO: need to add image support")
        return (
            <span>🖼️</span>
        );
    }
    else 
    {
        console.error(`Inline of type ${(inline as any).type} is unsupported`)
        return null as any;
    }
}

export type HtmlHRefSrcRendererProps = {
    href: HRefSrc,
    on_click: (src: HRefSrc) => void,
    content: Inline[],
}

export function HtmlHRefSrcRenderer({
    href,
    on_click,
    content
}: HtmlHRefSrcRendererProps): React.ReactElement
{
    const theme = useTheme();
    return (
        <Typography
            onClick={() => on_click(href)}
            sx={{
                ...theme.typography.body1,
                color: (theme) => theme.palette.primary.main,
                cursor: "pointer",
                "&:hover": {
                    color: (theme) => theme.palette.primary.light
                }
            }}
        >
            {content.map(i => (
                <HtmlInlineRenderer inline={i} on_href_click={on_click}/>
            ))}
        </Typography>
    )
}