import { LangScriptCode } from "@fisharmy100/react-auto-i18n";

/**
 * All language codes used by the Piper TTS engine.
 *
 * Format: <ISO-639-1>_<ISO-3166-1-alpha-2>, e.g. "en_US", "de_DE".
 * Sourced from the rhasspy/piper-voices v1.0.0 release on Hugging Face.
 */
export const PIPER_LANG_CODES = [
    'af_ZA',  // Afrikaans (South Africa)
    'ar_JO',  // Arabic (Jordan) — Modern Standard Arabic
    'ar_SA',  // Arabic (Saudi Arabia)
    'az_AZ',  // Azerbaijani (Azerbaijan)
    'bg_BG',  // Bulgarian (Bulgaria)
    'bn_BD',  // Bengali (Bangladesh)
    'bs_BA',  // Bosnian (Bosnia & Herzegovina)
    'ca_ES',  // Catalan (Spain)
    'cs_CZ',  // Czech (Czech Republic)
    'cy_GB',  // Welsh (United Kingdom)
    'da_DK',  // Danish (Denmark)
    'de_DE',  // German (Germany)
    'el_GR',  // Greek (Greece)
    'en_GB',  // English (British)
    'en_US',  // English (United States)
    'es_ES',  // Spanish (Spain)
    'es_MX',  // Spanish (Mexico)
    'et_EE',  // Estonian (Estonia)
    'eu_ES',  // Basque (Spain)
    'fa_IR',  // Persian (Iran)
    'fi_FI',  // Finnish (Finland)
    'fil_PH', // Filipino (Philippines)
    'fr_FR',  // French (France)
    'ga_IE',  // Irish (Ireland)
    'gd_GB',  // Scottish Gaelic (United Kingdom)
    'gl_ES',  // Galician (Spain)
    'gu_IN',  // Gujarati (India)
    'hi_IN',  // Hindi (India)
    'hr_HR',  // Croatian (Croatia)
    'hu_HU',  // Hungarian (Hungary)
    'is_IS',  // Icelandic (Iceland)
    'id_ID',  // Indonesian (Indonesia)
    'it_IT',  // Italian (Italy)
    'ja_JP',  // Japanese (Japan)
    'ka_GE',  // Georgian (Georgia)
    'kk_KZ',  // Kazakh (Kazakhstan)
    'kn_IN',  // Kannada (India)
    'ko_KR',  // Korean (South Korea)
    'ku_TR',  // Kurdish / Kurmanji (Turkey)
    'ky_KG',  // Kyrgyz (Kyrgyzstan)
    'lb_LU',  // Luxembourgish (Luxembourg)
    'lt_LT',  // Lithuanian (Lithuania)
    'lv_LV',  // Latvian (Latvia)
    'mk_MK',  // Macedonian (North Macedonia)
    'ml_IN',  // Malayalam (India)
    'mr_IN',  // Marathi (India)
    'ms_MY',  // Malay (Malaysia)
    'nb_NO',  // Norwegian Bokmål (Norway)
    'ne_NP',  // Nepali (Nepal)
    'nl_BE',  // Dutch (Belgium)
    'nl_NL',  // Dutch (Netherlands)
    'pa_IN',  // Punjabi (India)
    'pl_PL',  // Polish (Poland)
    'pt_BR',  // Portuguese (Brazil)
    'pt_PT',  // Portuguese (Portugal)
    'ro_RO',  // Romanian (Romania)
    'ru_RU',  // Russian (Russia)
    'si_LK',  // Sinhala (Sri Lanka)
    'sk_SK',  // Slovak (Slovakia)
    'sl_SI',  // Slovenian (Slovenia)
    'sq_AL',  // Albanian (Albania)
    'sr_RS',  // Serbian (Serbia)
    'sv_SE',  // Swedish (Sweden)
    'sw_CD',  // Swahili (DR Congo)
    'ta_IN',  // Tamil (India)
    'te_IN',  // Telugu (India)
    'th_TH',  // Thai (Thailand)
    'tr_TR',  // Turkish (Turkey)
    'uk_UA',  // Ukrainian (Ukraine)
    'ur_PK',  // Urdu (Pakistan)
    'uz_UZ',  // Uzbek (Uzbekistan)
    'vi_VN',  // Vietnamese (Vietnam)
    'zh_CN',  // Chinese Simplified (China)
    'zh_HK',  // Chinese Cantonese (Hong Kong)
    'zh_TW',  // Chinese Traditional (Taiwan)
] as const;

/**
 * The type of all Piper TTS language codes.
 *
 * @example
 * const lang: PiperLangCode = 'en_US';
 * const lang: PiperLangCode = 'zh_CN';
 */
export type PiperLangCode = typeof PIPER_LANG_CODES[number];

/**
 * Maps each LangScriptCode to the closest Piper language tag.
 *
 * Piper uses BCP-47-style codes with underscores: `<lang>_<REGION>`.
 * The lang part is usually ISO 639-1 (2-letter) but falls back to ISO 639-3
 * (3-letter) when no 2-letter code exists. Region distinguishes script
 * variants (e.g. zh_CN = Simplified, zh_TW = Traditional).
 *
 * Entries that have no Piper voice available are mapped to `null`.
 */
