import test from 'ava';
import getAuthUrl from '../lib/get-git-auth-url';
import {gitRepo} from './helpers/git-utils';

// Save the current process.env
const envBackup = Object.assign({}, process.env);

test.before(() => {
  process.env.GIT_ASKPASS = 'echo';
  process.env.GIT_TERMINAL_PROMPT = 0;
});

test.after.always(() => {
  // Restore process.env
  process.env = envBackup;
});

test('Return the same "git" formatted URL if "gitCredentials" is not defined', async t => {
  t.is(await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}), 'git@host.null:owner/repo.git');
});

test('Return the same "https" formatted URL if "gitCredentials" is not defined', async t => {
  t.is(await getAuthUrl({repositoryUrl: 'https://host.null/owner/repo.git'}), 'https://host.null/owner/repo.git');
});

test('Return the "https" formatted URL if "gitCredentials" is not defined and repositoryUrl is a "git+https" URL', async t => {
  t.is(await getAuthUrl({repositoryUrl: 'git+https://host.null/owner/repo.git'}), 'https://host.null/owner/repo.git');
});

test('Do not add trailing ".git" if not present in the origian URL', async t => {
  t.is(await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo'}), 'git@host.null:owner/repo');
});

test('Handle "https" URL with group and subgroup', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'https://host.null/group/subgroup/owner/repo.git'}),
    'https://host.null/group/subgroup/owner/repo.git'
  );
});

test('Handle "git" URL with group and subgroup', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:group/subgroup/owner/repo.git'}),
    'git@host.null:group/subgroup/owner/repo.git'
  );
});

test('Convert shorthand URL', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'semanitc-release/semanitc-release'}),
    'https://github.com/semanitc-release/semanitc-release.git'
  );
});

test('Convert GitLab shorthand URL', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'gitlab:semanitc-release/semanitc-release'}),
    'https://gitlab.com/semanitc-release/semanitc-release.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git" URL', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}, {GIT_CREDENTIALS: 'user:pass'}),
    'https://user:pass@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "https" URL', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'https://host.null/owner/repo.git'}, {GIT_CREDENTIALS: 'user:pass'}),
    'https://user:pass@host.null/owner/repo.git'
  );
});

test('Return the "http" formatted URL if "gitCredentials" is defined and repositoryUrl is a "http" URL', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'http://host.null/owner/repo.git'}, {GIT_CREDENTIALS: 'user:pass'}),
    'http://user:pass@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git+https" URL', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git+https://host.null/owner/repo.git'}, {GIT_CREDENTIALS: 'user:pass'}),
    'https://user:pass@host.null/owner/repo.git'
  );
});

test('Return the "http" formatted URL if "gitCredentials" is defined and repositoryUrl is a "git+http" URL', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git+http://host.null/owner/repo.git'}, {GIT_CREDENTIALS: 'user:pass'}),
    'http://user:pass@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined with "GH_TOKEN"', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}, {GH_TOKEN: 'token'}),
    'https://token@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined with "GITHUB_TOKEN"', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}, {GITHUB_TOKEN: 'token'}),
    'https://token@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined with "GL_TOKEN"', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}, {GL_TOKEN: 'token'}),
    'https://gitlab-ci-token:token@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined with "GITLAB_TOKEN"', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}, {GITLAB_TOKEN: 'token'}),
    'https://gitlab-ci-token:token@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined with "BB_TOKEN"', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}, {BB_TOKEN: 'token'}),
    'https://x-token-auth:token@host.null/owner/repo.git'
  );
});

test('Return the "https" formatted URL if "gitCredentials" is defined with "BITBUCKET_TOKEN"', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:owner/repo.git'}, {BITBUCKET_TOKEN: 'token'}),
    'https://x-token-auth:token@host.null/owner/repo.git'
  );
});

test('Handle "https" URL with group and subgroup, with "GIT_CREDENTIALS"', async t => {
  t.is(
    await getAuthUrl(
      {repositoryUrl: 'https://host.null/group/subgroup/owner/repo.git'},
      {GIT_CREDENTIALS: 'user:pass'}
    ),
    'https://user:pass@host.null/group/subgroup/owner/repo.git'
  );
});

test('Handle "git" URL with group and subgroup, with "GIT_CREDENTIALS', async t => {
  t.is(
    await getAuthUrl({repositoryUrl: 'git@host.null:group/subgroup/owner/repo.git'}, {GIT_CREDENTIALS: 'user:pass'}),
    'https://user:pass@host.null/group/subgroup/owner/repo.git'
  );
});

test('Do not add git credential to repositoryUrl if push is allowed', async t => {
  // Create a git repository, set the current working directory at the root of the repo
  const {cwd, repositoryUrl} = await gitRepo(true);

  t.is(await getAuthUrl({repositoryUrl, cwd}, {GIT_CREDENTIALS: 'user:pass'}), repositoryUrl);
});
