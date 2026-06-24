use isolang::Language;

/// A wrapper around `isolang::Language` that normalizes individual languages
/// up to their ISO 639-3 macrolanguage when doing equality comparisons.
///
/// Under the plain `Language` enum, `Language::Swh` (Coastal Swahili) and
/// `Language::Swa` (Swahili macrolanguage) are distinct variants and will
/// never compare equal. `NormalizedLanguage` resolves both to `Language::Swa`
/// before comparing, so they are treated as the same language.
///
/// The normalization direction is always **individual → macrolanguage**,
/// meaning the more specific code is widened to the broader grouping. This
/// is the right default for tasks like locale matching, content tagging, and
/// deduplication. If you need to preserve the fine-grained distinction (e.g.
/// distinguishing Egyptian Arabic from Moroccan Arabic), compare the inner
/// `Language` values directly instead.
#[derive(Debug, Clone, Copy)]
pub struct NormalizedLanguage(Language);

impl NormalizedLanguage 
{
    /// Wrap a `Language`, immediately normalizing it to its macrolanguage if
    /// one exists.
    pub fn new(lang: Language) -> Self 
    {
        Self(macrolanguage_for(lang).unwrap_or(lang))
    }

    /// Parse from an ISO 639-1 two-letter code (e.g. `"sw"`), returning
    /// `None` if the code is unrecognised.
    pub fn from_639_1(code: &str) -> Option<Self> 
    {
        Language::from_639_1(code).map(Self::new)
    }

    /// Parse from an ISO 639-3 three-letter code (e.g. `"swh"`), returning
    /// `None` if the code is unrecognised.
    pub fn from_639_3(code: &str) -> Option<Self> 
    {
        Language::from_639_3(code).map(Self::new)
    }

    /// Return the (possibly widened) inner `Language`.
    pub fn language(self) -> Language 
    {
        self.0
    }

    /// Return the ISO 639-3 code of the normalized language.
    pub fn to_639_3(self) -> &'static str 
    {
        self.0.to_639_3()
    }

    /// Return the ISO 639-1 code of the normalized language, if one exists.
    pub fn to_639_1(self) -> Option<&'static str> 
    {
        self.0.to_639_1()
    }
}

impl PartialEq for NormalizedLanguage 
{
    fn eq(&self, other: &Self) -> bool 
    {
        // Both sides are already normalized, so a plain variant comparison
        // is sufficient.
        self.0 == other.0
    }
}

impl Eq for NormalizedLanguage {}

impl From<Language> for NormalizedLanguage 
{
    fn from(lang: Language) -> Self 
    {
        Self::new(lang)
    }
}

impl From<NormalizedLanguage> for Language 
{
    fn from(nl: NormalizedLanguage) -> Self 
    {
        nl.0
    }
}

// ---------------------------------------------------------------------------
// Macrolanguage mapping
//
// Source: https://iso639-3.sil.org/code_tables/macrolanguage_mappings/data
// (SIL International, the ISO 639-3 registration authority)
//
// Only a representative subset is shown here to keep the example readable.
// The full table has ~500 entries across 77 macrolanguages; you would expand
// this `match` (or drive it from a generated file) for production use.
// ---------------------------------------------------------------------------

