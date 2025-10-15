import React from "react";
import { HRefSrc, HtmlText, Node } from "../interop/html_text";
import { Box, Typography, useTheme } from "@mui/material";

export type HtmlTextRendererProps = {
	on_href_click: (src: HRefSrc) => void,
    content: HtmlText,
}

export function HtmlTextRenderer({
	on_href_click: on_link_click,
    content,
}: HtmlTextRendererProps): React.ReactElement 
{
    return (
        <Box>
            {content.nodes.map(n => (
                <HtmlNodeRenderer node={n} on_href_click={on_link_click}/>
            ))}
        </Box>
    )
}

export type HtmlNodeRendererProps = {
    on_href_click: (src: HRefSrc) => void,
    node: Node,
    key?: React.Key
}

export function HtmlNodeRenderer({
    on_href_click,
    node,
    key
}: HtmlNodeRendererProps): React.ReactElement
{
    const theme = useTheme();
    if (node.type === "heading")
    {
        let component: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
        if (node.level === 1) component = "h1";
        else if (node.level === 2) component = "h2";
        else if (node.level === 3) component = "h3";
        else if (node.level === 4) component = "h4";
        else if (node.level === 5) component = "h5";
        else if (node.level === 6) component = "h6";
        else component = "h1";

        return (
            <Typography
                component={component}
                key={key}
                sx={{
                    ...theme.typography[component]
                }}
            >
                {node.content.map(n => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click}/>
                ))}
            </Typography>
        )
    }
    else if (node.type === "horizontal_rule")
    {
        return <hr/>
    }
    else if (node.type === "list")
    {
        let component: "ul" | "ol" = node.ordered ? "ol" : "ul";

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
                {node.items.map((node, i) => (
                    <HtmlNodeRenderer key={i} node={node} on_href_click={on_href_click}/>
                ))}
            </Box>
        )
    }
    else if (node.type === "list_item")
    {
        return (
            <Box
                key={key}
                component="li"
                sx={{
                    mb: 0.5,
                    pl: 1,
                }}
            >
                {node.content.map(n => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click}/>
                ))}
            </Box>
        )
    }
    else if (node.type === "paragraph")
    {
        return (
            <Typography
                key={key}
                component="p"
                sx={{
                    ...theme.typography.body1
                }}
            >
                {node.content.map(n => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click}/>
                ))}
            </Typography>
        )
    }
    else if (node.type === "anchor")
    {
        return (
            <HtmlHRefSrcRenderer
                href={node.href}
                on_click={on_href_click}
                content={node.content}
            />
        )
    }
    else if (node.type === "bold")
    {
        return (
            <strong
                key={key}
            >
                {node.content.map(n => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click}/>
                ))}
            </strong>
        )
    }
    else if (node.type === "italic")
    {
        return (
            <em
                key={key}
            >
                {node.content.map(n => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click}/>
                ))}
            </em>
        )
    }
    else if (node.type === "underline")
    {
        return (
            <u
                key={key}
            >
                {node.content.map(n => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click}/>
                ))}
            </u>
        )
    }
    else if (node.type === "strike")
    {
        return (
            <s
                key={key}
            >
                {node.content.map(n => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click}/>
                ))}
            </s>
        )
    }
    else if (node.type === "text")
    {
        return (
            <span
                key={key}
            >
                {node.text}
            </span>
        )
    }
    else if (node.type === "line_break")
    {
        return (
            <br
                key={key}
            />
        )
    }
    else if (node.type === "image")
    {
        console.log("TODO: need to add image support")
        return (
            <span
                key={key}
            >
                🖼️
            </span>
        );
    }
    else 
    {
        console.error(`Unsupported node type ${(node as any).type}`);
        return null as any;
    }
}

export type HtmlHRefSrcRendererProps = {
    href: HRefSrc,
    on_click: (src: HRefSrc) => void,
    content: Node[],
    key?: React.Key,
}

export function HtmlHRefSrcRenderer({
    href,
    on_click,
    content,
    key
}: HtmlHRefSrcRendererProps): React.ReactElement
{
    const theme = useTheme();
    return (
        <Typography
            key={key}
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
            {content.map(n => (
                <HtmlNodeRenderer node={n} on_href_click={on_click}/>
            ))}
        </Typography>
    )
}