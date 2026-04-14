import * as React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { ReadingsDate } from '@interop/bible/readings';
import { use_deep_copy } from '@utils/index';
import { Box } from '@mui/material';
import use_date_names from './date_names';
import { use_app_i18n } from '@components/providers/LanguageProvider';
import { useMemo } from 'react';
import { LangCode, LangScriptCode } from '@fisharmy100/react-auto-i18n';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from "luxon";

export type DatePickerProps = {
    label: string,
    on_change: (date: ReadingsDate) => void,
    date: ReadingsDate,
}

export default function DatePicker({
    label,
    on_change,
    date,
}: DatePickerProps): React.ReactElement
{
    const deep_copy = use_deep_copy();
    const i18n = use_app_i18n();

    const locale = useMemo(() => {
        return to_luxon_locale(i18n.locale());
    }, [i18n.locale()]);

    const on_date_set = React.useCallback((value: DateTime | null) => {
        if (value === null)
        {
            on_change(deep_copy(date));
        }
        else
        {
            on_change({
                year: value.year,
                month: value.month,
                day: value.day,
            });
        }
    }, [on_change]);

    const calendar_date = useMemo(() => {
        return DateTime.fromObject({
            year: date.year,
            month: date.month,
            day: date.day,
        });
    }, [date.year, date.month, date.day]);

    return (
        <Box sx={{ padding: 1 }}>
            <LocalizationProvider
                dateAdapter={AdapterLuxon}
                adapterLocale={locale}
            >
                <MuiDatePicker
                    label={label}
                    value={calendar_date}
                    onChange={on_date_set}
                    slotProps={{ popper: { disablePortal: true } }}
                />
            </LocalizationProvider>
        </Box>
    );
}

