# Azure Infra a CI/CD Plan pre zenova.sk

Tento dokument rozpracovava technicky navrh pre Azure infrastrukturu, redirect logiku, build prostredie a CI/CD pre projekt `zenova.sk`.

Aktualny implementovany environment model je zhrnuty aj samostatne:

- [Azure environments and delivery model](./azure-environments-delivery-model.md)

Finalne rozhodovanie medzi `SWA Standard`, `SWA + enterprise-grade edge`, `SWA + Azure Front Door` a `SWA + Azure Application Gateway` je zhrnute aj v samostatnom dokumente:

- [Azure edge decision record](./azure-edge-decision.md)

Rozhodnutie medzi `Bicep`, `Terraform` a `ARM templates` je zhrnute tiez samostatne:

- [Azure IaC decision record](./azure-iac-decision.md)

## Zhrnutie odporucania

Odporucany cielovy stav:

- `zenova.sk` bude hlavna kanonicka a indexovana domena
- `zenova.sk/en/...` bude anglicka verzia na tej istej cielovej domene
- `zenovalabs.*` budu pripojene ako dalsie custom domeny a SWA ich presmeruje na default domain `zenova.sk`
- hosting webu bude na Azure Static Web Apps Standard
- enterprise-grade edge bude sucast cieloveho modelu
- locale logika bude riesena v aplikacii na webe, nie na urovni domeny alebo edge vrstvy
- Infrastructure as Code bude v Bicep
- CI/CD bude oddelene pre `ci`, `test` a `prod`

Po dodatocnom prehodnoteni nakladov a zlozitosti:

- Azure Application Gateway nie je pre tento konkretny staticky web odporucana alternativa
- Azure Front Door zostava samostatna edge platforma pre buduce rozsirenia
- pre tento projekt je cielovy model `Static Web Apps Standard s enterprise-grade edge`

## Stav dnes

Aktualny stav repozitara:

- web sa nasadzuje cez jeden GitHub Actions workflow do Azure Static Web Apps
- v repozitari dnes nie je Infrastructure as Code vrstva pre Azure zdroje
- nie je oddelene testovacie a produkcne prostredie na urovni zdrojov
- nie je formalizovany pipeline pre `what-if`, infra deployment a app deployment

Prakticky dopad:

- infrastruktura sa neda jednoducho reprodukovat
- zmeny na edge vrstve a domenach nie su verzovane spolu s aplikaciou
- projekt sa horsie prezentuje ako kompletna Azure webova aplikacia

Poznamka k sucasnemu stavu:

- subor [src/staticwebapp.config.json](/workspaces/zenova-web/src/staticwebapp.config.json) je uz upraveny do validneho stavu
- repozitar uz dnes obsahuje prvy verejny CI validation workflow, ktory kontroluje build, zakladnu SEO konzistenciu, sitemapu, interni linking a verejnu infra strukturu
- dalsie CI rozsirenia maju nadvazovat na tento zaklad, nie ho nahradzat

Aktualny verejny foundation v repozitari:

- `infra/main.bicep` ako subscription-level orchestration entrypoint
- `infra/modules/resource-group.bicep`
- `infra/modules/static-web-app.bicep`
- `infra/modules/dns-zone-placeholder.bicep`
- `infra/params/test.bicepparam`
- `infra/params/prod.bicepparam`
- workflowy:
  - `.github/workflows/ci-validation.yml`
  - `.github/workflows/preview-pr.yml`
  - `.github/workflows/infra-whatif.yml`
  - `.github/workflows/deploy-test.yml`
  - `.github/workflows/deploy-prod.yml`

Aktualny bootstrap model:

