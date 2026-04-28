import React, { useState, useEffect } from "react";
import BiblePrinterPageToolbar from "./BiblePrinterPageToolbar";
import { Box } from "@mui/material";
import PdfRenderer from "@components/core/PdfRenderer";
import { backend_print_bible, PrintResult } from "@interop/printing";
import { LoadingSpinner } from "../LoadingSpinner";

export default function BiblePrinterPage(): React.ReactElement
{
    const [pdf_data, set_pdf_data] = useState<string | null>(null);
    const [error, set_error] = useState<string | null>(null);

    useEffect(() => {
        backend_print_bible().then((result: PrintResult) => {
            if (result.type === "printed") {
                set_pdf_data(result.base64);
            } else {
                set_error(result.message);
            }
        }).catch((err) => {
            set_error(err.message);
        });
    }, []);

    return (
        <Box>
            <BiblePrinterPageToolbar />
            <Box sx={{ mt: 7, mr: "auto", ml: "auto " }}>
                {error ? (
                    <Box sx={{ color: "error.main" }}>Error: {error}</Box>
                ) : pdf_data ? (
                    <PdfRenderer file={`data:application/pdf;base64,${pdf_data}`}/>
                ) : (
                    <LoadingSpinner />
                )}
            </Box>
        </Box>
    )
}