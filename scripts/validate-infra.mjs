import { readdir, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const repoRoot = process.cwd();
const requiredPaths = [
  "infra/README.md",
  "infra/main.bicep",
  "infra/modules",
  "infra/params",
  "docs/azure-infra-cicd-plan.md",
  "docs/azure-iac-decision.md",
  "docs/azure-environments-delivery-model.md"
];

const errors = [];
let azBicepPrepared = false;

async function pathExists(targetPath) {
  try {
    await stat(path.join(repoRoot, targetPath));
    return true;
  } catch {
    return false;
  }
}

async function collectInfraBicepFiles(currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "baseline") {
          return [];
        }
        return collectInfraBicepFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".bicep")) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

async function collectInfraParamFiles(currentDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === "baseline") {
          return [];
        }
        return collectInfraParamFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".bicepparam")) {
        return [fullPath];
      }

      return [];
    })
  );

  return files.flat();
}

function commandAvailable(commandName) {
  const result = spawnSync("bash", ["-lc", `command -v ${commandName}`], { encoding: "utf8" });
  return result.status === 0;
}

function ensureAzBicepInstalled() {
  if (azBicepPrepared) {
    return true;
  }

  if (!commandAvailable("az")) {
    return false;
  }

  const install = spawnSync("az", ["bicep", "install"], {
    cwd: repoRoot,
    encoding: "utf8"
  });

  if (install.status !== 0) {
    errors.push("Azure CLI is available but failed to install the Bicep CLI for validation.");
    return false;
  }

  azBicepPrepared = true;
  return true;
}

function validateBicepFile(filePath) {
  const relative = path.relative(repoRoot, filePath);

  if (ensureAzBicepInstalled()) {
    const result = spawnSync("az", ["bicep", "build", "--file", filePath, "--stdout"], {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 60_000
    });

    if (result.status !== 0) {
      errors.push(`${relative}: az bicep build failed`);
    }
    return;
  }

  if (commandAvailable("bicep")) {
    const result = spawnSync("bicep", ["build", "--file", filePath, "--stdout"], {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 60_000
    });

    if (result.status !== 0) {
      errors.push(`${relative}: Bicep build failed`);
    }
    return;
  }

  errors.push(`${relative}: found public Bicep file but neither 'az' nor 'bicep' CLI is available for validation`);
}

function validateBicepParamFile(filePath) {
  const relative = path.relative(repoRoot, filePath);

  if (ensureAzBicepInstalled()) {
    const outputPath = path.join("/tmp", `zenova-${process.pid}-${path.basename(filePath)}.json`);
    const result = spawnSync("az", ["bicep", "build-params", "--file", filePath, "--outfile", outputPath], {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 60_000
    });

    if (result.status !== 0) {
      errors.push(`${relative}: az bicep build-params failed`);
    }
    return;
  }

  errors.push(`${relative}: found public Bicep file but 'bicep' CLI is not available for validation`);
}

async function main() {
  for (const targetPath of requiredPaths) {
    if (!(await pathExists(targetPath))) {
      errors.push(`Missing required infra path: ${targetPath}`);
    }
  }

  const infraRoot = path.join(repoRoot, "infra");
  const bicepFiles = await collectInfraBicepFiles(infraRoot);
  const bicepParamFiles = await collectInfraParamFiles(infraRoot);

  for (const filePath of bicepFiles) {
    validateBicepFile(filePath);
  }

  for (const filePath of bicepParamFiles) {
    validateBicepParamFile(filePath);
  }

  if (errors.length > 0) {
    console.error("Infra validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  if (bicepFiles.length === 0 && bicepParamFiles.length === 0) {
    console.log("Infra validation passed. No public Bicep files found yet.");
    return;
  }

  console.log("Infra validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