- `deploy-test.yml` je staged workflow
- phase 1 vytvori RG + SWA + edge-ready foundation bez SWA tokenu
- phase 2 nasadi `dist/` po doplneni `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `preview-pr.yml` sa aktivuje az po phase 2
- `deploy-prod.yml` uz pouziva rovnaky staged model pre produkciu

## Rozhodnutie o platforme

### Azure Static Web Apps

Azure Static Web Apps dava pre tento projekt zmysel aj nadalej:

- je to staticky web bez databazy a bez CMS
- ma natyvnu integraciu s GitHub Actions
- ma preview prostredia pre pull requesty
- dobre sedi na jednoduche prezencne alebo service-driven weby
- vie obsluzit viac custom domains a default-domain redirect bez potreby samostatnej edge vrstvy

### Azure Front Door Standard

Azure Front Door zostava volitelna buduca rozsirovacia vrstva, nie sucast cieloveho prveho produkcneho modelu.

Kedy by daval zmysel:

- potrebujes host-based a path-based redirect logiku medzi viacerymi domenami
- potrebujes jemnejsie smerovanie podla hostu alebo path mimo moznosti SWA default domain
- potrebujes mat pokrocilejsi edge routing alebo verejne reprezentativnu enterprise edge architekturu

To je presne typ scenara, kde ma Front Door vyhodu:

- je to Layer 7 sluzba pre HTTP/HTTPS
- vie path-based routing a URL redirect
- vie host-based pravidla
- vie fungovat ako edge vrstva pred Static Web Apps

Preco ho teraz nevolime:

- podla oficialnej Azure pricing stranky ma Azure Front Door Standard zakladny mesacny poplatok `35 USD` plus requesty a data transfer
- pre aktualne potreby jednoducheho regionalneho webu je to neprimerane vela

### Preco nie Azure Load Balancer

Azure Load Balancer na toto nie je vhodna nahrada.

Dovod:

- Azure Load Balancer je Layer 4 sluzba pre TCP a UDP
- neriesi HTTP hostnames, URL path ani webovy redirect model, ktory potrebujeme

Zaver:

- ak chces setrit, nepresuval by som sa z Front Door na Load Balancer
- ak chces zjednodusit architekturu a znizit naklady, skor by som zvazil redukciu non-prod edge vrstvy, nie nahradu Front Door Load Balancerom

### Re-evaluacia: Azure Application Gateway

Azure Application Gateway som znova zvazil ako moznu lacnejsiu alternativu. Pre tento projekt ho vsak neodporucam ako cielovy edge komponent.

Co hovori v prospech Application Gateway:

- je to Layer 7 reverse proxy a vie redirecty
- vie host-based a path-based pravidla
- vie rewrite hostu, path aj query stringu
- teoreticky by vedel obsluzit zlozitejsi domenovy model, ak by bol neskor potrebny

Preco ho napriek tomu neodporucam:

- je to regionalna sluzba, nie globalna edge sluzba
- vyzaduje dedicated subnet vo virtual network
- pri reverse proxy scenari pred PaaS backendom prinasa viac prevadzkovej a sietovej rezije
- pre Static Web Apps je to architektonicky tazsie a menej prirodzene riesenie ako Front Door
- oficialne Azure docs vedu Front Door ako natyvne zdokumentovany pattern pred Static Web Apps, vratane `allowedForwardedHosts` a `forwardingGateway.requiredHeaders`

Najdolezitejsi argument je vsak cena:

- Azure Front Door Standard pricing page uvadza zakladny mesacny poplatok `35 USD`
- oficialna Azure pricing dokumentacia pre Application Gateway nepracuje s jednoduchym jednym flat fee, ale s gateway-hours a data processing
- v oficialnom Azure pricing priklade pre DDoS Protection je uvedene, ze standardna cena Application Gateway je `0.31 USD per gateway-hour`
- to je pri 730 hodinach za mesiac priblizne `226 USD/mesiac` este pred dalsim data processing charge

Zaver z porovnania:

- `Application Gateway Standard_v2` nie je pre tento use case lacnejsia nahrada za `Front Door Standard`
- `Application Gateway Basic` sice existuje, ale je stale `preview` a dokumentacia ho popisuje skor pre nizsie naroky a nizsiu SLA; pre verejny showcase production web by som preview SKU nestaval do jadra architektury

Pre tento projekt preto vidim tri realisticke varianty:

1. `SWA Standard only`
   cielovy model pre tento projekt; najlepsie pre jednoduchy produkcny web s default-domain redirectom a locale logikou v aplikacii

2. `SWA + Front Door Standard`
   najlepsie pre zlozitejsi edge routing a pokrocile domenove scenare

3. `SWA + Application Gateway`
   technicky mozne, ale pre tento projekt menej prirodzene, zlozitejsie a pravdepodobne drahsie

Moje odporucanie po re-evaluacii:

- ak je priorita `rozumna cena + SEO-safe kanonicka domena`, zvolil by som `SWA Standard only`
- `Front Door Standard` ma zmysel az ako buduce rozsirenie, nie ako dnesna potreba
- `Application Gateway` by som v tomto projekte nevolil ako kompromis medzi tymito dvoma cielmi

### Bicep vs Terraform

Pre tento projekt odporucam `Bicep`.

Dovody:

- projekt je cisto Azure-focused
- Bicep je prirodzena volba pre Azure resource deployment
- netreba riesit Terraform state backend ako prvu vrstvu komplikacie
- GitHub Actions + Azure OIDC + Bicep su pre tuto velkost projektu velmi cisty setup
- repo bude posobit ako uceleny Azure-native projekt

Terraform by som zvazil iba vtedy, ak:

- firma uz ma Terraform ako standard
- alebo planujes riadit aj ine cloudy a ine platformy mimo Azure

## Dolezite platformove obmedzenia

Pri navrhu treba ratat s tymto:

- Azure Static Web Apps preview prostredia su vhodne na PR review
- preview prostredia nemaju vlastne custom domains
- preview prostredia nie su geograficky distribuovane ako produkcia

Prakticky z toho plynie:

- PR preview je vyborne na obsah a layout kontrolu
- ale nie je to plna nahrada samostatneho testovacieho prostredia, ak chces testovat domeny, redirecty a realne edge spravanie

## Odporucana architektura

### Produkcia

Zdrojova skupina:

- `rg-zenova-web-prod`

Zdroje:

- `swa-zenova-prod` - Azure Static Web Apps Standard
- `dns-zenova-prod` - Azure DNS zony, ak chces mat DNS tiez pod IaC

Role:

- Static Web Apps hostuje samotny web
- `zenova.sk` bude nastavena ako default domain
- dalsie custom domeny budu SWA presmerovane na `zenova.sk`
- jazykova logika bude riesena na webe cez `/` a `/en/`, nie cez domenu

### Test

Zdrojova skupina:

- `rg-zenova-web-test`

Minimalny odporucany variant:

- `swa-zenova-test` - Azure Static Web Apps Standard

Odporucanie:

- testuj aplikaciu na `azurestaticapps.net` test URL
- ak bude neskor potreba edge vrstvy, test prostredie sa da rozsiriti az vtedy

### Preview pre PR

Pouzi natyvne SWA preview prostredia:

- PR preview pre feature a obsahovy review
- `develop` alebo named environment pre stabilnejsi non-prod preview URL

Toto je dobre pre:

- responzivitu
- obsah
- layout
- basic regression test

Toto nie je plna nahrada pre:

- test vlastnych domen
- test canonical host spravania
- test spravania pri default-domain redirecte na produkcii

## Routing a locale model s enterprise edge smerom

Odporucany model pre produkciu:

- `zenova.sk` je default domain
- ostatne custom domeny su cez SWA presmerovane na `zenova.sk`
- slovencina je na `/`
- anglictina je na `/en/`
- browser locale logika sa aplikuje iba na root entry
- manualny jazykovy prepinac musi byt vzdy dostupny

Prakticka app logika:

1. ak uzivatel otvori `/` a ma ulozenu jazykovu preferenciu, pouzit ju
2. ak uzivatel otvori `/` a nema preferenciu:
   - browser locale `sk-*` -> ostat na `/`
   - iny browser locale -> presmerovat na `/en/`
3. ak uzivatel otvori deep link, automaticky ho nepresmerovavat podla browser locale
4. ak uzivatel manualne prepne jazyk, ulozit volbu a respektovat ju pri dalsich navstevach

Dolezita technicka poznamka:

- po SWA default-domain redirecte sa netreba spoliehat na povodny hostname ako na signal pre vyber jazyka
- jazykovy vyber ma preto vychadzat z URL vetvy, browser preferencie a explicitnej volby uzivatela

SEO ochranny ramec:

- indexovatelne URL maju byt `/` a `/en/`
- nie query-param jazyk ako hlavny indexovatelny model
- `hreflang`, canonical a sitemapa musia odkazovat na realne URL vetvy

## Co SWA default-domain model riesi a co uz nie

Azure Static Web Apps vie nastavit default custom domain a presmerovat ostatne custom domeny na nu.

To je dobre pre:

- `www -> apex`
- zjednotenie viacerych domen na jednu cielovu domenu
- kanonicku konsolidaciu domen na `zenova.sk`

To vsak nestaci pre:

- presmerovanie podla zdrojovej domeny na specificky jazykovy prefix `/en/`
- presne host-based pravidla typu `zenovalabs.* -> zenova.sk/en/...`

Preto:

- pre aktualny model je `SWA Standard + enterprise-grade edge` dostacujuce riesenie
- `Front Door` dava zmysel az vtedy, ak by sme neskor chceli zaviesť jemnejsiu host-based jazykovu alebo path-based redirect logiku mimo moznosti SWA modelu

## Front Door navrh

Odporucany smer:

- ak mas dnes Azure Front Door classic, migruj na Front Door Standard alebo Premium
- pre tento projekt je Standard pravdepodobne dostacujuci
- Premium ma zmysel az ked potrebujes WAF-heavy scenare, Private Link alebo pokrocile bezpecnostne funkcie

### Domény

Frontend domains pri buducej edge variante:

- `zenova.sk`
- `www.zenova.sk`
- `zenovalabs.eu`
- `www.zenovalabs.eu` volitelne
- `zenovalabs.cloud`
- `www.zenovalabs.cloud` volitelne

Origin:

- produkcny `swa-zenova-prod`

Pravidla pri buducej edge variante:

- route pre forward na `zenova.sk`
- route alebo rule set pre redirecty na `www`
- route alebo rule set pre jemnejsiu host/path logiku, ak by bola neskor potrebna

### Ochrana originu

Ak pojdes cez Front Door pred SWA, odporucam doplnit aj konfiguraciu na strane SWA:

- povolit pristup len z Front Door
- pouzit `forwardingGateway.requiredHeaders`
- pouzit `allowedForwardedHosts`

To zabrani tomu, aby sa origin pouzival obchadzkou mimo Front Door vrstvy.

## Infrastructure as Code

### Odporucana struktura repozitara

```text
infra/
  main.bicep
  modules/
    resource-group.bicep
    static-web-app.bicep
    dns-zone-placeholder.bicep
  params/
    prod.bicepparam
    test.bicepparam
