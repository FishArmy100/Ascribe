import { Box, SxProps, Theme, Typography, useTheme } from "@mui/material";
import React, { useState, useRef, useMemo } from "react";
import { pdfjs, Document as PdfDoc, Page as PdfPage } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ImageButton from "./ImageButton";
import * as images from "@assets";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

export type PdfRendererProps = {
    file: string,
    sx?: SxProps<Theme>,
}

export default function PdfRenderer({
    file,
    sx,
}: PdfRendererProps): React.ReactElement
{
    const [page_count, set_page_count] = useState<number>(0);
    const [current_page, set_current_page] = useState<number>(1);
    const page_refs = useRef<(HTMLDivElement | null)[]>([]);
    const i18n = use_app_i18n();
    const theme = useTheme();

    const strings = useMemo(() => ({
        next_page: __t("pdf_renderer.tooltips.next_page", "Next Page"),
        previous_page: __t("pdf_renderer.tooltips.previous_page", "Previous Page"),
    }), [i18n])

    const on_load_success = ({ numPages }: { numPages: number }): void => {
        set_page_count(numPages);
        page_refs.current = new Array(numPages).fill(null);
    }

    const on_scroll = (e: React.UIEvent<HTMLDivElement>): void => {
        const container = e.currentTarget;

        // Find which page occupies the most screen space
        let best_page = 1;
        let best_visibility = -1;

        page_refs.current.forEach((ref, index) => {
            if (!ref) return;
            const rect = ref.getBoundingClientRect();
            const container_rect = container.getBoundingClientRect();
            const visible_top = Math.max(rect.top, container_rect.top);
            const visible_bottom = Math.min(rect.bottom, container_rect.bottom);
            const visible_height = Math.max(0, visible_bottom - visible_top);

            if (visible_height > best_visibility) {
                best_visibility = visible_height;
                best_page = index + 1;
            }
        });

        set_current_page(best_page);
    }

    const scroll_to_page = (page: number): void => {
        page_refs.current[page - 1]?.scrollIntoView({ behavior: "smooth" });
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            height: "80vh",        // ← needs a parent with defined height too
            width: "fit-content",
            position: "relative",  // ← so the absolute toolbar anchors here
            overflow: "hidden",
            borderWidth: theme.spacing(1 / 8),
            borderColor: theme.palette.divider,
            borderStyle: "solid",
            borderRadius: theme.spacing(1),
            ...sx,
        }}>
            {/* Scrollable PDF pages */}
            <Box
                onScroll={on_scroll}
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    py: 2,
                    pb: 6,         // ← leave room for the toolbar at the bottom
                    px: 2,
                }}
            >
                <PdfDoc file={file} onLoadSuccess={on_load_success}>
                    {Array.from({ length: page_count }, (_, i) => (
                        <Box
                            key={i + 1}
                            ref={(el: HTMLDivElement | null) => { page_refs.current[i] = el; }}
                            sx={{ boxShadow: 3, mb: 2 }}
                        >
                            <PdfPage pageNumber={i + 1} />
                        </Box>
                    ))}
                </PdfDoc>
            </Box>

            {/* Toolbar — now inside the relative container */}
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.palette.primary.dark,
                gap: 2,
                py: 1,
                flexShrink: 0,
            }}>
                <ImageButton
                    image={images.angles_left}
                    tooltip={strings.previous_page}
                    on_click={() => scroll_to_page(current_page - 1)}
                    sfx="page_turn"
                />
                <Typography 
                    variant="body2"
                    color="white"
                >
                    Page {current_page} of {page_count}
                </Typography>
                <ImageButton
                    image={images.angles_right}
                    tooltip={strings.next_page}
                    on_click={() => scroll_to_page(current_page + 1)}
                    sfx="page_turn"
                />
            </Box>
        </Box>
    );
}