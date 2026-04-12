# SEO Rebase Plan pre zenova.sk

Tento dokument je pracovny navrh postupu pre rebase webovej stranky `zenova.sk`.
`zenova.sk` bude hlavna domovska a cielova domena webu aj z pohladu SEO.
Domény `zenovalabs.*` budu sluzit ako dalsie custom domeny, ale cez default-domain redirect budu smerovat na `zenova.sk` ako hlavnu domenu.
Cielom je zlepsit organicku viditelnost vo vyhladavani bez toho, aby web zbytocne narastol na komplexny portal.

## Ciele

- posilnit relevanciu webu pre sluzby, ktore Zenova realne predava
- spravit web zrozumitelnejsi pre Google aj pre navstevnika
- ponechat web staticky, rychly a jednoducho udrziavatelny
- zachovat plne responzivny web pre mobile, tablet aj desktop
- nepouzivat CMS ani databazu
- nepridavat zbytocne vela stranok ani obsahovej "vaty"

## Vychodiska

- aktualny web je silna landing page, ale SEO signaly su slabe
- slovensky a anglicky obsah su na jednej URL, co oslabuje jazykovu relevanciu
- do buducna ma byt `zenova.sk` hlavna indexovana domena; `zenovalabs.*` nemaju s `zenova.sk` sutazit vo vyhladavani ako samostatne rovnocenne weby
- vacsina sluzieb je natlacena na jednu stranku, takze jedna URL sa snazi rankovat na prilis vela tem naraz
- use cases uz ciastocne existuju na LinkedIne alebo Medium, ale hlavny SEO asset by mal vznikat na `zenova.sk` ako vlastna HTML podstranka; externe platformy maju sluzit najma na distribuciu a podporu dosahu

## Navrhovany pristup

Navrhujem ist na to ako na lahky rebase, nie ako na velky rebuild. Prva faza by mala byt mala, kontrolovana a bez overloadu.

### Faza 1: Ujasnenie smeru

Najprv si zadefinujeme 3 hlavne temy, na ktore sa ma web sustredit. Aktualny navrh po prepracovani:

- Microsoft 365, cloud migration a AI productivity
- networking a security
- IoT riesenia

Ciel:

- homepage nebude komunikovat vsetko naraz
- dalsie stranky budu nadvazovat na tieto 3 piliere
- automatizacia a observability nebudu samostatny pilier, ale prierezove capability pod prvymi dvomi smermi
- AI nebude komunikovane ako vseobecne "robime AI", ale ako konkretna sucast Microsoft a Azure ekosystemu

Prakticke vyjadrenie pilierov:

- `Microsoft 365, cloud migration a AI productivity`
  sem patri Microsoft 365 migracia, M365 Copilot, Power Automate, Power Platform a Azure AI Foundry tam, kde ide o produktivitu, workflow alebo firemne AI use cases
- `Networking a security`
  sem patri enterprise networking, Meraki, wireless, LAN/WAN, SD-WAN, segmentacia, zero trust, observability a automatizacia prevadzky siete
- `IoT riesenia`
  sem patria prepojene zariadenia, monitoring prevadzky, zber dat, vzdialeny dohlad a naviazanie IoT vrstvy na sietovu a cloudovu infrastrukturu

### Faza 2: Nova informacna architektura

Bez CMS a bez zbytocneho rozsahu by som navrhoval taku zakladnu strukturu:

- `/` - homepage
- `/sluzby/` - prehlad sluzieb
- `/use-cases/` - prehlad use cases
- `/o-nas/` - firma, partnerstva, certifikacie, pristup
- `/kontakt/` - kontaktna stranka alebo kontaktna sekcia

Volitelne detailne podstranky sluzieb:

- `/sluzby/microsoft-365-cloud-ai/`
- `/sluzby/networking-security/`
- `/sluzby/iot-riesenia/`

Volitelne detailne use-case podstranky:

- `/use-cases/m365-migracia-a-copilot-rollout/`
- `/use-cases/meraki-sd-wan-pobocky/`
- `/use-cases/iot-monitoring-prevadzka/`

Poznamka:

- v prvej verzii netreba robit desiatky stranok
- staci 3 hlavne sluzby a 3 silne use cases
- automatizacia a observability budu zapracovane do servisnych stranok a use caseov, nie ako samostatna hlavna sekcia webu