.github/workflows/
  ci-validation.yml
  preview-pr.yml
  infra-whatif.yml
  deploy-test.yml
  deploy-prod.yml
```

### Bicep rozsah

`main.bicep` by mal orchestrat:

- resource group scoping, ak sa deployuje subscription-level
- Static Web App
- volitelne placeholder DNS zony

V aktualnej implementovanej public foundation:

- Front Door ani Application Gateway sa nedeployuju
- custom domains sa nedeployuju automaticky
- DNS vrstva je len volitelny placeholder modul pre public-safe rozsirenie

### Parametre prostredi

`prod.bicepparam`:

- nazvy produkcnych zdrojov
- production branch
- location pre resource group a SWA
- DNS placeholder vrstva volitelne vypnuta ako bezpecny default

`test.bicepparam`:

- nazvy test zdrojov
- default branch `main`
- location pre resource group a SWA
- DNS placeholder vrstva volitelne vypnuta ako bezpecny default

## CI/CD navrh

### 1. `ci-validation.yml`

Trigger:

- pull request
- push

Kroky:

- `npm ci`
- `npm run build`
- `npm run validate:site`
- `npm run validate:dist`
- `npm run validate:infra`
- `npm run validate:workflows`

Ciel:

- rychlo zastavit rozbity build
- chytit syntakticke chyby skorej nez sa dostanu do Azure

### 2. `preview-pr.yml`

Trigger:

- `pull_request`

Kroky:

- build statickeho webu
- pokus o nasadenie SWA preview environmentu
- ak chyba token, workflow sa korektne preskoci s vysvetlenim

Ciel:

- mat PR preview layer bez toho, aby repo obsahovalo secrets
- zachovat preview story pre Azure Static Web Apps

### 3. `infra-whatif.yml`

Trigger:

- pull request pre infra a docs zmeny
- manualny `workflow_dispatch`

Kroky:

- Bicep lint alebo build
- ak je GitHub Environment `test` nakonfigurovany, Azure login cez OIDC
- `az deployment sub what-if` proti `infra/params/test.bicepparam`

Ciel:

- review infrastrukturalnych zmien pred deployom
- jasne vidiet, co sa vytvori, zmeni alebo zmaze

### 4. `deploy-test.yml`

Trigger:

- push do `main`
- manualny `workflow_dispatch`

Kroky:

- `npm ci`
- `npm run build`
- `npm run validate:site`
- deploy Bicep parametrov pre test
- deploy app do test SWA
- ak chyba environment konfiguracia, workflow sa korektne preskoci

Ciel:

- stabilne test prostredie
- prezentovatelny non-prod deployment

### 5. `deploy-prod.yml`

Trigger:

- manualny `workflow_dispatch`

Kroky:

- GitHub Environment `prod`
- `npm ci`
- `npm run build`
- `npm run validate:site`
- `phase 1`: deploy Bicep parametrov pre prod bez SWA tokenu
- vypis SWA mena, hostname a edge statusu
- `phase 2`: deploy app do prod SWA po doplneni `AZURE_STATIC_WEB_APPS_API_TOKEN`
- ak chyba OIDC environment konfiguracia, workflow sa korektne preskoci
- ak chyba SWA token, workflow dokonci phase 1 a vypise dalsie kroky pre domain onboarding a phase 2

Ciel:

- kontrolovany production release
- auditovatelny deployment path

## GitHub Environments a tajomstva

Odporucany setup:

- GitHub Environment `test`
- GitHub Environment `prod`

Kazde prostredie:

- vlastne `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `AZURE_DEPLOYMENT_LOCATION`
- SWA deployment token az po phase 1 ako `AZURE_STATIC_WEB_APPS_API_TOKEN`

