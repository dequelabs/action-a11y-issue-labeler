import * as core from '@actions/core';
import { context, getOctokit } from "@actions/github";
import a11yLabels from './labels'
import * as yaml from 'js-yaml';
import assert from 'assert';

async function run() {
  // Configuration parameters
  const token = getRequiredInput('repo-token');
  const includeTitle = parseInt(getRequiredInput('include-title'));
  const metricsEnabled: boolean = await getMeticsEnabled(token);
  if (!metricsEnabled) {
    console.log('Metrics are not enabled, exiting.')
    return;
  }

  const issue_number = getIssueOrPullRequestNumber();
  if (issue_number === undefined) {
    console.log('Could not get issue or pull request number from context, exiting');
    return;
  }

  const issue_body = getIssueOrPullRequestBody();
  if (issue_body === undefined) {
    console.log('Could not get issue or pull request body from context, exiting');
    return;
  }

  const issue_title = getIssueOrPullRequestTitle();
  if (issue_title === undefined) {
    console.log('Could not get issue or pull request title from context, exiting');
    return;
  }

  const LABELS = {
    A11Y: getRequiredInput('label-a11y'),
    BLOCKER: getRequiredInput('label-blocker'),
    CRITICAL: getRequiredInput('label-critical'),
    SERIOUS: getRequiredInput('label-serious'),
    MODERATE: getRequiredInput('label-moderate'),
    MINOR: getRequiredInput('label-minor'),
    CUSTOMER: getRequiredInput('label-customer'),
    PRODUCTION: getRequiredInput('label-production'),
    VPAT: getRequiredInput('label-vpat')
  };

  const hasA11yLabel = issueOrPullRequestHasLabel(LABELS.A11Y);
  const addLabel: string[] = []
  const removeLabelItems: string[] = []

  if (hasA11yLabel) {
    console.log('Accessibility issue. Continue.');

  } else {
    if (issue_title.includes('[A11Y]')) {
      console.log('Accessibility issue, but missing label. Adding label.');
      addLabel.push(LABELS.A11Y);

    } else {
      console.log('Not an accessibility issue. Exiting.');
      return;
    }
  }

  let issueContent = ""
  if (includeTitle === 1) {
    issueContent += `${issue_title}\n\n`
  }
  issueContent += issue_body
  
  const currentLabels = getIssueOrPullRequestLabels()?.flatMap(({name: n}) => (n))
  console.log(`Current labels: ${currentLabels}`)

  a11yLabels.forEach(({name: name}) => {
    if (checkLabel(issueContent, `\\[x\\] ${name.replace('WCAG ', '')} `)) {
      addLabel.push(name)
    } else if (hasLabel(currentLabels, name)) {
      removeLabelItems.push(name)
    }
  }
  );

  if(checkLabel(issueContent, `\\[x\\] Blocker`)) {
    addLabel.push(LABELS.BLOCKER)
  } else if (hasLabel(currentLabels, LABELS.BLOCKER)) {
    removeLabelItems.push(LABELS.BLOCKER)
  }

  if(checkLabel(issueContent, `\\[x\\] Critical`)) {
    addLabel.push(LABELS.CRITICAL)
  } else if (hasLabel(currentLabels, LABELS.CRITICAL)) {
    removeLabelItems.push(LABELS.CRITICAL)
  }

  if(checkLabel(issueContent, `\\[x\\] Serious`)) {
    addLabel.push(LABELS.SERIOUS)
  } else if (hasLabel(currentLabels, LABELS.SERIOUS)) {
    removeLabelItems.push(LABELS.SERIOUS)
  }
  
  if(checkLabel(issueContent, `\\[x\\] Moderate`)) {
    addLabel.push(LABELS.MODERATE)
  } else if (hasLabel(currentLabels, LABELS.MODERATE)) {
    removeLabelItems.push(LABELS.MODERATE)
  }

  if(checkLabel(issueContent, `\\[x\\] Minor`)) {
    addLabel.push(LABELS.MINOR)
  } else if (hasLabel(currentLabels, LABELS.MINOR)) {
    removeLabelItems.push(LABELS.MINOR)
  }

  if(checkLabel(issueContent, `\\[x\\] Discovered by Customer`)) {
    addLabel.push(LABELS.MINOR)
  } else if (hasLabel(currentLabels, LABELS.MINOR)) {
    removeLabelItems.push(LABELS.MINOR)
  }

  if(checkLabel(issueContent, `\\[x\\] Exists in Production`)) {
    addLabel.push(LABELS.PRODUCTION)
  } else if (hasLabel(currentLabels, LABELS.PRODUCTION)) {
    removeLabelItems.push(LABELS.PRODUCTION)
  }

  if(checkLabel(issueContent, `\\[x\\] Discovered during VPAT`)) {
    addLabel.push(LABELS.VPAT)
  } else if (hasLabel(currentLabels, LABELS.VPAT)) {
    removeLabelItems.push(LABELS.VPAT)
  }

  removeLabelItems.forEach(function (label) {
    console.log(`Removing label ${label} from issue #${issue_number}`)
    removeLabel(token, issue_number, label)
  });

  if (addLabel.length > 0) {
    console.log(`Adding labels ${addLabel.toString()} to issue #${issue_number}`)
    addLabels(token, issue_number, addLabel)
  }
}

