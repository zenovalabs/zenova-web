import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();
const distDir = path.join(repoRoot, "dist");
const errors = [];

async function collectFiles(currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        return collectFiles(fullPath);
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
  const relative = path.relative(distDir, filePath);
  if (relative === "index.html") {
    return "/";
  }

  if (relative.endsWith(path.join("index.html"))) {
    const route = relative.slice(0, -("index.html".length)).replace(/\\/g, "/");
    return `/${route}`;
  }

  return `/${relative.replace(/\\/g, "/")}`;
}

function normalizePublicPath(rawPath) {
  const withoutHash = rawPath.split("#")[0];
  const withoutQuery = withoutHash.split("?")[0];
  return withoutHash ? (withoutQuery || "/") : "/";
}

function normalizeRoute(route) {
  if (route === "/") {
    return route;
  }

  return route.endsWith("/") ? route : `${route}/`;
}

function resolveRelativePath(route, referencePath) {
  const currentDirectory = route.endsWith("/") ? route : `${route}/`;
  const resolved = path.posix.normalize(path.posix.join(currentDirectory, referencePath));
  return resolved.startsWith("/") ? resolved : `/${resolved}`;
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

async function main() {
  const allFiles = await collectFiles(distDir);
  const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));
  const routeSet = new Set(htmlFiles.map((file) => normalizeRoute(routeFromHtmlFile(file))));
  const publicFileSet = new Set(
    allFiles.map((file) => `/${path.relative(distDir, file).replace(/\\/g, "/")}`)
  );

  for (const filePath of htmlFiles) {
    const relative = path.relative(repoRoot, filePath);
    const route = normalizeRoute(routeFromHtmlFile(filePath));
    const contents = await readFile(filePath, "utf8");
    const references = [...contents.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

    for (const reference of references) {
      if (isIgnoredReference(reference)) {
        continue;
      }

      const normalizedReference = reference.startsWith("/")
        ? normalizePublicPath(reference)
        : normalizePublicPath(resolveRelativePath(route, reference));
      const normalizedRouteReference = normalizeRoute(normalizedReference);

      const routeExists = routeSet.has(normalizedRouteReference);
      const fileExists = publicFileSet.has(normalizedReference);

      if (!routeExists && !fileExists) {
        errors.push(`${relative}: built output contains broken reference ${reference}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error("Built output link validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Built output link validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
