/**
 * Returns a short description of a language for tooltip display.
 * Returns null for common/obvious languages that need no explanation.
 */
export function langDescription(lang: string): string | null {
  const l = lang.toLowerCase();
  if (l.includes('proto-indo-european') || l === 'proto-indo-european')
    return 'Reconstructed ancestor of most European and South Asian languages, spoken ~4500 BCE on the Pontic steppe';
  if (l.includes('proto-germanic'))
    return 'Reconstructed ancestor of the Germanic languages, ~500 BCE';
  if (l.includes('proto-slavic'))
    return 'Reconstructed ancestor of all Slavic languages, ~500 BCE';
  if (l.includes('proto-italic'))
    return 'Reconstructed ancestor of Latin and the Italic languages';
  if (l.includes('byzantine') || l.includes('medieval greek'))
    return 'Greek spoken in the Byzantine Empire, 330–1453 CE';
  if (l.includes('ancient greek') || (l === 'greek'))
    return 'Classical language of ancient Greece, ~800–300 BCE; source of most scientific and philosophical vocabulary';
  if (l.includes('medieval latin') || l.includes('middle latin'))
    return 'Latin used by scholars and clergy across medieval Europe, c. 500–1500 CE';
  if (l.includes('old latin'))
    return 'Latin as spoken in early Rome before the classical period, ~700–75 BCE';
  if (l.includes('vulgar latin'))
    return 'Spoken Latin of the common people; ancestor of the Romance languages';
  if (l.includes('latin') && !l.includes('english'))
    return 'Language of ancient Rome and the Roman Empire; ancestor of French, Spanish, Italian, Portuguese, and Romanian';
  if (l.includes('old english') || l.includes('anglo-saxon'))
    return 'English as spoken in Britain c. 450–1150 CE, brought by Germanic settlers';
  if (l.includes('middle english'))
    return 'English spoken c. 1150–1500 CE; heavily influenced by Norman French';
  if (l.includes('old norse'))
    return 'North Germanic language of medieval Scandinavia, c. 700–1300 CE; source of many English words via Viking settlement';
  if (l.includes('old high german'))
    return 'German as spoken c. 750–1050 CE; ancestor of modern Standard German';
  if (l.includes('middle high german'))
    return 'German as spoken c. 1050–1350 CE';
  if (l.includes('old french'))
    return 'French spoken c. 900–1400 CE; the dominant source of English vocabulary after the Norman Conquest (1066)';
  if (l.includes('middle french'))
    return 'French spoken c. 1340–1610 CE';
  if (l.includes('old irish') || l.includes('old gaelic'))
    return 'Celtic language of Ireland c. 600–900 CE; one of the earliest vernacular written languages in Europe';
  if (l.includes('sanskrit'))
    return 'Ancient Indo-Aryan language of India, c. 1500 BCE; language of the Vedas and classical Hindu texts; oldest well-documented Indo-European language';
  if (l.includes('arabic'))
    return 'Semitic language of the Arab world; major conduit of Greek science and mathematics to medieval Europe';
  if (l.includes('persian') || l.includes('iranian') || l.includes('avestan'))
    return 'Indo-Iranian language of Iran (ancient: Avestan & Old Persian; modern: Farsi); brought many words to English via Arabic and trade routes';
  if (l.includes('hebrew'))
    return 'Ancient Semitic language of the Hebrew Bible; one of the oldest continuously used languages';
  if (l.includes('phoenician'))
    return 'Ancient Semitic language of Phoenicia (modern Lebanon), c. 1050–150 BCE; the Phoenician alphabet is the ancestor of Greek, Latin, Arabic, and Hebrew scripts';
  if (l.includes('etruscan'))
    return 'Ancient language of Etruria (modern Tuscany), predating Roman dominance; not fully deciphered and unrelated to any known language family';
  if (l.includes('tamil'))
    return 'Dravidian language of southern India and Sri Lanka; one of the oldest continuously spoken literary languages in the world';
  if (l.includes('hindi') || l.includes('hindustani'))
    return 'Indo-Aryan language; most widely spoken language of India';
  if (l.includes('malay'))
    return 'Austronesian language of Southeast Asia; lingua franca across the Malay Archipelago';
  if (l.includes('swahili'))
    return 'Bantu language widely used as a lingua franca across East Africa';
  if (l.includes('nahuatl') || l.includes('aztec'))
    return 'Uto-Aztecan language of the Aztec civilization of central Mexico; source of "chocolate", "tomato", "avocado", and many others';
  if (l.includes('carib') || l.includes('arawak'))
    return 'Languages of the indigenous Carib and Arawak peoples of the Caribbean; source of words like "canoe", "hurricane", and "barbecue"';
  if (l.includes('tahitian'))
    return 'Polynesian language of Tahiti; source of "tattoo" and "taboo" (via Captain Cook\'s voyages)';
  if (l.includes('tongan'))
    return 'Polynesian language of the Kingdom of Tonga; "taboo" entered English from here';
  if (l.includes('nguni'))
    return 'Group of Bantu languages of southern Africa (Zulu, Xhosa, Ndebele, Swati)';
  if (l.includes('evenki') || l.includes('tungusic'))
    return 'Tungusic language of indigenous Siberian peoples; source of "shaman" and a likely source of "mammoth"';
  if (l.includes('yiddish'))
    return 'Germanic language written in Hebrew script; spoken by Ashkenazi Jews; source of "chutzpah", "kibitz", and many informal English words';
  if (l.includes('maldiv') || l.includes('dhivehi'))
    return 'Indo-Aryan language of the Maldive Islands; source of "atoll"';
  if (l.includes('czech') || l.includes('slovak'))
    return 'West Slavic language; source of "robot" (from Czech robota, forced labor)';
  if (l.includes('afrikaans'))
    return 'West Germanic language that developed in South Africa from 17th-century Dutch colonial settlers';
  if (l.includes('japanese'))
    return 'Language isolate of Japan; not demonstrably related to any other language family';
  if (l.includes('chinese') || l.includes('mandarin') || l.includes('cantonese'))
    return 'Sino-Tibetan language family; one of the oldest continuous writing traditions (c. 1200 BCE)';
  if (l.includes('scots') || l.includes('scottish'))
    return 'Germanic variety of English that developed in Scotland';
  if (l.includes('dutch'))
    return 'West Germanic language of the Netherlands; closely related to English and German';
  if (l.includes('swedish') || l.includes('danish') || l.includes('norwegian') || l.includes('icelandic') || l.includes('nordic') || l.includes('scandinavian'))
    return 'North Germanic language of Scandinavia, descended from Old Norse';
  if (l.includes('slavic'))
    return 'Branch of Indo-European languages spoken across Central, Eastern, and Southeastern Europe';
  return null;
}

