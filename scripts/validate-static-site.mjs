import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const srcDir = path.join(repoRoot, "src");
const distDir = path.join(repoRoot, "dist");
const siteHost = "https://www.zenova.sk";
const localizedRoutePairs = new Map([
  ["/", "/en/"],
  ["/sluzby/", "/en/services/"],
  ["/o-nas/", "/en/about/"],
  ["/kontakt/", "/en/contact/"]
]);

const requiredDistFiles = [
  "index.html",
  path.join("en", "index.html"),
  "robots.txt",
  "sitemap.xml",
  "staticwebapp.config.json"
];

const errors = [];
const warnings = [];

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectHtmlFiles(currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        return collectHtmlFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith(".html")) {
        return [fullPath];
      }
      return [];
    })
  );

  return files.flat();
}

async function collectPublicFiles(currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        return collectPublicFiles(fullPath);
      }
      if (entry.isFile()) {
        return [fullPath];
      }
      return [];
    })
  );

  return files.flat();
}

function routeFromHtmlFile(filePath) {
  const relative = path.relative(srcDir, filePath);
  if (relative === "index.html") {
    return "/";
  }

  if (relative.endsWith(path.join("index.html"))) {
    const route = relative.slice(0, -("index.html".length)).replace(/\\/g, "/");
    return `/${route}`;
  }

  return `/${relative.replace(/\\/g, "/")}`;
}

function expectMatch(contents, pattern, message) {
  if (!pattern.test(contents)) {
    errors.push(message);
  }
}

function normalizePublicPath(rawPath) {
  const withoutHash = rawPath.split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];
  return withoutQuery || "/";
}

function normalizeRoute(route) {
  if (route === "/") {
    return route;
  }

  return route.endsWith("/") ? route : `${route}/`;
}

