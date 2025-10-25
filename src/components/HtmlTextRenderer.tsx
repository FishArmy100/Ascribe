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
            {content.nodes.map((n, i) => (
                <HtmlNodeRenderer node={n} on_href_click={on_link_click} key={i}/>
            ))}
        </Box>
    )
}

export type HtmlNodeRendererProps = {
    on_href_click: (src: HRefSrc) => void,
    node: Node,
}

export function HtmlNodeRenderer({
    on_href_click,
    node
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
            >
                {node.content.map((n, i) => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click} key={i}/>
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
                component="li"
                sx={{
                    mb: 0.5,
                    pl: 1,
                }}
            >
                {node.content.map((n, i) => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click} key={i}/>
                ))}
            </Box>
        )
    }
    else if (node.type === "paragraph")
    {
        return (
            <Typography
                component="p"
            >
                {node.content.map((n, i) => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click} key={i}/>
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
            <Typography
                component="strong"
                sx={{ fontWeight: 'bold', display: 'inline' }}
            >
                {node.content.map((n, i) => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click} key={i} />
                ))}
            </Typography>
        )
    }
    else if (node.type === "italic")
    {
        return (
            <Typography
                component="em"
                sx={{ fontStyle: 'italic', display: 'inline' }}
            >
                {node.content.map((n, i) => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click} key={i} />
                ))}
            </Typography>
        )
    }
    else if (node.type === "underline")
    {
        return (
            <Typography
                component="span"
                sx={{ textDecoration: 'underline', display: 'inline' }}
            >
                {node.content.map((n, i) => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click} key={i} />
                ))}
            </Typography>
        )
    }
    else if (node.type === "strike")
    {
        return (
            <Typography
                component="s"
                sx={{ textDecoration: 'line-through', display: 'inline' }}
            >
                {node.content.map((n, i) => (
                    <HtmlNodeRenderer node={n} on_href_click={on_href_click} key={i}/>
                ))}
            </Typography>
        )
    }
    else if (node.type === "text")
    {
        return (
            <span>
                {node.text}
            </span>
        )
    }
    else if (node.type === "line_break")
    {
        return (
            <br />
        )
    }
    else if (node.type === "image")
    {
        console.log("TODO: need to add image support")
        return (
            <span>
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
    return (
        <Typography
            component="span"
            key={key}
            onClick={() => on_click(href)}
            sx={{
                color: (theme) => theme.palette.info.main,
                cursor: "pointer",
                "&:hover": {
                    color: (theme) => theme.palette.info.light
                }
            }}
        >
            {content.map((n, i) => (
                <HtmlNodeRenderer node={n} on_href_click={on_click} key={i}/>
            ))}
        </Typography>
    )
}