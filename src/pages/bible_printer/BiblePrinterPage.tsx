import React, { useState, useEffect, useCallback } from "react";
import BiblePrinterPageToolbar from "./BiblePrinterPageToolbar";
import { Box, useTheme } from "@mui/material";
import PdfRenderer from "@components/core/pdf/PdfRenderer";
import { backend_download_pdf, backend_get_print_ranges, backend_preview_bible, PreviewResult } from "@interop/printing";
import { LoadingSpinner } from "../LoadingSpinner";
import { use_bible_print_format } from "@components/providers/PrintBibleFormatProvider";
import { use_bible_print_ranges } from "@components/providers/PrintBibleRangesProvider";
import LoadingOverlay from "@components/core/LoadingOverlay";

export default function BiblePrinterPage(): React.ReactElement
{
    const [pdf_data, set_pdf_data] = useState<string | null>(null);
    const [error, set_error] = useState<string | null>(null);
    const { format } = use_bible_print_format();
    const { ranges } = use_bible_print_ranges();
    const theme = useTheme();
    
    const [show_loading, set_show_loading] = useState(false);

    const handle_download = useCallback(() => {
        async function runner()
        {
            if (show_loading) return;

            set_show_loading(true);
            const ranges = await backend_get_print_ranges();
            let response = await backend_download_pdf(ranges);
            set_show_loading(false);
        }

        runner();
    }, [set_show_loading]);

    useEffect(() => {
        set_pdf_data(null);

        backend_preview_bible(ranges()).then((result: PreviewResult) => {
            if (result.type === "printed") {
                set_pdf_data(result.base64);
            } else {
                set_error(result.message);
            }
        }).catch((err) => {
            set_error(err.message);
        });
    }, [format, ranges]);

    return (
        <Box>
            <BiblePrinterPageToolbar on_download={handle_download}/>
            <Box sx={{ 
                mt: 5, 
                display: "flex",
                width: "100vw",
                height: `calc(100vh - ${theme.spacing(5)})`,
                alignItems: "center",
                justifyContent: "center",
            }}>
                {error ? (
                    <Box sx={{ color: "error.main" }}>Error: {error}</Box>
                ) : pdf_data ? (
                    <PdfRenderer 
                        file={`data:application/pdf;base64,${pdf_data}`}
                        sx={{
                            width: "100%",
                            height: "100%",
                            boxSizing: "border-box",
                            border: "none",
                            borderRadius: 0,
                        }}
                        on_download={handle_download}
                    />
                ) : (
                    <LoadingSpinner />
                )}
            </Box>
            <LoadingOverlay show={show_loading}/>
        </Box>
    )
}