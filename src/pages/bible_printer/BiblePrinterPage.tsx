import React, { useState, useEffect } from "react";
import BiblePrinterPageToolbar from "./BiblePrinterPageToolbar";
import { Box, useTheme } from "@mui/material";
import PdfRenderer from "@components/core/PdfRenderer";
import { backend_preview_bible, BiblePrintRange, PreviewResult } from "@interop/printing";
import { LoadingSpinner } from "../LoadingSpinner";
import { use_module_configs } from "@components/providers/ModuleConfigProvider";

export default function BiblePrinterPage(): React.ReactElement
{
    const [pdf_data, set_pdf_data] = useState<string | null>(null);
    const [error, set_error] = useState<string | null>(null);
    const { bible_configs } = use_module_configs();
    const theme = useTheme();

    useEffect(() => {
        set_pdf_data(null);
        const range_a: BiblePrintRange = {
            bible: "kjv_eng",
            from: {
                book: "Gen",
                chapter: 1,
                verse: 1,
            },
            to: {
                book: "Gen",
                chapter: 1,
                verse: 31,
            }
        }

        const range_b: BiblePrintRange = {
            bible: "kjv_eng",
            from: {
                book: "Prov",
                chapter: 3,
                verse: 1,
            },
            to: {
                book: "Prov",
                chapter: 3,
                verse: 7,
            }
        }

        backend_preview_bible([range_a, range_b]).then((result: PreviewResult) => {
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