/**
 * Maps a language string to a CSS class for color-coding.
 */
export function langClass(lang: string): string {
  const l = lang.toLowerCase();
  if (l.includes('proto-indo') || l === 'pie') return 'lang-pie';
  if (l.includes('phoenician') || l.includes('semitic')) return 'lang-phoenician';
  if (l.includes('slavic') || l.includes('czech') || l.includes('polish') || l.includes('russian')) return 'lang-slavic';
  if (l.includes('iranian') || l.includes('persian') || l.includes('avestan')) return 'lang-iranian';
  if (l.includes('greek')) return 'lang-greek';
  if (l.includes('latin') || l.includes('italian') || l.includes('french') || l.includes('spanish') || l.includes('portuguese')) return 'lang-latin';
  if (l.includes('english')) return 'lang-english';
  if (l.includes('norse') || l.includes('germanic') || l.includes('german') || l.includes('dutch') || l.includes('nordic') || l.includes('gothic') || l.includes('danish') || l.includes('swedish') || l.includes('icelandic') || l.includes('frisian')) return 'lang-norse';
  return 'lang-other';
}

/**
 * Read a CSS custom property value from :root at runtime.
 * Must be called after DOM is ready — used for D3 node fill colors.
 */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * Maps a language string to a D3-renderable fill color.
 * Reads CSS vars at call time so light/dark theming works.
 */
export function langFillColor(lang: string): string {
  const l = lang.toLowerCase();
  if (l.includes('proto-indo') || l === 'pie') return cssVar('--c-pie');
  if (l.includes('phoenician') || l.includes('semitic') || l.includes('hebrew')) return cssVar('--c-phoenician');
  if (l.includes('slavic') || l.includes('czech') || l.includes('polish') || l.includes('russian')) return cssVar('--c-slavic');
  if (l.includes('iranian') || l.includes('persian') || l.includes('avestan')) return cssVar('--c-iranian');
  if (l.includes('greek')) return cssVar('--c-greek');
  if (l.includes('latin') || l.includes('italian') || l.includes('french') || l.includes('spanish') || l.includes('portuguese') || l.includes('medieval')) return cssVar('--c-latin');
  if (l.includes('english')) return cssVar('--c-english');
  if (l.includes('norse') || l.includes('germanic') || l.includes('german') || l.includes('dutch') || l.includes('gothic') || l.includes('danish') || l.includes('swedish') || l.includes('icelandic') || l.includes('frisian')) return cssVar('--c-norse');
  return cssVar('--c-other');
}
