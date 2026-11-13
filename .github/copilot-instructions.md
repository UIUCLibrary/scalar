# Copilot instructions — UIUCLibrary/scalar

This is the University of Illinois Library's fork of [anvc/scalar](https://github.com/anvc/scalar), running the Illinois Open Publishing Network (IOPN) Scalar books.

## Production context

- **Read-only archive.** The Scalar service is discontinued: no new books will be created, and published content is not expected to change except for occasional hotfixes. Most work here will be investigating or fixing an issue on a live book.
- **Public URL:** `https://iopn.library.illinois.edu/scalar/<book-slug>/...`, served through a shared Apache reverse proxy (which also fronts IOPN's WordPress, Pressbooks, Omeka, and OMP sites) to the Scalar server `iopn-scalar-prod.library.illinois.edu`.
- **Admin access** (`/scalar/system/...` login and dashboard) is restricted to the UIUC network at the proxy.
- **Performance:** highly networked books trigger very large numbers of database lookups and send large RDF/JSON payloads to the browser.
- **Upstream vs. local changes:** changes intended for anvc/scalar go on their own branches off `master`; IOPN-only changes (deployment, ops, this file) must not be included in upstream PRs.

## Production Scalar books

There are 30 production Scalar books: 15 monographs from the OMP book catalogs and 15 SourceLab journal articles. Each book's landing page is `https://iopn.library.illinois.edu/scalar/<slug>/index`.

### Books

Source: the IOPN catalogs at <https://iopn.library.illinois.edu/books/windsor-downs/catalog> and <https://iopn.library.illinois.edu/books/pww/catalog>. Other books in those catalogs are on Pressbooks, Omeka, or are PDF-only, and are not served by this app.

| Slug | Title |
| --- | --- |
| `agency-through-otherness` | Agency Through Otherness: Portraits of Performers in Circus Route Books, 1875-1925 |
| `bachcantatas` | Commentaries on the Cantatas of Johann Sebastian Bach: An Interactive Companion |
| `beyondnola` | Beyond NOLA: Exploring Zora Neale Hurston in Bogalusa, Louisiana's Magic City |
| `constructing-solidarities-for-a-humane-urbanism` | Constructing Solidarities for a Humane Urbanism |
| `enrolling-as-cherokee-freedmen` | Enrolling as Cherokee Freedmen: Social Networks of Rejected Applicants |
| `etal` | Et Al.: New Voices in Arts Management |
| `evoking-black-lives` | Evoking the Complexity of Black Lives in the US South: Excavating the Untold Stories |
| `gpbedition` | Gentlemen Prefer Blondes: A Critical Edition |
| `hughes-in-central-asia` | Walking on the Tightrope of Words: Langston Hughes's Soviet Writings |
| `iblack-studies` | iBlack Studies: An Interdisciplinary, Integrative and Interactive Approach |
| `lost-in-the-city-a-exploration-of-edward-p-joness-short-fiction-` | Lost in the City: An Exploration of Edward P. Jones's Short Fiction |
| `love_and_suspense` | Love and Suspense in Paris Noir: Navigating the Seamy World of Jake Lamar's Rendezvous Eighteenth |
| `reading-black-canada` | Reading Black Life in Eighteenth-Century Canada and Lawrence Hill's The Book of Negroes |
| `the-jay-z-mixtape` | #TheJayZMixtape |
| `thesweetpublicdomain` | The Sweet Public Domain: Celebrating Copyright Expiration with the Honey Bunch Series |

### SourceLab articles

Source: the SourceLab journal archive at <https://iopn.library.illinois.edu/journals/sourcelab/issue/archive>. Each article is a Scalar book.

| Slug | Title | Issue |
| --- | --- | --- |
| `franklin` | A Final Link From a Lost Arctic Expedition: A Letter by Sir John Franklin (1845) | Vol. 1 (2020) |
| `montgomery-county` | Courtship, Community, and Conflict: Montgomery County in the Civil War | Vol. 1 (2020) |
| `hows-crops-dean` | How's Crops, Dean? (1932) | Vol. 1 (2020) |
| `stamping-it-out` | Stamping It Out (1880): Imagining the Second Anglo-Afghan War | Vol. 1 (2020) |
| `story-of-menstruation-1946` | The Story of Menstruation (1946): Teaching Menstrual Hygiene in American Classrooms | Vol. 1 (2020) |
| `a-russian-funeral-film-the-funeral-of-anastasia-vialtseva-` | A Russian Funeral Film: The Funeral of Anastasia Vial'tseva | Vol. 2 (2021) |
| `boogaloo-baby-they-made-it-great` | Boogaloo, Baby!: They Made It Great | Vol. 2 (2021) |
| `stereotypes-through-the-stereoscope` | Stereotypes through the Stereoscope: Racism and Sexism in Stereographs | Vol. 2 (2021) |
| `a-medieval-surgery-illustrated-the-first-recorded-surgical-separation-of-conjoined-twins` | A Medieval Surgery, Illustrated: The First Recorded Surgical Separation of Conjoined Twins | Vol. 3 (2022) |
| `public-debates-on-womens-issues-in-postcolonial-kenya-selections-from-viva` | Public Debates on Women's Issues in Postcolonial Kenya: Selections From Viva | Vol. 3 (2022) |
| `the-birth-of-pussy-riot-six-early-songs` | The Birth of Pussy Riot: Six Early Songs | Vol. 3 (2022) |
| `changing-activism-hal-baron-lays-out-strategy-for-civil-rights-in-public-housing` | Changing Activism: Hal Baron Lays Out Strategy for Civil Rights in Public Housing | Vol. 4 (2023) |
| `the-great-depression-and-the-new-deal-transient-division-newsletter-from-macon-georgia` | The Great Depression and the New Deal: Transient Division Newsletter from Macon, Georgia | Vol. 4 (2023) |
| `correcting-and-perfecting-the-body` | Correcting and Perfecting the Body: Presenting Examples of the Human Body at Spurlock | Vol. 5 (2025) |
| `the-protector-the-deity-bes-and-household-worship-in-ancient-egypt` | The Protector: The Deity Bes and Household Worship in Ancient Egypt | Vol. 5 (2025) |

### Refreshing the list

- **Books:** open each `catalog/book/<id>` page in both catalogs, follow its external "Read Online"/"Online" link (`a.remote_resource`), and keep the books whose final URL is under `/scalar/`.
- **SourceLab:** open each `issue/view/<id>` page from the archive, follow each article's "Available Online" galley link (`a.obj_galley_link`), and keep those that resolve to `/scalar/`.
