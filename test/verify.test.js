import test from 'ava';
import tempy from 'tempy';
import verify from '../lib/verify';
import {gitRepo} from './helpers/git-utils';

test('Throw a AggregateError', async t => {
  const {cwd} = await gitRepo();

  const errors = [...(await t.throws(verify({cwd})))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ENOREPOURL');
  t.is(errors[1].name, 'SemanticReleaseError');
  t.is(errors[1].code, 'EINVALIDTAGFORMAT');
  t.is(errors[2].name, 'SemanticReleaseError');
  t.is(errors[2].code, 'ETAGNOVERSION');
});

test('Throw a SemanticReleaseError if does not run on a git repository', async t => {
  const cwd = tempy.directory();

  const errors = [...(await t.throws(verify({cwd})))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ENOGITREPO');
});

test('Throw a SemanticReleaseError if the "tagFormat" is not valid', async t => {
  const {cwd, repositoryUrl} = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `?\${version}`, cwd};

  const errors = [...(await t.throws(verify(options, 'master', t.context.logger)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'EINVALIDTAGFORMAT');
});

test('Throw a SemanticReleaseError if the "tagFormat" does not contains the "version" variable', async t => {
  const {cwd, repositoryUrl} = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: 'test', cwd};

  const errors = [...(await t.throws(verify(options, 'master', t.context.logger)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ETAGNOVERSION');
});

test('Throw a SemanticReleaseError if the "tagFormat" contains multiple "version" variables', async t => {
  const {cwd, repositoryUrl} = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `\${version}v\${version}`, cwd};

  const errors = [...(await t.throws(verify(options)))];

  t.is(errors[0].name, 'SemanticReleaseError');
  t.is(errors[0].code, 'ETAGNOVERSION');
});

test('Return "true" if all verification pass', async t => {
  const {cwd, repositoryUrl} = await gitRepo(true);
  const options = {repositoryUrl, tagFormat: `v\${version}`, cwd};

  await t.notThrows(verify(options));
});