const LANG_SCRIPT_TO_BCP47 = {
    ace_Arab: 'ace-Arab',
    ace_Latn: 'ace',
    acm_Arab: 'acm',
    acq_Arab: 'acq',
    aeb_Arab: 'aeb',
    afr_Latn: 'af',
    als_Latn: 'sq',
    amh_Ethi: 'am',
    apc_Arab: 'apc',
    arb_Arab: 'ar',
    arb_Latn: 'ar-Latn',
    arg_Latn: 'an',
    ars_Arab: 'ar-SA',
    ary_Arab: 'ary',
    arz_Arab: 'arz',
    asm_Beng: 'as',
    ast_Latn: 'ast',
    awa_Deva: 'awa',
    ayr_Latn: 'ay',
    azb_Arab: 'az-Arab',
    azj_Latn: 'az',
    bak_Cyrl: 'ba',
    bam_Latn: 'bm',
    ban_Latn: 'ban',
    bel_Cyrl: 'be',
    bem_Latn: 'bem',
    ben_Beng: 'bn',
    bho_Deva: 'bho',
    bjn_Arab: 'bjn-Arab',
    bjn_Latn: 'bjn',
    bod_Tibt: 'bo',
    bos_Latn: 'bs',
    brx_Deva: 'brx',
    bug_Latn: 'bug',
    bul_Cyrl: 'bg',
    cat_Latn: 'ca',
    ceb_Latn: 'ceb',
    ces_Latn: 'cs',
    chv_Cyrl: 'cv',
    cjk_Latn: 'cjk',
    ckb_Arab: 'ckb',
    cmn_Hans: 'zh-Hans',
    cmn_Hant: 'zh-Hant',
    crh_Latn: 'crh',
    cym_Latn: 'cy',
    dan_Latn: 'da',
    dar_Cyrl: 'dar',
    deu_Latn: 'de',
    dgo_Deva: 'dgo',
    dik_Latn: 'din',
    dyu_Latn: 'dyu',
    dzo_Tibt: 'dz',
    ekk_Latn: 'et',
    ell_Grek: 'el',
    eng_Latn: 'en',
    epo_Latn: 'eo',
    eus_Latn: 'eu',
    ewe_Latn: 'ee',
    fao_Latn: 'fo',
    fij_Latn: 'fj',
    fil_Latn: 'fil',
    fin_Latn: 'fi',
    fon_Latn: 'fon',
    fra_Latn: 'fr',
    fur_Latn: 'fur',
    fuv_Latn: 'fuv',
    gaz_Latn: 'om',
    gla_Latn: 'gd',
    gle_Latn: 'ga',
    glg_Latn: 'gl',
    gom_Deva: 'gom',
    gug_Latn: 'gn',
    guj_Gujr: 'gu',
    hat_Latn: 'ht',
    hau_Latn: 'ha',
    heb_Hebr: 'he',
    hin_Deva: 'hi',
    hne_Deva: 'hne',
    hrv_Latn: 'hr',
    hun_Latn: 'hu',
    hye_Armn: 'hy',
    ibo_Latn: 'ig',
    ilo_Latn: 'ilo',
    ind_Latn: 'id',
    isl_Latn: 'is',
    ita_Latn: 'it',
    jav_Latn: 'jv',
    jpn_Jpan: 'ja',
    kaa_Latn: 'kaa',
    kab_Latn: 'kab',
    kac_Latn: 'kac',
    kam_Latn: 'kam',
    kan_Knda: 'kn',
    kas_Arab: 'ks-Arab',
    kas_Deva: 'ks-Deva',
    kat_Geor: 'ka',
    kaz_Cyrl: 'kk',
    kbp_Latn: 'kbp',
    kea_Latn: 'kea',
    khk_Cyrl: 'mn',
    khm_Khmr: 'km',
    kik_Latn: 'ki',
    kin_Latn: 'rw',
    kir_Cyrl: 'ky',
    kmb_Latn: 'kmb',
    kmr_Latn: 'ku',
    knc_Arab: 'knc-Arab',
    knc_Latn: 'knc',
    kor_Hang: 'ko',
    ktu_Latn: 'ktu',
    lao_Laoo: 'lo',
    lij_Latn: 'lij',
    lim_Latn: 'li',
    lin_Latn: 'ln',
    lit_Latn: 'lt',
    lld_Latn: 'lld',
    lmo_Latn: 'lmo',
    ltg_Latn: 'ltg',
    ltz_Latn: 'lb',
    lua_Latn: 'lua',
    lug_Latn: 'lg',
    luo_Latn: 'luo',
    lus_Latn: 'lus',
    lvs_Latn: 'lv',
    mag_Deva: 'mag',
    mai_Deva: 'mai',
    mal_Mlym: 'ml',
    mar_Deva: 'mr',
    mfe_Latn: 'mfe',
    mhr_Cyrl: 'mhr',
    min_Arab: 'min-Arab',
    min_Latn: 'min',
    mkd_Cyrl: 'mk',
    mlt_Latn: 'mt',
    mni_Beng: 'mni-Beng',
    mni_Mtei: 'mni',
    mos_Latn: 'mos',
    mri_Latn: 'mi',
    mya_Mymr: 'my',
    myv_Cyrl: 'myv',
    nld_Latn: 'nl',
    nno_Latn: 'nn',
    nob_Latn: 'nb',
    npi_Deva: 'ne',
    nqo_Nkoo: 'nqo',
    nso_Latn: 'nso',
    nus_Latn: 'nus',
    nya_Latn: 'ny',
    oci_Latn: 'oc',
    ory_Orya: 'or',
    pag_Latn: 'pag',
    pan_Guru: 'pa',
    pap_Latn: 'pap',
    pbt_Arab: 'ps',
    pes_Arab: 'fa',
    plt_Latn: 'mg',
    pol_Latn: 'pl',
    por_Latn: 'pt',
    prs_Arab: 'fa-AF',
    quy_Latn: 'qu',
    ron_Latn: 'ro',
    run_Latn: 'rn',
    rus_Cyrl: 'ru',
    sag_Latn: 'sg',
    san_Deva: 'sa',
    sat_Olck: 'sat',
    scn_Latn: 'scn',
    shn_Mymr: 'shn',
    sin_Sinh: 'si',
    slk_Latn: 'sk',
    slv_Latn: 'sl',
    smo_Latn: 'sm',
    sna_Latn: 'sn',
    snd_Arab: 'sd-Arab',
    snd_Deva: 'sd-Deva',
    som_Latn: 'so',
    sot_Latn: 'st',
    spa_Latn: 'es',
    srd_Latn: 'sc',
    srp_Cyrl: 'sr-Cyrl',
    ssw_Latn: 'ss',
    sun_Latn: 'su',
    swe_Latn: 'sv',
    swh_Latn: 'sw',
    szl_Latn: 'szl',
    tam_Taml: 'ta',
    taq_Latn: 'taq',
    taq_Tfng: 'taq-Tfng',
    tat_Cyrl: 'tt',
    tel_Telu: 'te',
    tgk_Cyrl: 'tg',
    tha_Thai: 'th',
    tir_Ethi: 'ti',
    tpi_Latn: 'tpi',
    tsn_Latn: 'tn',
    tso_Latn: 'ts',
    tuk_Latn: 'tk',
    tum_Latn: 'tum',
    tur_Latn: 'tr',
    twi_Latn: 'tw',
    tyv_Cyrl: 'tyv',
    uig_Arab: 'ug',
    ukr_Cyrl: 'uk',
    umb_Latn: 'umb',
    urd_Arab: 'ur',
    uzn_Latn: 'uz',
    uzs_Arab: 'uz-Arab',
    vec_Latn: 'vec',
    vie_Latn: 'vi',
    vmw_Latn: 'vmw',
    war_Latn: 'war',
    wol_Latn: 'wo',
    wuu_Hans: 'wuu',
    xho_Latn: 'xh',
    ydd_Hebr: 'yi',
    yor_Latn: 'yo',
    yue_Hant: 'yue',
    zgh_Tfng: 'zgh',
    zsm_Latn: 'ms',
    zul_Latn: 'zu',
} satisfies Record<LangScriptCode, string>;

function to_luxon_locale(lang_script_code: LangScriptCode): string {
    return LANG_SCRIPT_TO_BCP47[lang_script_code] ?? 'en';
}