function mapLocalizedCounterpart(route) {
  const normalizedRoute = normalizeRoute(route);

  if (localizedRoutePairs.has(normalizedRoute)) {
    return localizedRoutePairs.get(normalizedRoute);
  }

  for (const [skRoute, enRoute] of localizedRoutePairs.entries()) {
    if (enRoute === normalizedRoute) {
      return skRoute;
    }
  }

  if (normalizedRoute.startsWith("/en/")) {
    return normalizedRoute.replace(/^\/en\//, "/");
  }

  return `/en${normalizedRoute}`;
}

function expectedLocalePair(route) {
  const normalizedRoute = normalizeRoute(route);
  const counterpartRoute = mapLocalizedCounterpart(normalizedRoute);

  if (normalizedRoute.startsWith("/en/")) {
    return {
      locale: "en",
      canonical: `${siteHost}${normalizedRoute}`,
      skHref: `${siteHost}${counterpartRoute}`,
      enHref: `${siteHost}${normalizedRoute}`,
      langToggleHref: counterpartRoute,
      langToggleTargetLang: "sk",
      counterpartRoute
    };
  }

  return {
    locale: "sk",
    canonical: `${siteHost}${normalizedRoute}`,
    skHref: `${siteHost}${normalizedRoute}`,
    enHref: `${siteHost}${counterpartRoute}`,
    langToggleHref: counterpartRoute,
    langToggleTargetLang: "en",
    counterpartRoute
  };
}

function extractTagAttribute(contents, tagPattern, attributeName) {
  const match = contents.match(tagPattern);
  if (!match) {
    return null;
  }

  const attributePattern = new RegExp(`${attributeName}="([^"]+)"`, "i");
  const attributeMatch = match[0].match(attributePattern);
  return attributeMatch ? attributeMatch[1] : null;
}

function validateLocaleMetadata(relative, route, contents, routeSet) {
  const expected = expectedLocalePair(route);
  const htmlLang = extractTagAttribute(contents, /<html\s+[^>]*lang="[^"]+"[^>]*>/i, "lang");
  const canonicalHref = extractTagAttribute(contents, /<link\s+[^>]*rel="canonical"[^>]*>/i, "href");
  const skHref = extractTagAttribute(contents, /<link\s+[^>]*rel="alternate"[^>]*hreflang="sk"[^>]*>/i, "href");
  const enHref = extractTagAttribute(contents, /<link\s+[^>]*rel="alternate"[^>]*hreflang="en"[^>]*>/i, "href");
  const langToggleHref = extractTagAttribute(contents, /<a\s+[^>]*id="lang-toggle"[^>]*>/i, "href");
  const langToggleTargetLang = extractTagAttribute(contents, /<a\s+[^>]*id="lang-toggle"[^>]*>/i, "data-target-lang");

  if (htmlLang !== expected.locale) {
    errors.push(`${relative}: expected html lang="${expected.locale}" for route ${route}`);
  }

  if (canonicalHref !== expected.canonical) {
    errors.push(`${relative}: canonical should be ${expected.canonical}`);
  }

  if (skHref !== expected.skHref) {
    errors.push(`${relative}: hreflang=sk should point to ${expected.skHref}`);
  }

  if (enHref !== expected.enHref) {
    errors.push(`${relative}: hreflang=en should point to ${expected.enHref}`);
  }

  if (!routeSet.has(expected.counterpartRoute)) {
    errors.push(`${relative}: missing bilingual counterpart ${expected.counterpartRoute}`);
  }

  if (langToggleHref !== expected.langToggleHref) {
    errors.push(`${relative}: language toggle should point to ${expected.langToggleHref}`);
  }

  if (langToggleTargetLang !== expected.langToggleTargetLang) {
    errors.push(`${relative}: language toggle should target ${expected.langToggleTargetLang}`);
  }
}

function resolveRelativePath(route, referencePath) {
  const currentDirectory = route.endsWith("/") ? route : `${route}/`;
  const resolved = path.posix.normalize(path.posix.join(currentDirectory, referencePath));
  return resolved.startsWith("/") ? resolved : `/${resolved}`;
}

function extractInternalReferences(contents) {
  return [...contents.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
}

function isIgnoredReference(reference) {
  return (
    reference.startsWith("http://") ||
    reference.startsWith("https://") ||
    reference.startsWith("mailto:") ||
    reference.startsWith("tel:") ||
    reference.startsWith("#") ||
    reference.startsWith("data:") ||
    reference.startsWith("javascript:")
  );
}

function validateInternalReferences(relative, route, contents, routeSet, publicPathSet) {
  for (const reference of extractInternalReferences(contents)) {
    if (isIgnoredReference(reference)) {
      continue;
    }

    const normalized = reference.startsWith("/")
      ? normalizeRoute(normalizePublicPath(reference))
      : normalizeRoute(normalizePublicPath(resolveRelativePath(route, reference)));

    const assetLikePath = reference.startsWith("/")
      ? normalizePublicPath(reference)
      : normalizePublicPath(resolveRelativePath(route, reference));

    const routeExists = routeSet.has(normalized) || routeSet.has(normalized.replace(/\/$/, "")) || routeSet.has(assetLikePath);
    const publicFileExists = publicPathSet.has(assetLikePath);

    if (!routeExists && !publicFileExists) {
      errors.push(`${relative}: broken internal reference ${reference}`);
    }
  }
}

async function validateUseCaseCrossLinking(htmlFiles) {
  const homeSkPath = path.join(srcDir, "index.html");
  const homeEnPath = path.join(srcDir, "en", "index.html");
  const listingSkPath = path.join(srcDir, "use-cases", "index.html");
  const listingEnPath = path.join(srcDir, "en", "use-cases", "index.html");

  const [homeSk, homeEn, listingSk, listingEn] = await Promise.all([
    readFile(homeSkPath, "utf8"),
    readFile(homeEnPath, "utf8"),
    readFile(listingSkPath, "utf8"),
    readFile(listingEnPath, "utf8")
  ]);

  const useCaseRoutes = htmlFiles
    .map((filePath) => normalizeRoute(routeFromHtmlFile(filePath)))
    .filter((route) => route.startsWith("/use-cases/") && route !== "/use-cases/");

  const useCaseRoutesEn = htmlFiles
    .map((filePath) => normalizeRoute(routeFromHtmlFile(filePath)))
    .filter((route) => route.startsWith("/en/use-cases/") && route !== "/en/use-cases/");

  for (const route of useCaseRoutes) {
    if (!homeSk.includes(`href="${route}"`)) {
      errors.push(`src/index.html: missing homepage link to use case ${route}`);
    }

    if (!listingSk.includes(`href="${route}"`)) {
      errors.push(`src/use-cases/index.html: missing listing link to use case ${route}`);
    }
  }

  for (const route of useCaseRoutesEn) {
    if (!homeEn.includes(`href="${route}"`)) {
      errors.push(`src/en/index.html: missing homepage link to use case ${route}`);
    }

    if (!listingEn.includes(`href="${route}"`)) {
      errors.push(`src/en/use-cases/index.html: missing listing link to use case ${route}`);
    }
  }
}

async function validateHtmlMetadata() {
  const htmlFiles = await collectHtmlFiles(srcDir);
  const routeSet = new Set(htmlFiles.map((filePath) => normalizeRoute(routeFromHtmlFile(filePath))));
  const publicFiles = await collectPublicFiles(srcDir);
  const publicPathSet = new Set(
    publicFiles.map((filePath) => `/${path.relative(srcDir, filePath).replace(/\\/g, "/")}`)
  );

  for (const filePath of htmlFiles) {
    const relative = path.relative(repoRoot, filePath);
    const contents = await readFile(filePath, "utf8");
    const route = normalizeRoute(routeFromHtmlFile(filePath));

    expectMatch(contents, /<html\s+lang="[^"]+"/i, `${relative}: missing <html lang="...">`);
    expectMatch(contents, /<title>[^<]+<\/title>/i, `${relative}: missing <title>`);
    expectMatch(contents, /<meta\s+name="description"\s+content="[^"]+"/i, `${relative}: missing meta description`);
    expectMatch(contents, /<link\s+rel="canonical"\s+href="https:\/\/www\.zenova\.sk\/[^"]*"\s*\/?>/i, `${relative}: missing canonical link`);
    expectMatch(contents, /<link\s+rel="alternate"\s+hreflang="sk"\s+href="https:\/\/www\.zenova\.sk\/[^"]*"\s*\/?>/i, `${relative}: missing hreflang=sk link`);
    expectMatch(contents, /<link\s+rel="alternate"\s+hreflang="en"\s+href="https:\/\/www\.zenova\.sk\/[^"]*"\s*\/?>/i, `${relative}: missing hreflang=en link`);
    expectMatch(contents, /<link\s+rel="stylesheet"\s+href="\/styles\.css(?:\?v=[^"]+)?"\s*\/?>/i, `${relative}: missing shared stylesheet link`);
    expectMatch(contents, /<script\s+src="\/script\.js(?:\?v=[^"]+)?"\s+defer><\/script>/i, `${relative}: missing shared script include`);

    validateLocaleMetadata(relative, route, contents, routeSet);
    validateInternalReferences(relative, route, contents, routeSet, publicPathSet);
  }

  return htmlFiles;
}

