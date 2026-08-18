/**
 * The shape every language's `common.json` must match. Values are typed as plain `string` rather
 * than `typeof enCommonJson` on purpose: a literal-string type (inferred from the English JSON
 * import) would reject every other language's actual translated text at the type level, since
 * "Today" and "ມື້ນີ້" are not the same literal. `common.json` is the only namespace this phase
 * needs — F3 onward add `auth`, `record`, `today`, `notes`, `reports`, `settings`, `admin`, and
 * `errors` alongside it, per docs/I18N.md's key structure.
 */
export interface CommonDictionary {
  app: {
    name: string;
  };
  nav: {
    sectionShop: string;
    today: string;
    record: string;
    notes: string;
    reports: string;
    settings: string;
    account: string;
    addEntry: string;
  };
  language: {
    switcherLabel: string;
  };
  notFound: {
    title: string;
    body: string;
  };
  placeholder: {
    note: string;
  };
}
