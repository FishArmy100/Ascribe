import { Box, Divider, Paper, Typography, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import InfoPageToolbar from "./InfoPageToolbar";
import { Footer } from "@components/index";
import { use_app_i18n } from "@components/providers/LanguageProvider";
import __t from "@fisharmy100/react-auto-i18n";
import { ViewHistoryEntry } from "@interop/view_history";
import { use_view_history } from "@components/providers/ViewHistoryProvider";
import { backend_open } from "@interop/index";
import { play_sfx } from "@interop/sfx";


export default function InfoPage(): React.ReactElement
{
    const theme = useTheme();

    const i18n = use_app_i18n();
    
    const content = useMemo(() => {
        if (i18n.locale() === "spa_Latn")
        {
            return (
                <Box
                    sx={{
                        "& p": {
                            textIndent: "2em"
                        },
                        "& .verse": {
                            mt: theme.spacing(5),
                            textAlign: "center",
                            fontStyle: "italic",
                            width: "60%",
                            "& footer": {
                                fontWeight: "bold",
                            }
                        }
                    }}
                >
                    <p>
                        Ascribe es una aplicación gratuita y de código abierto para el estudio de la Biblia,
                        diseñada para ser utilizada por todo tipo de estudiantes de la Biblia, ya tengan o no
                        conocimientos técnicos. Contiene una variedad de traducciones en inglés, español y
                        suajili (Dios mediante, habrá más en el futuro). Ascribe también incluye diversos
                        recursos para el estudio bíblico, como comentarios, diccionarios, referencias cruzadas
                        y planes de lectura (vea más en la <Anchor type="view" entry={{ type: "module_list" }}>página de módulos</Anchor>).
                    </p>
                    <p>
                        Debe señalarse que algunos de estos comentarios contienen información que el autor de
                        esta aplicación no considera doctrinalmente correcta. Sin embargo, se estimó que seguían
                        siendo útiles y por ello fueron incluidos. Para obtener más información sobre aquello
                        con lo que el autor sí está de acuerdo conforme a la Palabra de Dios, visite
                        <Anchor type="link" link="https://www.christadelphia.org/"> este sitio web</Anchor>.
                    </p>
                    <p>
                        Hasta julio de 2026, esta aplicación continúa en desarrollo activo. Se planea agregar
                        la posibilidad de tomar notas, más recursos, compatibilidad con dispositivos móviles,
                        sincronización de notas en la nube, imágenes, recursos en PDF, paquetes personalizados
                        y aún más Biblias en más idiomas, junto con diversas optimizaciones relacionadas con
                        estos cambios.
                    </p>
                    <p>
                        Oro para que esta aplicación ayude a quienes desean aprender la Palabra de Dios y les
                        acompañe en su camino para conocer a nuestro Padre Celestial. Nuestra relación con Él y
                        con Su Hijo es lo único que tiene un significado eterno. Aunque una aplicación puede ser
                        de gran ayuda para el estudio y la comprensión, lo que más importa es el sincero deseo
                        de conocer al Padre por medio de Su verdad.
                    </p>
                    <Typography>
                        Saludos, <i>Nathanael A. Craver</i>
                    </Typography>

                    <Box
                        sx={{
                            width: "100%",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <blockquote className="verse">
                            <p>
                                "Oigamos la conclusión de todo el asunto: Teme a Dios y guarda sus mandamientos,
                                porque esto es el todo del hombre. Porque Dios traerá toda obra a juicio, junto
                                con toda cosa oculta, sea buena o sea mala."
                            </p>
                            <footer>Eclesiastés 12:13-14</footer>
                        </blockquote>
                    </Box>

                </Box>
            );
        }
        else if (i18n.locale() === "swh_Latn")
        {
            return (
                <Box
                    sx={{
                        "& p": {
                            textIndent: "2em"
                        },
                        "& .verse": {
                            mt: theme.spacing(5),
                            textAlign: "center",
                            fontStyle: "italic",
                            width: "60%",
                            "& footer": {
                                fontWeight: "bold",
                            }
                        }
                    }}
                >
                    <p>
                        Ascribe ni programu ya bure na ya chanzo huria ya kujifunza Biblia, iliyokusudiwa
                        kutumiwa na aina zote za wanafunzi wa Biblia, wawe na ujuzi wa teknolojia au la.
                        Ina tafsiri mbalimbali za Biblia katika Kiingereza, Kihispania na Kiswahili (na,
                        Mungu akipenda, nyingine zaidi zinakuja). Ascribe pia inajumuisha rasilimali za
                        kujifunza Biblia kama vile maoni ya Biblia, kamusi, marejeo ya msalaba na mipango
                        ya usomaji (tazama zaidi katika <Anchor type="view" entry={{ type: "module_list" }}>ukurasa wa moduli</Anchor>).
                    </p>
                    <p>
                        Inapaswa kufahamika kwamba baadhi ya maoni haya yana mafundisho ambayo mwandishi wa
                        programu hii haoni kuwa sahihi kibiblia. Hata hivyo, yalionekana kuwa yenye manufaa
                        na kwa sababu hiyo yalijumuishwa. Kwa maelezo zaidi kuhusu yale ambayo mwandishi
                        anaamini kulingana na Neno la Mungu, tafadhali tembelea
                        <Anchor type="link" link="https://www.christadelphia.org/"> tovuti hii</Anchor>.
                    </p>
                    <p>
                        Kufikia Julai 2026, programu hii bado inaendelezwa kikamilifu. Kuna mipango ya
                        kuongeza uwezo wa kuandika madokezo, rasilimali zaidi, usaidizi wa simu za mkononi,
                        usawazishaji wa madokezo kupitia wingu, picha, rasilimali za PDF, vifurushi maalumu,
                        na Biblia zaidi katika lugha nyingi zaidi, pamoja na maboresho mbalimbali
                        yatakayohusiana na mabadiliko hayo.
                    </p>
                    <p>
                        Ninaomba kwamba programu hii iwasaidie wale wanaotaka kujifunza Neno la Mungu na
                        kuwasaidia katika safari yao ya kumjua Baba yetu wa Mbinguni. Uhusiano wetu na Yeye
                        pamoja na Mwana Wake ndio jambo pekee lenye umuhimu wa milele. Ingawa programu inaweza
                        kusaidia katika kujifunza na kuelewa, jambo la muhimu zaidi ni hamu ya kweli ya
                        kumjua Baba kupitia ukweli Wake.
                    </p>
                    <Typography>
                        Kwa heshima, <i>Nathanael A. Craver</i>
                    </Typography>

                    <Box
                        sx={{
                            width: "100%",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <blockquote className="verse">
                            <p>
                                "Na huu ndio mwisho wa jambo lote lililosikiwa: Mche Mungu, nawe uzishike
                                amri zake; maana kwa jumla ndiyo impasayo mwanadamu. Kwa maana Mungu ataleta
                                hukumuni kila tendo, pamoja na kila neno lililofichika, liwe jema au liwe baya."
                            </p>
                            <footer>Mhubiri 12:13-14</footer>
                        </blockquote>
                    </Box>

                </Box>
            );
        }
        else // English
        {
            return (
                <Box
                    sx={{
                        "& p": {
                            textIndent: "2em"
                        },
                        "& .verse": {
                            mt: theme.spacing(5),
                            textAlign: "center",
                            fontStyle: "italic",
                            width: "60%",
                            "& footer": {
                                fontWeight: "bold",
                            }
                        }
                    }}
                >
                    <p>
                        Ascribe is a free and open source Bible study application, which is intended to be used
                        by all forms of Bible students, whether technically inclined or not. It contains a variety 
                        of translations, in English, Spanish, and Swahili (with more on the way Lord willing).
                        Ascribe also includes some Bible study resources such as commentaries, dictionaries, 
                        cross references, and reading plans (see more in the <Anchor type="view" entry={{ type: "module_list" }}>modules page</Anchor>). 
                    </p>
                    <p>
                        It should be noted, that some of these commentaries contains information that the 
                        author of this application would not consider doctrinally sound, however they were 
                        deemed to be useful regardless and so were included. For more information on what the 
                        author does agree with in according to the word of God, please visit <Anchor type="link" link="https://www.christadelphia.org/">this website</Anchor>
                    </p>
                    <p>
                        As of July 2026, this application is still under active development, with plans to add note taking,
                        more resources, mobile support, cloud syncing for notes, images, pdf resources, custom packages, and 
                        even more Bibles in more languages. Along with various optimizations that would go along with those changes.
                    </p>
                    <p>
                        I pray that this application helps those who want to learn God's Word, and assists in their journey to know our Heavenly Father. 
                        Our relationship with Him and His Son is the one thing that holds eternal significance. 
                        While an application can be a helpful for study and understanding, it is ones sincere desire to know the Father through His truth that matters most.
                    </p>
                    <Typography>
                        Regards, <i>Nathanael A. Craver</i>
                    </Typography>
                    
                    <Box
                        sx={{
                            width: "100%",
                            alignItems: "center",
                            display: "flex",
                            justifyContent: "center"
                        }}
                    >
                        <blockquote className="verse">
                            <p>
                                "Let us hear the conclusion of the whole matter: Fear God and keep his commandments: for this is the whole duty of man.
                                For God shall bring every work into judgement, with every secret thing whether it be good or whether it be evil"
                            </p>
                            <footer>Ecclesiastes 12:13-14</footer>
                        </blockquote>
                    </Box>
                    
                </Box>
            )
        }
    }, [i18n])

    return (
        <Box>
            <InfoPageToolbar />
            <Box 
                sx={{ 
                    mt: 6, 
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: `calc(100vh - ${theme.spacing(12)})`,
                }}
            >
                <Paper
                    sx={{
                        width: `calc(100% - ${theme.spacing(6)})`,
                        borderRadius: theme.spacing(1),
                        padding: theme.spacing(3)
                    }}
                >
                    <Typography
                        variant="h3"
                        textAlign="center"
                        fontWeight="bold"
                    >
                        Ascribe
                    </Typography>
                    <Divider />
                    {content}
                </Paper>
            </Box>
            <Footer />
        </Box>
    )
}

type AnchorProps = {
    type: "view",
    entry: ViewHistoryEntry,
    children: React.ReactNode,
} |{
    type: "link",
    link: string,
    children: React.ReactNode,
}

function Anchor(props: AnchorProps): React.ReactElement
{
    const theme = useTheme();
    const view_history = use_view_history();

    if (props.type === "link")
    {
        return (
            <Typography
                component="span"
                sx={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: theme.palette.primary.main,
                    transition: "color 0.3s ease",
                    "&:hover": {
                        color: theme.palette.primary.dark,
                    },
                }}
                onClick={() => { 
                    play_sfx("click")
                    backend_open(props.link)
                }}
            >
                {props.children}
            </Typography>
        )
    }
    else if (props.type === "view")
    {
        return (
            <Typography
                component="span"
                sx={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: theme.palette.primary.main,
                    transition: "color 0.3s ease",
                    "&:hover": {
                        color: theme.palette.primary.dark,
                    },
                }}
                onClick={() => {
                    play_sfx("click")
                    view_history.push(props.entry)
                }}
            >
                {props.children}
            </Typography>
        )
    }
    else 
    {
        return <>ERROR</>
    }
}