async function validateStaticWebAppConfig() {
  const configPath = path.join(srcDir, "staticwebapp.config.json");
  const raw = await readFile(configPath, "utf8");
  let config;

  try {
    config = JSON.parse(raw);
  } catch (error) {
    errors.push(`src/staticwebapp.config.json: invalid JSON (${error.message})`);
    return;
  }

  if (!Array.isArray(config.routes) || config.routes.length === 0) {
    errors.push("src/staticwebapp.config.json: routes must be a non-empty array");
  }

  if (!config.navigationFallback || config.navigationFallback.rewrite !== "/index.html") {
    errors.push("src/staticwebapp.config.json: navigationFallback.rewrite must be /index.html");
  }
}

async function validateDistArtifacts() {
  for (const relative of requiredDistFiles) {
    const filePath = path.join(distDir, relative);
    if (!(await exists(filePath))) {
      errors.push(`dist/${relative.replace(/\\/g, "/")}: missing build artifact`);
    }
  }
}

async function validateRobotsAndSitemap(htmlFiles) {
  const robotsPath = path.join(srcDir, "robots.txt");
  const sitemapPath = path.join(srcDir, "sitemap.xml");
  const robots = await readFile(robotsPath, "utf8");
  const sitemap = await readFile(sitemapPath, "utf8");

  if (!robots.includes("Sitemap: https://www.zenova.sk/sitemap.xml")) {
    errors.push("src/robots.txt: missing sitemap declaration for https://www.zenova.sk/sitemap.xml");
  }

  const sitemapLocs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const uniqueSitemapLocs = new Set(sitemapLocs);

  if (uniqueSitemapLocs.size !== sitemapLocs.length) {
    errors.push("src/sitemap.xml: contains duplicate <loc> entries");
  }

  for (const htmlFile of htmlFiles) {
    const route = routeFromHtmlFile(htmlFile);
    const expectedLoc = `${siteHost}${route}`;
    if (!sitemapLocs.includes(expectedLoc)) {
      errors.push(`src/sitemap.xml: missing route ${expectedLoc}`);
    }
  }

  for (const loc of sitemapLocs) {
    if (!loc.startsWith(siteHost)) {
      errors.push(`src/sitemap.xml: unexpected non-canonical host in ${loc}`);
    }
  }
}

async function main() {
  await validateStaticWebAppConfig();
  const htmlFiles = await validateHtmlMetadata();
  await validateUseCaseCrossLinking(htmlFiles);
  await validateDistArtifacts();
  await validateRobotsAndSitemap(htmlFiles);

  if (errors.length > 0) {
    console.error("Static site validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn("Static site validation warnings:");
    for (const warning of warnings) {
      console.warn(`- ${warning}`);
    }
  }

  console.log("Static site validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