Umiestnenie partnerov a certifikacii:

- z pohladnu informacnej architektury patria partneri a certifikacie primarne do stranky `/o-nas/`
- na homepage mozu byt neskor pouzite len ako maly trust blok alebo teaser, nie ako rozsiahla galeria
- v prvom release nemusia byt vobec, pretoze z pohladu SEO maju nizsiu prioritu ako sluzby, use cases a technicke SEO minimum
- z pohladu dizajnu je lepsie najprv postavit cistu strukturu bez log-wall sekcie a bez vizualne tazkej certifikatovej galerie

### Faza 3: Jazykova strategia

SEO bude silnejsie, ak nebude slovencina a anglictina na jednej HTML stranke.

Odporucanie:

- prvy release postavit v slovencine ako hlavnej SEO vrstve
- druhy release pridat anglicku verziu na samostatnych URL, kedze je obchodne dolezita
- obidve jazykove verzie udrziavat zo spolocneho content workflow, nie rucnym kopirovanim HTML
- `zenova.sk` ponechat ako hlavnu kanonicku domenu pre oba jazyky
- `zenovalabs.*` pouzit len ako dalsie custom domeny, ktore budu presmerovane na default domain `zenova.sk`

Odporucany model URL:

- SK: `zenova.sk/...`
- EN: `zenova.sk/en/...`
- vstup cez `zenovalabs.*` ma byt presmerovany na `zenova.sk` a jazyk sa ma riesit na urovni webu cez `/` a `/en/`

SEO pravidlo pre domeny:

- indexovatelna a kanonicka ma byt iba cielova URL na `zenova.sk`
- `zenovalabs.*` nemaju hostovat paralelne indexovatelne kopie toho isteho obsahu
- z technickeho pohladu je vhodny default-domain redirect na `zenova.sk`
- jazykove vetvy maju byt rozlisene URL strukturou `/` a `/en/`, nie hostom

Odporucany workflow synchronizacie SK a EN:

1. slovenska verzia bude source of truth
2. obsah sa bude udrziavat v jednoduchych zdrojovych suboroch oddelenych od sablony
3. manualnym triggerom sa spusti agent alebo skript, ktory pripravi EN draft pre nove alebo zmenene bloky
4. anglicka verzia sa pred publikaciou manualne skontroluje a schvali

Technicke odporucanie pre udrzbu:

- obsah nedrzat natvrdo iba v HTML, ale v jednoduchych datovych suboroch pre SK a EN
- sablony stranok maju byt spolocne, rozdielny ma byt len jazykovy obsah a metadata
- agent ma pomahat s prekladom a synchronizaciou, ale nema byt automaticky publisher bez manualneho review
- domenova logika ma byt oddelena od obsahovej logiky; jazyk urcuje cielova URL vetva `/` alebo `/en/`, nie samostatna indexovana domena

Vyhoda:

- obe verzie ostanu vizualne a obsahovo v sulade
- zmena v SK verzii sa bude dat lahko premietnut do EN draftu
- nevznikne situacia, ze jedna jazykova vetva bude dlhodobo zastarana

### Faza 4: Nova uloha homepage

Homepage by nemala byt katalog vsetkeho. Jej ciel je:

- jasne pomenovat co ZENOVA Labs. robi
- odprezentovat 3 hlavne oblasti sluzieb
- ukazat 2 az 3 use cases
- dostat navstevnika ku kontaktu

Odporucane bloky homepage:

- hero s jasnym positioningom
- tri hlavne service bloky
- v kazdom service bloku ukazat konkretne capability, nie len vseobecny nadpis
- kratky blok "pre koho to robime"
- vybrane use cases
- CTA na konzultaciu alebo kontakt

Odporucany obsah troch service blokov:

- blok 1: Microsoft 365, cloud migration a AI productivity
  podpolozky: M365 migracia, Copilot rollout, Power Automate, Azure AI Foundry, governance a adopcia
- blok 2: networking a security
  podpolozky: Meraki, SD-WAN, enterprise networking, segmentacia, observability a automatizacia prevadzky
- blok 3: IoT riesenia
  podpolozky: monitoring zariadeni, zber dat, vzdialeny dohlad, edge konektivita, integracia s cloudom