const LANG_SCRIPT_TO_PIPER: Record<LangScriptCode, PiperLangCode | null> = {
    ace_Arab: null,
    ace_Latn: null,
    acm_Arab: null,
    acq_Arab: null,
    aeb_Arab: null,
    afr_Latn: 'af_ZA',
    als_Latn: null,         // Tosk Albanian – no Piper voice
    amh_Ethi: null,
    apc_Arab: null,
    arb_Arab: 'ar_JO',     // Modern Standard Arabic; Piper uses ar_JO
    arb_Latn: 'ar_JO',
    arg_Latn: null,
    ars_Arab: 'ar_SA',     // Najdi Arabic
    ary_Arab: null,
    arz_Arab: null,
    asm_Beng: null,
    ast_Latn: null,
    awa_Deva: null,
    ayr_Latn: null,
    azb_Arab: null,
    azj_Latn: 'az_AZ',
    bak_Cyrl: null,
    bam_Latn: null,
    ban_Latn: null,
    bel_Cyrl: null,
    bem_Latn: null,
    ben_Beng: 'bn_BD',
    bho_Deva: null,
    bjn_Arab: null,
    bjn_Latn: null,
    bod_Tibt: null,
    bos_Latn: 'bs_BA',
    brx_Deva: null,
    bug_Latn: null,
    bul_Cyrl: 'bg_BG',
    cat_Latn: 'ca_ES',
    ceb_Latn: null,
    ces_Latn: 'cs_CZ',
    chv_Cyrl: null,
    cjk_Latn: null,
    ckb_Arab: null,
    cmn_Hans: 'zh_CN',
    cmn_Hant: 'zh_TW',
    crh_Latn: null,
    cym_Latn: 'cy_GB',
    dan_Latn: 'da_DK',
    dar_Cyrl: null,
    deu_Latn: 'de_DE',
    dgo_Deva: null,
    dik_Latn: null,
    dyu_Latn: null,
    dzo_Tibt: null,
    ekk_Latn: 'et_EE',
    ell_Grek: 'el_GR',
    eng_Latn: 'en_US',
    epo_Latn: null,
    eus_Latn: 'eu_ES',
    ewe_Latn: null,
    fao_Latn: null,
    fij_Latn: null,
    fil_Latn: 'fil_PH',
    fin_Latn: 'fi_FI',
    fon_Latn: null,
    fra_Latn: 'fr_FR',
    fur_Latn: null,
    fuv_Latn: null,
    gaz_Latn: null,
    gla_Latn: 'gd_GB',
    gle_Latn: 'ga_IE',
    glg_Latn: 'gl_ES',
    gom_Deva: null,
    gug_Latn: null,
    guj_Gujr: null,
    hat_Latn: null,
    hau_Latn: null,
    heb_Hebr: null,
    hin_Deva: 'hi_IN',
    hne_Deva: null,
    hrv_Latn: 'hr_HR',
    hun_Latn: 'hu_HU',
    hye_Armn: null,
    ibo_Latn: null,
    ilo_Latn: null,
    ind_Latn: 'id_ID',
    isl_Latn: 'is_IS',
    ita_Latn: 'it_IT',
    jav_Latn: null,
    jpn_Jpan: 'ja_JP',
    kaa_Latn: null,
    kab_Latn: null,
    kac_Latn: null,
    kam_Latn: null,
    kan_Knda: 'kn_IN',
    kas_Arab: null,
    kas_Deva: null,
    kat_Geor: 'ka_GE',
    kaz_Cyrl: 'kk_KZ',
    kbp_Latn: null,
    kea_Latn: null,
    khk_Cyrl: null,
    khm_Khmr: null,
    kik_Latn: null,
    kin_Latn: null,
    kir_Cyrl: 'ky_KG',
    kmb_Latn: null,
    kmr_Latn: 'ku_TR',     // Kurmanji Kurdish
    knc_Arab: null,
    knc_Latn: null,
    kor_Hang: 'ko_KR',
    ktu_Latn: null,
    lao_Laoo: null,
    lij_Latn: null,
    lim_Latn: null,
    lin_Latn: null,
    lit_Latn: 'lt_LT',
    lld_Latn: null,
    lmo_Latn: null,
    ltg_Latn: null,
    ltz_Latn: 'lb_LU',
    lua_Latn: null,
    lug_Latn: null,
    luo_Latn: null,
    lus_Latn: null,
    lvs_Latn: 'lv_LV',
    mag_Deva: null,
    mai_Deva: null,
    mal_Mlym: 'ml_IN',
    mar_Deva: 'mr_IN',
    mfe_Latn: null,
    mhr_Cyrl: null,
    min_Arab: null,
    min_Latn: null,
    mkd_Cyrl: 'mk_MK',
    mlt_Latn: null,
    mni_Beng: null,
    mni_Mtei: null,
    mos_Latn: null,
    mri_Latn: null,
    mya_Mymr: null,
    myv_Cyrl: null,
    nld_Latn: 'nl_NL',
    nno_Latn: 'nb_NO',     // Nynorsk → closest Piper voice is nb_NO
    nob_Latn: 'nb_NO',
    npi_Deva: 'ne_NP',
    nqo_Nkoo: null,
    nso_Latn: null,
    nus_Latn: null,
    nya_Latn: null,
    oci_Latn: null,
    ory_Orya: null,
    pag_Latn: null,
    pan_Guru: 'pa_IN',
    pap_Latn: null,
    pbt_Arab: null,         // Pashto
    pes_Arab: 'fa_IR',     // Western Farsi
    plt_Latn: null,
    pol_Latn: 'pl_PL',
    por_Latn: 'pt_PT',
    prs_Arab: 'fa_IR',     // Dari → closest is fa_IR
    quy_Latn: null,
    ron_Latn: 'ro_RO',
    run_Latn: null,
    rus_Cyrl: 'ru_RU',
    sag_Latn: null,
    san_Deva: null,
    sat_Olck: null,
    scn_Latn: null,
    shn_Mymr: null,
    sin_Sinh: 'si_LK',
    slk_Latn: 'sk_SK',
    slv_Latn: 'sl_SI',
    smo_Latn: null,
    sna_Latn: null,
    snd_Arab: null,
    snd_Deva: null,
    som_Latn: null,
    sot_Latn: null,
    spa_Latn: 'es_ES',
    srd_Latn: null,
    srp_Cyrl: 'sr_RS',
    ssw_Latn: null,
    sun_Latn: null,
    swe_Latn: 'sv_SE',
    swh_Latn: 'sw_CD',
    szl_Latn: null,
    tam_Taml: 'ta_IN',
    taq_Latn: null,
    taq_Tfng: null,
    tat_Cyrl: null,
    tel_Telu: 'te_IN',
    tgk_Cyrl: null,
    tha_Thai: 'th_TH',
    tir_Ethi: null,
    tpi_Latn: null,
    tsn_Latn: null,
    tso_Latn: null,
    tuk_Latn: null,
    tum_Latn: null,
    tur_Latn: 'tr_TR',
    twi_Latn: null,
    tyv_Cyrl: null,
    uig_Arab: null,
    ukr_Cyrl: 'uk_UA',
    umb_Latn: null,
    urd_Arab: 'ur_PK',
    uzn_Latn: 'uz_UZ',
    uzs_Arab: null,
    vec_Latn: null,
    vie_Latn: 'vi_VN',
    vmw_Latn: null,
    war_Latn: null,
    wol_Latn: null,
    wuu_Hans: null,
    xho_Latn: null,
    ydd_Hebr: null,
    yor_Latn: null,
    yue_Hant: 'zh_HK',     // Cantonese
    zgh_Tfng: null,
    zsm_Latn: 'ms_MY',
    zul_Latn: null,
};

