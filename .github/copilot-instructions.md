# Copilot instructions — UIUCLibrary/scalar

This is the University of Illinois Library's fork of [anvc/scalar](https://github.com/anvc/scalar), running the Illinois Open Publishing Network (IOPN) Scalar books.

## Production context

- **Read-only archive.** The Scalar service is discontinued: no new books will be created, and published content is not expected to change except for occasional hotfixes. Most work here will be investigating or fixing an issue on a live book.
- **Public URL:** `https://iopn.library.illinois.edu/scalar/<book-slug>/...`, served through a shared Apache reverse proxy (which also fronts IOPN's WordPress, Pressbooks, Omeka, and OMP sites) to the Scalar server `iopn-scalar-prod.library.illinois.edu`.
- **Admin access** (`/scalar/system/...` login and dashboard) is restricted to the UIUC network at the proxy.
- **Performance:** highly networked books trigger very large numbers of database lookups and send large RDF/JSON payloads to the browser.
- **Upstream vs. local changes:** changes intended for anvc/scalar go on their own branches off `master`; IOPN-only changes (deployment, ops, this file) must not be included in upstream PRs.

## Production Scalar books

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

Each book's landing page is `https://iopn.library.illinois.edu/scalar/<slug>/index`.

To refresh this list, open each `catalog/book/<id>` page in both catalogs, follow its external "Read Online"/"Online" link (`a.remote_resource`), and keep the books whose final URL is under `/scalar/`.