Dizajnovy dovod:

- takto ostane homepage prehladna a nebude posobit ako dlhy technicky zoznam technologii
- automation a observability sa ukazu tam, kde davaju zmysel, bez vytvarania dalsieho "stvrteho piliera"
- AI bude posobit ako realna sluzba, nie ako buzzword pridany bokom

Poznamka k trust prvkom:

- partneri, certifikacie a loga nepatria do jadra prveho release homepage
- ak sa neskor pridaju, maju fungovat len ako kratky trust signal, nie ako hlavna sekcia
- z pohladu dizajnu je to druha vrstva obsahu; z pohladu SEO to nie je hlavny ranking faktor

### Faza 5: Use cases ako vlastna podstranka

Toto povazujem za jednu z najsilnejsich zmien.

Use cases by nemali byt blog. Mali by to byt staticke, rucne spravovane stranky s jasnou strukturou:

- situacia klienta
- problem alebo vyzva
- navrh riesenia
- pouzite technologie
- vysledok alebo prinos
- volitelne odkaz na LinkedIn clanok ako doplnkovy kontext

Vyhoda:

- SEO hodnota ostane na `zenova.sk`
- LinkedIn ostane podporny kanal, nie hlavny obsahovy domov
- use cases budu najlepsie miesto na dokazanie AI, IoT, observability a automatizacie bez toho, aby homepage bola preplnena

Odporucany publikacny model:

- primarna verzia use case ma byt publikovana na `zenova.sk`
- LinkedIn ma byt pouzity skor ako teaser, zhrnutie alebo distribucny post s odkazom na plnu verziu na webe
- Medium ma zmysel iba ako sekundarny kanal, idealne s canonical odkazom smerujucim na `zenova.sk`
- ak use case uz existuje iba na externej platforme, na `zenova.sk` nema vzniknut slepa kopia 1:1, ale rozsirena a lepsie strukturovana verzia pre web

Preferovane poradie:

1. publikovat plnu verziu na `zenova.sk`
2. spravit kratku distribucnu verziu na LinkedIn s odkazom na web
3. volitelne publikovat verziu na Medium, ak vieme nastavit canonical na povodnu URL z `zenova.sk`

### Faza 6: Rozsah prveho releasu

Odporucany minimalny rozsah:

- nova homepage
- stranka `Sluzby`
- stranka `Use cases`
- 3 detailne use cases
- technicke SEO minimum

Toto je podla mna najlepsi kompromis medzi dopadom a jednoduchostou.

Odporucane rozlozenie prvych 3 use cases:

- 1 use case pre Microsoft 365 alebo AI productivity
- 1 use case pre networking a security
- 1 use case pre IoT riesenie

Poznamka:

- netreba vytvarat samostatnu top-level stranku pre automation alebo observability
- tieto capability maju byt prirodzene sucastou prvych dvoch smerov a ich use caseov

Do prveho releasu vedome nezaratavam:

- partnerov a partnerske loga
- certifikaty a certifikatovu galeriu
- rozsiahlu trust alebo badge sekciu na homepage

Dovod:

- tieto prvky skor pomahaju dovere a obchodnemu dojmu ako priamemu SEO vykonu
- ak sa pridaju prilis skoro, homepage sa lahko vizualne preplni
- vacsi dopad v prvom release budu mat service pages, use cases a technicke SEO opravy

## Technicke SEO minimum

Na kazdej stranke:

- unikatny `title`
- unikatny `meta description`
- `canonical`
- korektny `H1`
- zmysluplna hierarchia `H2` a `H3`
- Open Graph metadata

Na urovni celeho webu:

- `sitemap.xml`
- odkaz na sitemapu v `robots.txt`
- schema typu `Organization` alebo `ProfessionalService`
- ak budu 2 jazyky, tak `hreflang`
- canonical a redirect pravidla musia vzdy uprednostnit `zenova.sk` ako hlavnu domenu

## Obsahove pravidla

Aby sa web nepreplnil, navrhujem tieto limity:

