import * as core from '@actions/core';
import * as github from '@actions/github';
import labels from './labels'

async function run() {
  try {
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

    // A client to load data from GitHub
    const client = new github.GitHub(token);

    const addLabel: string[] = []
    const removeLabelItems: string[] = []

    let issueContent = ""
    if (includeTitle === 1) {
      issueContent += `${issue_title}\n\n`
    }
    issueContent += issue_body

    labels.forEach(({name: name}) => {
      if (checkLabel(issueContent, name)) {
        addLabel.push(name)
      }
      else {
        removeLabelItems.push(name)
      }}
    );

    if (addLabel.length > 0) {
      console.log(`Adding labels ${addLabel.toString()} to issue #${issue_number}`)
      addLabels(client, issue_number, addLabel)
    }

    removeLabelItems.forEach(function (label, index) {
      console.log(`Removing label ${label} from issue #${issue_number}`)
      removeLabel(client, issue_number, label)
    });
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function getIssueOrPullRequestNumber(): number | undefined {
  const issue = github.context.payload.issue;
  if (issue) {
    return issue.number;
  }

  const pull_request = github.context.payload.pull_request;
  if (pull_request) {
    return pull_request.number;
  }

  return;
}

function issueOrPullRequestHasLabel(label: String): number | undefined {
  const issue = github.context.payload.issue;
  if (issue) {
    return issue.labels.find(
      (str: String) => str == label
    );
  }

  const pull_request = github.context.payload.pull_request;
  if (pull_request) {
    return pull_request.number;
  }

  return;
}

function getIssueOrPullRequestBody(): string | undefined {
  const issue = github.context.payload.issue;
  if (issue) {
    return issue.body;
  }

  const pull_request = github.context.payload.pull_request;
  if (pull_request) {
    return pull_request.body;
  }

  return;
}

function getIssueOrPullRequestTitle(): string | undefined {
  const issue = github.context.payload.issue;
  if (issue) {
    return issue.title;
  }

  const pull_request = github.context.payload.pull_request;
  if (pull_request) {
    return pull_request.title;
  }

  return;
}

function checkLabel(issue_body: string, name: string[]): boolean {
  var found = issue_body.match(`\[x\] ${name}`)
  if(!found) {
    return false
  }
  return true
}

async function addLabels(
  client: github.GitHub,
  issue_number: number,
  labels: string[]
) {

  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issue_number,
    labels: labels
  });
}

async function removeLabel(
  client: github.GitHub,
  issue_number: number,
  name: string
) {
  await client.issues.removeLabel({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: issue_number,
    name: name
  });
}

run();
