import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

const repoRoot = process.cwd();
const workflowDir = path.join(repoRoot, ".github", "workflows");
const requiredWorkflowFiles = [
  "ci-validation.yml",
  "infra-whatif.yml",
  "deploy-test.yml",
  "deploy-prod.yml",
  "preview-pr.yml"
];
const disallowedWorkflowPatterns = [/^azure-static-web-apps-.*\.ya?ml$/i];
const errors = [];

function hasTrigger(data, triggerName) {
  return Boolean(data?.on && Object.prototype.hasOwnProperty.call(data.on, triggerName));
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await pathExists(workflowDir))) {
    errors.push("Missing workflow directory: .github/workflows");
  } else {
    const entries = await readdir(workflowDir, { withFileTypes: true });
    const workflowFiles = entries
      .filter((entry) => entry.isFile() && (entry.name.endsWith(".yml") || entry.name.endsWith(".yaml")))
      .map((entry) => entry.name)
      .sort();

    for (const requiredFile of requiredWorkflowFiles) {
      if (!workflowFiles.includes(requiredFile)) {
        errors.push(`Missing required workflow file: .github/workflows/${requiredFile}`);
      }
    }

    for (const workflowFile of workflowFiles) {
      if (disallowedWorkflowPatterns.some((pattern) => pattern.test(workflowFile))) {
        errors.push(`${workflowFile}: remove Azure-generated legacy workflow and keep only the curated workflow set`);
      }
    }

    for (const workflowFile of workflowFiles) {
      const fullPath = path.join(workflowDir, workflowFile);
      const raw = await readFile(fullPath, "utf8");
      const document = YAML.parseDocument(raw);

      if (document.errors.length > 0) {
        for (const error of document.errors) {
          errors.push(`${workflowFile}: YAML parse error: ${error.message}`);
        }
        continue;
      }

      const data = document.toJS();

      if (!data || typeof data !== "object") {
        errors.push(`${workflowFile}: workflow content is empty or not a mapping`);
        continue;
      }

      if (!data.name || typeof data.name !== "string") {
        errors.push(`${workflowFile}: missing top-level 'name'`);
      }

      if (!Object.prototype.hasOwnProperty.call(data, "on")) {
        errors.push(`${workflowFile}: missing top-level 'on' trigger definition`);
      }

      if (!data.permissions || typeof data.permissions !== "object") {
        errors.push(`${workflowFile}: missing top-level 'permissions' definition`);
      }

      if (data.on && Object.prototype.hasOwnProperty.call(data.on, "pull_request_target")) {
        errors.push(`${workflowFile}: pull_request_target is not allowed in this public repository`);
      }

      if (!data.jobs || typeof data.jobs !== "object" || Object.keys(data.jobs).length === 0) {
        errors.push(`${workflowFile}: missing top-level 'jobs' definition`);
        continue;
      }

      for (const [jobName, job] of Object.entries(data.jobs)) {
        if (!job || typeof job !== "object") {
          errors.push(`${workflowFile}: job '${jobName}' must be a mapping`);
          continue;
        }

        if (!job["runs-on"]) {
          errors.push(`${workflowFile}: job '${jobName}' is missing 'runs-on'`);
        }
      }

      if (requiredWorkflowFiles.includes(workflowFile)) {
        if (!data.concurrency || typeof data.concurrency !== "object") {
          errors.push(`${workflowFile}: missing top-level 'concurrency' guard`);
        }
      }

      if (workflowFile === "ci-validation.yml") {
        if (!hasTrigger(data, "pull_request") || !hasTrigger(data, "push") || !hasTrigger(data, "workflow_dispatch")) {
          errors.push("ci-validation.yml: expected pull_request, push, and workflow_dispatch triggers");
        }

        const pushBranches = data.on?.push?.branches;
        if (!Array.isArray(pushBranches) || !pushBranches.includes("main")) {
          errors.push("ci-validation.yml: push trigger should be limited to main");
        }
      }

      if (workflowFile === "deploy-test.yml") {
        if (!hasTrigger(data, "push") || !hasTrigger(data, "workflow_dispatch")) {
          errors.push("deploy-test.yml: expected push and workflow_dispatch triggers");
        }

        const pushBranches = data.on?.push?.branches;
        if (!Array.isArray(pushBranches) || !pushBranches.includes("main")) {
          errors.push("deploy-test.yml: push trigger should be limited to main");
        }

        if (data.jobs?.["deploy-test"]?.environment !== "test") {
          errors.push("deploy-test.yml: deploy-test job should target environment 'test'");
        }
      }

      if (workflowFile === "deploy-prod.yml") {
        if (!hasTrigger(data, "workflow_dispatch")) {
          errors.push("deploy-prod.yml: expected workflow_dispatch trigger");
        }

        if (hasTrigger(data, "push")) {
          errors.push("deploy-prod.yml: push trigger is not allowed for production deploys");
        }

        if (data.jobs?.["deploy-production"]?.environment !== "prod") {
          errors.push("deploy-prod.yml: deploy-production job should target environment 'prod'");
        }
      }

      if (workflowFile === "infra-whatif.yml") {
        if (!hasTrigger(data, "pull_request") || !hasTrigger(data, "workflow_dispatch")) {
          errors.push("infra-whatif.yml: expected pull_request and workflow_dispatch triggers");
        }

        if (!data.jobs?.["validate-infrastructure"] || !data.jobs?.["what-if-test"]) {
          errors.push("infra-whatif.yml: expected validate-infrastructure and what-if-test jobs");
        }
      }

      if (workflowFile === "preview-pr.yml") {
        if (!hasTrigger(data, "pull_request")) {
          errors.push("preview-pr.yml: expected pull_request trigger");
        }

        if (!data.jobs?.preview || !data.jobs?.["close-preview"]) {
          errors.push("preview-pr.yml: expected preview and close-preview jobs");
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error("Workflow validation failed:");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("Workflow validation passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