/// Return the macrolanguage that `lang` belongs to, or `None` if `lang` is
/// already a macrolanguage or has no macrolanguage parent.
pub fn macrolanguage_for(lang: Language) -> Option<Language> {
    use Language::*;
    match lang 
    {
        // --- Akan (aka) ---
        Fat | Twi => Some(Aka),

        // --- Albanian (sqi) ---
        Aae | Aat | Aln | Als => Some(Sqi),

        // --- Arabic (ara) — 30+ varieties ---
        // Note: ajp (South Levantine Arabic) was retired in 2023 and merged
        // into apc (Levantine Arabic); it no longer exists as a variant.
        Aao | Abh | Abv | Acm | Acq | Acw | Acx | Acy | Adf | Aeb | Aec
        | Afb | Apc | Apd | Arb | Arq | Ars | Ary | Arz | Auz | Avl
        | Ayh | Ayl | Ayn | Ayp | Pga | Shu | Ssh => Some(Ara),

        // --- Aymara (aym) ---
        Ayc | Ayr => Some(Aym),

        // --- Azerbaijani (aze) ---
        Azb | Azj => Some(Aze),

        // --- Baluchi (bal) ---
        Bcc | Bgn | Bgp => Some(Bal),

        // --- Chinese (zho) — 19 varieties ---
        Cdo | Cjy | Cmn | Cnp | Cpx | Csp | Czh | Czo | Gan | Hak | Hsn
        | Lzh | Mnp | Nan | Wuu | Yue => Some(Zho),

        // --- Cree (cre) ---
        Crj | Crk | Crl | Crm | Csw | Cwd => Some(Cre),

        // --- Estonian (est) ---
        Ekk | Vro => Some(Est),

        // --- Fulah (ful) ---
        Ffm | Fub | Fuc | Fue | Fuf | Fuh | Fui | Fuq | Fuv => Some(Ful),

        // --- Grebo (grb) ---
        Gbo | Ged | Grj | Grv | Gry => Some(Grb),

        // --- Ijo: omitted. `ijo` is an ISO 639-2 collective code only;
        // it is not a 639-3 macrolanguage, so isolang has no Language::Ijo
        // variant to map individual members to. ---

        // --- Inuktitut (iku) ---
        Ike | Ikt => Some(Iku),

        // --- Inupiaq (ipk) ---
        Esi | Esk => Some(Ipk),

        // --- Kashmiri (kas) ---
        // (kas itself is both macro and individual in some tables; no sub-codes
        // currently assigned in the SIL table)

        // --- Komi (kom) ---
        Koi | Kpv => Some(Kom),

        // --- Konkani (kok) ---
        Gom | Knn => Some(Kok),

        // --- Lahnda (lah) ---
        Hnd | Hno | Jat | Phr | Pnb | Skr | Xhe => Some(Lah),

        // --- Malay (msa) ---
        // Bahasa Indonesia (ind) is commonly considered part of the Malay
        // macrolanguage by some authorities; the SIL table maps:
        Bjn | Btj | Bve | Bvu | Coa | Dup | Hji | Jak | Jax | Kvb | Kvr
        | Kxd | Lce | Lcf | Liw | Max | Meo | Mfa | Mfb | Min | Mqg | Msi
        | Mui | Orn | Ors | Pel | Pse | Tmw | Urk | Vkk | Vkt | Wni | Zlm
        | Zmi | Zsm => Some(Msa),
        // Note: `ind` (Indonesian) is sometimes placed here; omitted because
        // it is politically sensitive and inconsistently mapped.

        // --- Mongolian (mon) ---
        Khk | Mvf => Some(Mon),

        // --- Nepali (nep) ---
        Dty | Npi => Some(Nep),

        // --- Norwegian (nor) ---
        Nno | Nob => Some(Nor),

        // --- Oriya (ori) ---
        Ort | Spv => Some(Ori),

        // --- Pashto (pus) ---
        Pbt | Pbu | Pst => Some(Pus),

        // --- Persian (fas) ---
        Prs | Pes => Some(Fas),

        // --- Punjabi (pan) ---
        // SIL does not list sub-codes for pan; omitted.

        // --- Quechua (que) — 44 varieties, abbreviated ---
        Qub | Qud | Quf | Qug | Quh | Qui | Quk | Qul | Qup | Quq | Qur
        | Qus | Quw | Qux | Quy | Quz | Qva | Qvc | Qve | Qvh | Qvi | Qvj
        | Qvl | Qvm | Qvn | Qvo | Qvp | Qvs | Qvw | Qvz | Qwa | Qwc | Qwh
        | Qws | Qxa | Qxc | Qxh | Qxl | Qxn | Qxo | Qxp | Qxr | Qxt | Qxu
        | Qxw => Some(Que),

        // --- Rajasthani (raj) ---
        Bgq | Gda | Gju | Hoj | Mup | Wbr => Some(Raj),

        // --- Romanian (ron) — note: moldavian shares the code in some lists ---
        // SIL maps no individual codes under ron currently.

        // --- Sardinian (srd) ---
        Sdc | Sdn | Src | Sro => Some(Srd),

        // --- Serbian/Croatian/Bosnian — hbs macrolanguage ---
        Bos | Hrv | Srp => Some(Hbs),

        // --- Sichuan Yi (iii) ---
        // SIL lists no sub-codes currently.

        // --- Sign languages — sgn macrolanguage ---
        // (large family; omitted for brevity)

        // --- Swahili (swa) ---
        Swc | Swh => Some(Swa),

        // --- Swedish (swe) ---
        // No sub-codes in SIL table.

        // --- Uzbek (uzb) ---
        Uzn | Uzs => Some(Uzb),

        // --- Yiddish (yid) ---
        Ydd | Yih => Some(Yid),

        // --- Zapotec (zap) — 58 varieties, abbreviated ---
        // (omitted for brevity; follow the same pattern)

        // --- Zhuang (zha) ---
        // Note: ccx (Northern Zhuang) and ccy (Southern Zhuang) are retired
        // codes no longer present in the current isolang table.
        Zch | Zeh | Zgb | Zgm | Zgn | Zhd | Zhn | Zlj | Zln
        | Zlq | Zqe | Zyb | Zyg | Zyj | Zyn | Zzj => Some(Zha),

        // Everything else is either already a macrolanguage or has no parent.
        _ => None,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests 
{
    use super::*;
    use isolang::Language;

    #[test]
    fn swahili_individual_equals_macro() 
    {
        let swh = NormalizedLanguage::new(Language::Swh); // Coastal Swahili
        let swc = NormalizedLanguage::new(Language::Swc); // Congo Swahili
        let swa = NormalizedLanguage::new(Language::Swa); // macrolanguage

        assert_eq!(swh, swa, "Coastal Swahili should equal Swahili macrolanguage");
        assert_eq!(swc, swa, "Congo Swahili should equal Swahili macrolanguage");
        assert_eq!(swh, swc, "Both individual codes should be equal to each other");
    }

    #[test]
    fn arabic_varieties_equal_macro() 
    {
        let arb = NormalizedLanguage::new(Language::Arb); // Standard Arabic
        let arz = NormalizedLanguage::new(Language::Arz); // Egyptian Arabic
        let ara = NormalizedLanguage::new(Language::Ara); // macrolanguage

        assert_eq!(arb, ara);
        assert_eq!(arz, ara);
        assert_eq!(arb, arz);
    }

    #[test]
    fn chinese_varieties_equal_macro() 
    {
        let cmn = NormalizedLanguage::new(Language::Cmn); // Mandarin
        let yue = NormalizedLanguage::new(Language::Yue); // Cantonese
        let zho = NormalizedLanguage::new(Language::Zho); // macrolanguage

        assert_eq!(cmn, zho);
        assert_eq!(yue, zho);
        assert_eq!(cmn, yue);
    }

    #[test]
    fn norwegian_varieties_equal_macro() 
    {
        let nob = NormalizedLanguage::new(Language::Nob); // Bokmål
        let nno = NormalizedLanguage::new(Language::Nno); // Nynorsk
        let nor = NormalizedLanguage::new(Language::Nor); // macrolanguage

        assert_eq!(nob, nor);
        assert_eq!(nno, nor);
        assert_eq!(nob, nno);
    }

    #[test]
    fn distinct_languages_not_equal() 
    {
        let sw = NormalizedLanguage::new(Language::Swa); // Swahili
        let de = NormalizedLanguage::new(Language::Deu); // German

        assert_ne!(sw, de);
    }

    #[test]
    fn from_code_strings() 
    {
        // "sw" is the 639-1 code for the Swahili macrolanguage
        let from_639_1 = NormalizedLanguage::from_639_1("sw").unwrap();
        // "swh" is the 639-3 code for Coastal Swahili (individual)
        let from_639_3 = NormalizedLanguage::from_639_3("swh").unwrap();

        assert_eq!(from_639_1, from_639_3);
    }

    #[test]
    fn macrolanguage_is_idempotent() 
    {
        // Wrapping an already-macro code should not change it.
        let ara = NormalizedLanguage::new(Language::Ara);
        assert_eq!(ara.language(), Language::Ara);
    }
}