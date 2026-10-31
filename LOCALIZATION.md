# Offline locale catalog

`locales.js` contains the shipped four-language catalog; `i18n.js` handles exact phrases, dynamic placeholders, DOM text/attributes, native dialogs, and canvas text. No runtime translation API receives player text. Account names and editable field contents are excluded.

Source inventory: `cd security-lab && node extract-localization.cjs > /tmp/tower-texts.json`. Reconcile existing Turkish/English author copy with `node refresh-locale-pairs.cjs /tmp/tower-texts.json`. This preserves existing Spanish/German entries where available. Commit and review the resulting catalog diff, then run `node --test localization.test.js`.

Initial ES/DE prose and unpaired TR→EN entries were generated offline using Argos Open Technologies CTranslate2 models (TR→EN v1.5, EN→ES v1.0, EN→DE v1.3). Models/dependencies are not shipped to players. Their generator environment was temporary; the committed catalog is the durable source. Existing authored bilingual copy takes precedence; central commands were manually supplied. Source: https://github.com/argosopentech/argos-translate and https://data.argosopentech.com/argospm/v1/.

Native editorial review remains required: machine translation can mistranslate short economy labels and narrative context. Four selectable languages and complete catalog fields do not establish native fluency or perfect coverage of future dynamic text. Never report this as fully human-reviewed localization.
