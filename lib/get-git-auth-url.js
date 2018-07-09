const {parse, format} = require('url');
const {isUndefined} = require('lodash');
const gitUrlParse = require('git-url-parse');
const hostedGitInfo = require('hosted-git-info');
const {verifyAuth} = require('./git');

const GIT_TOKENS = {
  GIT_CREDENTIALS: undefined,
  GH_TOKEN: undefined,
  GITHUB_TOKEN: undefined,
  GL_TOKEN: 'gitlab-ci-token:',
  GITLAB_TOKEN: 'gitlab-ci-token:',
  BB_TOKEN: 'x-token-auth:',
  BITBUCKET_TOKEN: 'x-token-auth:',
};

/**
 * Determine the the git repository URL to use to push, either:
 * - The `repositoryUrl` as is if allowed to push
 * - The `repositoryUrl` converted to `https` or `http` with Basic Authentication
 *
 * In addition, expand shortcut URLs (`owner/repo` => `https://github.com/owner/repo.git`) and transform `git+https` / `git+http` URLs to `https` / `http`.
 *
 * @param {Object} options Options.
 * @param {String} options.repositoryUrl The user provided Git repository URL.
 * @param {String} options.branch The current branch.
 * @param {String} options.cwd The current working directory.
 * @return {String} The formatted Git repository URL.
 * @param {Object} [env=process.env] Environment variables.
 */
module.exports = async ({repositoryUrl, branch, cwd}, env = process.env) => {
  const info = hostedGitInfo.fromUrl(repositoryUrl, {noGitPlus: true});

  if (info && info.getDefaultRepresentation() === 'shortcut') {
    // Expand shorthand URLs (such as `owner/repo` or `gitlab:owner/repo`)
    repositoryUrl = info.https();
  } else {
    const {protocols} = gitUrlParse(repositoryUrl);

    // Replace `git+https` and `git+http` with `https` or `http`
    if (protocols.includes('http') || protocols.includes('https')) {
      repositoryUrl = format({
        ...parse(repositoryUrl),
        ...{protocol: protocols.includes('https') ? 'https' : 'http'},
      });
    }
  }

  // Test if push is allowed without transforming the URL (e.g. is ssh keys are set up)
  try {
    await verifyAuth(repositoryUrl, branch, {cwd});
  } catch (err) {
    const envVar = Object.keys(GIT_TOKENS).find(envVar => !isUndefined(env[envVar]));
    const gitCredentials = `${GIT_TOKENS[envVar] || ''}${env[envVar] || ''}`;
    const {protocols, ...parsed} = gitUrlParse(repositoryUrl);
    const protocol = protocols.includes('https') ? 'https' : protocols.includes('http') ? 'http' : 'https';

    // If credentials are set via anvironment variables, convert the URL to http/https and add basic auth, otherwise return `repositoryUrl` as is
    return gitCredentials ? {...parsed, protocols: [protocol], user: gitCredentials}.toString(protocol) : repositoryUrl;
  }

  return repositoryUrl;
};