Odporucanie:

- nepouzivat dlhodobe deployment tokeny ako hlavny model pre infra deploy
- pre Azure login pouzit OIDC a federated credentials
- SWA deployment token moze ostat ako prechodne riesenie pre app deploy, ale dlhodobo je lepsie smerovat k menej manualnemu setupu
- pre `prod` aj `test` ma byt token potrebny az v phase 2, nie pri infra bootstrape

### OIDC a federated credentials

Pre `test` aj `prod` treba mimo repozitara vytvorit samostatny federated credential v Microsoft Entra ID.

`test` credential:

- repository: `zenovalabs/zenova-web`
- environment: `test`
- subject: `repo:zenovalabs/zenova-web:environment:test`
- issuer: `https://token.actions.githubusercontent.com`
- audience: `api://AzureADTokenExchange`

`prod` credential:

- repository: `zenovalabs/zenova-web`
- environment: `prod`
- subject: `repo:zenovalabs/zenova-web:environment:prod`
- issuer: `https://token.actions.githubusercontent.com`
- audience: `api://AzureADTokenExchange`

Prakticky dopad:

- credential pre `test` nepokryje `prod`
- credential pre `prod` nepokryje `test`
- ak subject nesedi presne, Azure login zlyha este pred phase 1 bootstrapom

