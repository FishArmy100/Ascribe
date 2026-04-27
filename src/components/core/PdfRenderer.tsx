import { Box, Typography } from "@mui/material";
import React, { useState, useRef } from "react";
import { pdfjs, Document as PdfDoc, Page as PdfPage } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

export type PdfRendererProps = {
    file: string,
}

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
).toString();

export default function PdfRenderer({
    file
}: PdfRendererProps): React.ReactElement
{
    const [page_count, set_page_count] = useState<number>(0);
    const [current_page, set_current_page] = useState<number>(1);
    const page_refs = useRef<(HTMLDivElement | null)[]>([]);

    const on_load_success = ({ numPages }: { numPages: number }): void => {
        set_page_count(numPages);
        page_refs.current = new Array(numPages).fill(null);
    }

    const on_scroll = (e: React.UIEvent<HTMLDivElement>): void => {
        const container = e.currentTarget;
        const scroll_top = container.scrollTop;
        const container_height = container.clientHeight;

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
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* Page indicator / navigator */}
            <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                py: 1,
                borderBottom: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
            }}>
                <button
                    onClick={() => scroll_to_page(current_page - 1)}
                    disabled={current_page <= 1}
                >
                    ‹ Prev
                </button>
                <Typography variant="body2">
                    Page {current_page} of {page_count}
                </Typography>
                <button
                    onClick={() => scroll_to_page(current_page + 1)}
                    disabled={current_page >= page_count}
                >
                    Next ›
                </button>
            </Box>

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
                    bgcolor: "grey.200",
                }}
            >
                <PdfDoc file={file} onLoadSuccess={on_load_success}>
                    {Array.from({ length: page_count }, (_, i) => (
                        <Box
                            key={i + 1}
                            ref={(el: HTMLDivElement | null) => { page_refs.current[i] = el; }}
                            sx={{ boxShadow: 3, mb: 2, }}
                        >
                            <PdfPage pageNumber={i + 1} />
                        </Box>
                    ))}
                </PdfDoc>
            </Box>

        </Box>
    );
}