function getRequiredInput(name: string): string {
  return core.getInput(name, { required: true });
}

function getIssueOrPullRequestNumber(): number | undefined {
  const issue = context.payload.issue;
  if (issue) {
    return issue.number;
  }

  const pull_request = context.payload.pull_request;
  if (pull_request) {
    return pull_request.number;
  }

  return;
}

function issueOrPullRequestHasLabel(label: string): number | undefined {
  const issue = context.payload.issue;
  if (issue) {
    return issue.labels.find(
      ({name: name}) => name === label
    );
  }

  const pull_request = context.payload.pull_request;
  if (pull_request) {
    return pull_request.number;
  }

  return;
}

function getIssueOrPullRequestBody(): string | undefined {
  const issue = context.payload.issue;
  if (issue) {
    return issue.body;
  }

  const pull_request = context.payload.pull_request;
  if (pull_request) {
    return pull_request.body;
  }

  return;
}

function getIssueOrPullRequestLabels(): [] | undefined {
  const issue = context.payload.issue;
  if (issue) {
    return issue?.labels;
  }

  const pull_request = context.payload.pull_request;
  if (pull_request) {
    return pull_request.labels;
  }

  return [];
}

function getIssueOrPullRequestTitle(): string | undefined {
  const issue = context.payload.issue;
  if (issue) {
    return issue.title;
  }

  const pull_request = context.payload.pull_request;
  if (pull_request) {
    return pull_request.title;
  }

  return;
}


function hasLabel(labels: string[] | undefined , label: string): boolean {
  if(!labels) 
    return false
  return labels.includes(label)
}


function checkLabel(issue_body: string, name: string): boolean {
  const found = issue_body.match(name)
  if(!found) {
    return false
  }
  return true
}

async function addLabels(
  token: string,
  issue_number: number,
  labels: string[]
) {

  await getOctokit(token).rest.issues.addLabels({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue_number,
    labels: labels
  });
}

async function removeLabel(
  token: string,
  issue_number: number,
  name: string
) {
  await getOctokit(token).rest.issues.removeLabel({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issue_number,
    name: name
  });
}

interface ConfigObject {
  enabled: boolean;
}

async function getMeticsEnabled(
  token: string
): Promise<boolean> {
  const supportedFileExtensions = ['yaml', 'yml'];
  const result = false;

  for (const fileExtension of supportedFileExtensions) {
    const filePath = `.github/a11y-metrics.${fileExtension}`;
    const content = await fetchContent(token, filePath);

    if (content) {
      try {
        const configObject = yaml.load(content) as ConfigObject;
        
        assert.ok(
          configObject,
          `Invalid configuration in ${filePath}`
        )
        assert.strictEqual(
          typeof configObject.enabled,
          'boolean',
          `Invalid "enabled" property in ${filePath}`
        )

        return configObject.enabled;
      } catch (error) {
        console.log(`Invalid yaml in ${filePath}`)
      }
    }
  }

  return result;
}

async function fetchContent(
  token: string,
  path: string
): Promise<string | undefined> {
  try {
    const response: any = await getOctokit(token).rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path,
      ref: context.sha
    });
    return Buffer.from(response.data.content, response.data.encoding).toString();
  } catch (error) {
    return;
  }
}

run();