### RBAC mimo Bicep

Service principal pouzity v GitHub Actions musi mat priradeny pristup na Azure scope, proti ktoremu sa deployment spusta.

Minimalny operacny model:

- subscription-level alebo environment-specific scope
- dostatocna rola na vytvorenie resource group a Static Web App

Bez tohto kroku:

- OIDC login sa moze podarit
- ale deployment nenajde subscription alebo nebude mat prava na zapis

### SWA token bootstrap mimo workflowov

`AZURE_STATIC_WEB_APPS_API_TOKEN` nevznika z Bicep deploymentu automaticky v GitHube.

Spravny flow:

1. spustit phase 1 bootstrap
2. pockat, kym SWA resource realne existuje
3. ziskat deployment token zo SWA:
   - cez Azure Portal
   - alebo cez `az staticwebapp secrets list`
4. ulozit token do GitHub Environment secretu
5. rerunut workflow pre phase 2

Toto plati rovnako pre `test` aj `prod`.

### Produkcne domeny a redirecty mimo Bicep

Aktualna public foundation v repozitari neriesi automaticky:

- pripojenie custom domains do SWA
- DNS validaciu domen
- nastavenie default domain
- redirect ostatnych domen na default domain

Pre produkciu treba po phase 1 a phase 2 spravit este:

1. pripojit `zenova.sk` a `zenovalabs.*` do produkcnej SWA
2. nastavit `zenova.sk` ako default domain
3. nechat SWA presmerovat ostatne custom domains na `zenova.sk`
4. overit canonical, sitemap, `hreflang` a hlavne URL po produkcnom switchi

## Build prostredie

Ak chces repo prezentovat ako kompletny Azure projekt, odporucam rozsirit aj dev prostredie:

- Node.js 20
- Azure CLI
- Bicep CLI
- Static Web Apps CLI
- `jq`

Prakticky ciel:

- lokalny alebo devcontainer onboarding bez manualneho doinstalovavania
- moznost pustit `npm run build`, Bicep validaciu a smoke testy v jednom prostredi

