import * as core from '@actions/core';
import { context, getOctokit } from "@actions/github";
import a11yLabels from './labels'

async function run() {
  // Configuration parameters
  const token = core.getInput('repo-token', { required: true });
  const includeTitle = parseInt(core.getInput('include-title', { required: false }));

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

  const hasA11yLabel = issueOrPullRequestHasLabel("A11Y");
  if (!hasA11yLabel) {
    console.log('Not an accessibility issue, skipping.')
    return;
  }

  const addLabel: string[] = []
  const removeLabelItems: string[] = []

  let issueContent = ""
  if (includeTitle === 1) {
    issueContent += `${issue_title}\n\n`
  }
  issueContent += issue_body
  
  const currentLabels = getIssueOrPullRequestLabels()
  console.log(`Current labels: ${currentLabels}`)

  a11yLabels.forEach(({name: name}) => {
    if (checkLabel(issueContent, `\\[x\\] ${name.replace('WCAG ', '')} `)) {
      addLabel.push(name)
    } else if (hasLabel(currentLabels, name)) {
      removeLabelItems.push(name)
    }
  }
  );

  if(checkLabel(issueContent, `\\[x\\] Discovered by Customer`)) {
    addLabel.push('Customer')
  } else if (hasLabel(currentLabels,'Customer')) {
    removeLabelItems.push('Customer')
  }

  if(checkLabel(issueContent, `\\[x\\] Exists in Production`)) {
    addLabel.push('Production')
  } else if (hasLabel(currentLabels,'Production')) {
    removeLabelItems.push('Production')
  }

  if(checkLabel(issueContent, `\\[x\\] Discovered during VPAT`)) {
    addLabel.push('VPAT')
  } else if (hasLabel(currentLabels,'VPAT')) {
    removeLabelItems.push('VPAT')
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


function hasLabel(labels: any[] | undefined , label: string): boolean {
  if(!labels) 
    return false
  for(let i = 0; i < labels?.length; i++) {
    const l = labels[i]
    if(l.name === label) {
      return true;
    }
    // return labels.map(({name: n}) => (n)).includes(label)
  }
  return false;
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

run();
