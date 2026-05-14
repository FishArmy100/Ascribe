import React, { useState, useEffect } from "react";
import BiblePrinterPageToolbar from "./BiblePrinterPageToolbar";
import { Box, useTheme } from "@mui/material";
import PdfRenderer from "@components/core/PdfRenderer";
import { backend_preview_bible, PreviewResult } from "@interop/printing";
import { LoadingSpinner } from "../LoadingSpinner";
import { use_bible_print_format } from "@components/providers/PrintBibleFormatProvider";
import { use_bible_print_ranges } from "@components/providers/PrintBibleRangesProvider";

export default function BiblePrinterPage(): React.ReactElement
{
    const [pdf_data, set_pdf_data] = useState<string | null>(null);
    const [error, set_error] = useState<string | null>(null);
    const { format } = use_bible_print_format();
    const { ranges } = use_bible_print_ranges();
    const theme = useTheme();

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
            <BiblePrinterPageToolbar />
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
                    />
                ) : (
                    <LoadingSpinner />
                )}
            </Box>
        </Box>
    )
}