## Odporucany rollout plan

1. upratat a validovat `staticwebapp.config.json`
2. rozhodnut sa, ci aktualny Front Door je classic alebo Standard/Premium
3. ak je classic, naplanovat migraciu na Standard/Premium
4. pridat `infra/` vrstvu v Bicep
5. doplnit `preview-pr.yml`, `infra-whatif.yml`, `deploy-test.yml` a `deploy-prod.yml`
6. nakonfigurovat GitHub Environments `test` a `prod`
7. zapojit OIDC pre Azure login a SWA deployment tokeny mimo repo
8. pre `test` a `prod` spustit phase 1 bootstrap a ziskat SWA deployment tokeny
9. zapojit SWA default domain a domeny pre produkciu
10. doplnit smoke testy URL, buildu, default-domain redirectu a locale spravania

## Prakticke odporucanie k nakladom

Ak chces drzat naklady pod kontrolou, isiel by som tymto poradi:

1. pouzit `SWA Standard + enterprise-grade edge` ako cielovy model
2. test prostredie bootstrapovat staged flowom cez `deploy-test.yml`
3. PR preview pouzit natyvne cez SWA po doplneni tokenu v phase 2
4. samostatny Front Door stack pridat az neskor, len ak ho realne potrebujes

Toto je podla mna najrozumnejsi kompromis medzi:

- nakladmi
- technickou spravnostou
- SEO cielmi
- prezentovatelnostou projektu

## Finalne odporucanie

Pre tento projekt by som navrhol tuto cielovu kombinaciu:

- Azure Static Web Apps Standard ako hosting
- SWA default domain pre kanonicku domenovu konsolidaciu
- locale routing cez `/` a `/en/` na urovni aplikacie
- Bicep ako IaC
- GitHub Actions s OIDC
- samostatne `test` a `prod` prostredie
- PR preview cez SWA preview environments

Azure Load Balancer by som sem nedaval, pretoze funkcne neriesi problem, ktory potrebujes vyriesit.
Azure Application Gateway by som sem nedaval ako "lacnejsi Front Door", pretoze pre tento use case vychadza architektonicky tazsie a podla oficialnych pricing signalov skor drahsie.

## Zdroje

- Microsoft Learn: Application Gateway je regionalny web traffic load balancer a vyzaduje subnet vo virtual network: https://learn.microsoft.com/en-us/azure/application-gateway/overview-v2
- Microsoft Learn: Azure Load Balancer je Layer 4, Front Door je Layer 7 a riesi URL/path-based routing: https://learn.microsoft.com/en-us/azure/networking/load-balancer-content-delivery/load-balancing-content-delivery-overview
- Microsoft Learn: Front Door rule sets a redirect capabilities: https://learn.microsoft.com/en-us/azure/frontdoor/front-door-rules-engine
- Microsoft Learn: Front Door URL redirect vie menit hostname, path a query string: https://learn.microsoft.com/en-us/azure/frontdoor/front-door-url-redirect
- Microsoft Learn: Front Door server variables pre dynamic path handling: https://learn.microsoft.com/en-us/azure/frontdoor/rule-set-server-variables
- Microsoft Learn: SWA + Front Door integracia a `allowedForwardedHosts`: https://learn.microsoft.com/en-us/azure/static-web-apps/front-door-manual
- Microsoft Learn: SWA default custom domain redirect: https://learn.microsoft.com/en-us/azure/static-web-apps/custom-domain-default
- Microsoft Learn: SWA preview environments a ich limity: https://learn.microsoft.com/en-us/azure/static-web-apps/preview-environments
- Microsoft Learn: Deploy Azure Static Web Apps with Bicep: https://learn.microsoft.com/en-us/azure/static-web-apps/publish-bicep
- Microsoft Learn: Deploy Bicep files by using GitHub Actions: https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/deploy-github-actions
- Microsoft Learn: Azure Front Door classic retirement FAQ, ak dnes pouzivas classic: https://learn.microsoft.com/en-us/azure/frontdoor/classic-retirement-faq
- Azure Pricing: Front Door pricing: https://azure.microsoft.com/en-us/pricing/details/frontdoor/
- Azure Pricing: Application Gateway pricing: https://azure.microsoft.com/en-us/pricing/details/application-gateway/
- Azure Pricing: DDoS Protection pricing page with official Application Gateway pricing examples: https://azure.microsoft.com/en-us/pricing/details/ddos-protection/