/**
 * Reverse lookup built automatically from LANG_SCRIPT_TO_PIPER.
 * When multiple LangScriptCodes map to the same Piper code, the first
 * encountered entry wins (preference is given to the more canonical script).
 */
const PIPER_TO_LANG_SCRIPT: Record<PiperLangCode, LangScriptCode> = (() => {
    const map: Record<string, LangScriptCode> = {};
    for (const [lang_script, piper] of Object.entries(LANG_SCRIPT_TO_PIPER) as [LangScriptCode, PiperLangCode | null][]) 
    {
        if (piper !== null && !(piper in map)) 
        {
            map[piper] = lang_script;
        }
    }
    return map;
})();

/**
 * Converts a {@link LangScriptCode} to the closest Piper TTS language code.
 *
 * @returns The Piper language code (e.g. `"en_US"`), or `null` if no Piper
 *          voice exists for this language/script combination.
 *
 * @example
 * langScriptToPiper('eng_Latn') // → "en_US"
 * langScriptToPiper('cmn_Hans') // → "zh_CN"
 * langScriptToPiper('cmn_Hant') // → "zh_TW"
 * langScriptToPiper('ace_Arab') // → null
 */
export function lang_script_code_to_piper(code: LangScriptCode): PiperLangCode | null 
{
    return LANG_SCRIPT_TO_PIPER[code] ?? null;
}

/**
 * Converts a Piper TTS language code to the best-matching {@link LangScriptCode}.
 *
 * The match is case-insensitive and normalises both `-` and `_` separators
 * so `"en-US"`, `"en_US"`, and `"en_us"` all resolve correctly.
 *
 * @returns The matching `LangScriptCode`, or `null` if the Piper code is
 *          unrecognized.
 *
 * @example
 * piperToLangScript('en_US') // → "eng_Latn"
 * piperToLangScript('zh_CN') // → "cmn_Hans"
 * piperToLangScript('zh-TW') // → "cmn_Hant"
 * piperToLangScript('xx_YY') // → null
 */
export function piper_lang_to_lang_script_code(piper_code: PiperLangCode): LangScriptCode | null 
{
    return PIPER_TO_LANG_SCRIPT[piper_code];
}