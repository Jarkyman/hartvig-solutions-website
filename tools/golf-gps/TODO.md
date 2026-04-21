# Golf GPS Mapper – TODO & Forbedringer

## ✅ Færdigt

- [x] **Global header** – CourseID + Hole i fast sticky header
- [x] **Klub-dropdown** – Alfabetisk liste fra `clubs.csv`, fly-to ved valg
- [x] **Bane-dropdown** – Filtreret på klub, inkl. hulantal
- [x] **OOB + Strafområder** – Out of Bounds (LineString), Penalty Yellow/Red (Polygon)
- [x] **Road som LineString**
- [x] **Bunker/Water som Polygon draw** – Genererer automatisk Front/Back Points fra tee-afstand
- [x] **Drawing Mode (click + freehand)** – Toggle i drawing-banner
- [x] **localStorage caching** – Session-state gemmes/gendannes
- [x] **Per-hul row-cache** – Skift hul = rows gemmes/gendannes korrekt
- [x] **Akkumuleret GeoJSON** – Ét FeatureCollection fra alle huller
- [x] **Redesign** – Mørkt tema, kort-layout, badges, animations
- [x] **Quick-add grid** – Kompakt grid med alle POI-typer
- [x] **Drag & Drop import** – `.geojson` import med merge
- [x] **Feature Scope split** – Hole-scoped (Green, Bunker, Tee, Markers, Dogleg) vs Course-scoped (Road, Water, OOB, Penalty, Trees)
- [x] **Course-scoped features** – Separat sektion i panelet, `affectsHoles` felt, persisterer på tværs af huller
- [x] **`featureScope` i JSON** – Hver feature har `featureScope: "hole"` eller `"course"` + `affectsHoles[]`
- [x] **Scope divider UI** – Visuel adskillelse med grøn gradient-linje mellem hole og course sections

---

## 🔧 Prioritet 1 – Mangler / bugs

- [ ] **Tilføj midderlinje** - Der skal tegenes en streg på alle banner, som er en midderlinje der går fra bagerste tee boks til bagerste green. Den skal komme som standard, sammen med green og tee boks.
- [ ] **target cirkerler fix** - Lige nu virker target cirker kun på points. Men den skal fakrisk kun bruges fra green, så det er kun green der skal have den, og så skal det være fra center green den laver cirklerne.
- [ ] **100, 150, 200 meter cirkler** - De skal ligge mid på fariway, så måske vi skal tilføje det automatisk, ved at have n toggel, så slå man den til og så rammer den præcis 100, 150 eller 200 fra mid green og på midderlinje stregen.
- [ ] **Fix import funktion** - When drag and dropping file, it will not add new rows and insert club and cource.
- [ ] **Row highlight on hover** – Hover → marker highlightes
- [ ] **Import gendanner markers** – Importerede features vises som markers/linjer
- [ ] **Fix reload map bug** - Hvis man reloader, så kommer man tilbage til start lokation, den skal huske loaktionen man er på, så man ikke skla trykke til ny lokation igen.

## 🏌️ Prioritet 2 – Funktionalitet

- [ ] **Reorder rows** – Drag & drop rækkefølge
- [ ] **Order rows** – Order rows by POI type, with a button
- [ ] **Hide/Show rows** – Hide/Show rows by POI type, with a button
- [ ] **Copy row** – Copy row, with a button to get a new empty row with same poi.
- [ ] **Hul-oversigt sidebar** – Feature-count per hul
- [ ] 

## 🗄️ Prioritet 3 – Data & Database

- [ ] **D1 upload** – lav sql queries til Cloudflare D1, så jeg kan ligge det ind selv.
- [ ] **Validering** – Advar om manglende koordinater
- [ ] **Brug api** - Brug min api når den er 100% klar. 
- [ ] **Tee-data integration** – Vis teelængder fra `tees.csv`/api

## 💡 Fremtidige idéer

- [ ] **Mål-værktøj** – Klik to punkter → vis afstand
- [ ] **GPX import** - 
- [ ] **Samarbejde** – Del session via URL
- [ ] **Freehand på touch** – Brug `pointermove`/`pointerdown` for tablet-support
