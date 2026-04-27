import React from "react";
import BiblePrinterPageToolbar from "./BiblePrinterPageToolbar";
import { Box } from "@mui/material";
import PdfRenderer from "@components/core/PdfRenderer";
import pdf from "@assets/sample-pdf.pdf"

export default function BiblePrinterPage(): React.ReactElement
{
    return (
        <Box>
            <BiblePrinterPageToolbar />
            <Box sx={{ mt: 7 }}>
                <PdfRenderer file={pdf}/>
            </Box>
        </Box>
    )
}