- homepage ma riesit len hlavny positioning a smerovanie
- sluzby zoskupit do 3 hlavnych oblasti, nie 15 rovnocennych kariet
- use cases drzat na 3 az 5 silnych prikladoch
- AI komunikovat cez konkretne sluzby a use cases, nie cez vseobecne marketingove formulacie
- automation a observability komunikovat ako capability v ramci sluzieb, nie ako samostatny hlavny smer
- nepustat sa teraz do blogu ani redakcneho systemu
- nepouzivat dlhe genericke SEO texty bez obchodnej hodnoty

## Praca s LinkedIn a Medium obsahom

LinkedIn a Medium clanky vieme pouzit ako vstupny material pre vlastne podstranky, ale nemali by byt hlavnym miestom, kde obsah "byva".

Navrh postupu:

- vybrat 3 najlepsie use cases z existujuceho obsahu
- prepisat ich do jednotnej struktury pre web
- doplnit ich o kontext, vysledky, technologie a interny linking
- ponechat odkaz na povodny LinkedIn alebo Medium clanok tam, kde dava zmysel

Pravidla pre SEO:

- ak ma obsah SEO ciel, jeho hlavna verzia ma byt na `zenova.sk`
- samotny odkaz na externy clanok je z hladiska SEO slabsi ako vlastna podstranka
- LinkedIn je vhodny na kratky post, excerpt alebo komentar k use case
- Medium je vhodne na sekundarnu distribuciu iba vtedy, ak bude smerovat canonical na `zenova.sk`
- ak starsi clanok uz existuje mimo webu, na `zenova.sk` z neho treba spravit kvalitnejsiu vlastnu verziu, nie iba slepu kopiu

Tymto sposobom sa obsah recykluje, ale hlavna SEO hodnota sa presunie na vlastnu domenu.

## Navrh jednoducheho statickeho content modelu

Bez CMS a bez databazy:

- bud samostatne HTML subory pre jednotlive stranky
- alebo jednoduche data v JSON alebo JS subore, z ktorych sa vyrenderuju karty a prehlady
- pre dvojjazycny web je vhodne oddelit sablony od obsahu, aby SK a EN verzia nevznikali rucnym duplikovanim celej stranky

Odporucanie pre dvojjazycnu udrzbu:

- mat spolocne sablony stranok
- mat samostatne obsahove subory pre `sk` a `en`
- mat jednoduchy manualny workflow `SK update -> agent prelozi EN draft -> clovek skontroluje -> publikacia`

Priorita:

- jednoduche udrziavanie
- rychly build
- ziadna prevadzkova rezia navyse

## Co nerobit v prvej faze

- nepridavat CMS
- nezavadzat databazu
- nerozsirivat web na desiatky podstranok
- nerobit blog len preto, ze "SEO potrebuje blog"
- nerobit samostatnu top-level sekciu pre automation alebo observability
- nepreplnit homepage logami, certifikatmi a dekorativnymi trust prvkami

## Odporucane poradie realizacie

1. potvrdit 3 hlavne temy a cielove sluzby
2. potvrdit novu sitemapu a strukturu stranok
3. navrhnut novu homepage a bloky
4. pripravit stranku `Sluzby`
5. pripravit stranku `Use cases`
6. napisat 3 detailne use cases
7. doplnit technicke SEO minimum
8. nasadit a napojit Search Console

## Otazky na doplnenie pri dalsom kole

- ktore 3 sluzby su obchodne najdolezitejsie
- ci anglicka verzia ma ist do prvej alebo druhej fazy
- ktore LinkedIn clanky maju byt zaklad pre prve use cases
- ktore konkretne AI a IoT use cases chcu ist do prveho release
- ci chceme samostatnu stranku `O nas`, alebo to ponechat ako sekciu na homepage

## Pracovny zaver

Odporucam zostat pri malom, ale silnom statickom webe:

- jedna silna homepage
- jedna prehladova stranka sluzieb
- jedna prehladova stranka use cases
- 3 detailne use-case podstranky
- technicke SEO minimum

Strategicky ramec po prepracovani:

- 3 piliere: Microsoft 365 a AI productivity, networking a security, IoT riesenia
- automation a observability ako capability vrstvy, nie samostatny pilier
- AI komunikovat konkretne cez M365 Copilot, Power Automate a Azure AI Foundry use cases

To by malo priniest vyrazne lepsi zaklad pre organicke vyhladavanie bez toho, aby sa z webu stal tazkopadny obsahovy projekt.
