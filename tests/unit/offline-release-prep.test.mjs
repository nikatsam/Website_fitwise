import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import vm from 'node:vm';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createDeploymentPlan,
  validateInfrastructureTemplate,
  validateOidcDeployRoleTemplate,
} from '../../scripts/release-prep.mjs';

const root = process.cwd();
const templatePath = path.join(root, 'infra', 'fitwise-static-site.template.json');
const oidcTemplatePath = path.join(root, 'infra', 'github-oidc-deploy-role.template.json');
const temporaryDirectories = [];

async function makeDist() {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'fitwise-release-plan-'));
  temporaryDirectories.push(directory);
  await mkdir(path.join(directory, '_astro'), { recursive: true });
  await mkdir(path.join(directory, 'assets', 'images'), { recursive: true });
  await mkdir(path.join(directory, 'dev'), { recursive: true });
  await writeFile(path.join(directory, 'index.html'), '<h1>Home</h1>', 'utf8');
  await writeFile(path.join(directory, 'robots.txt'), 'User-agent: *\nAllow: /\n', 'utf8');
  await writeFile(path.join(directory, 'sitemap.xml'), '<urlset />', 'utf8');
  await writeFile(path.join(directory, '_astro', 'app.deadbeef.js'), 'console.log(1)', 'utf8');
  await writeFile(path.join(directory, 'assets', 'images', 'room.webp'), 'image-data');
  await writeFile(path.join(directory, 'dev', 'preview.html'), '<h1>Internal preview</h1>', 'utf8');
  return directory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe('offline cloud release preparation', () => {
  it('accepts the least-privilege private S3 and CloudFront template', async () => {
    const template = JSON.parse(await readFile(templatePath, 'utf8'));
    expect(validateInfrastructureTemplate(template)).toEqual([]);
  });

  it('restricts OIDC deploy trust to the production GitHub environment and resource scope', async () => {
    const template = JSON.parse(await readFile(oidcTemplatePath, 'utf8'));
    expect(validateOidcDeployRoleTemplate(template)).toEqual([]);

    const widened = JSON.parse(JSON.stringify(template));
    widened.Resources.FitwiseGitHubDeployRole.Properties.AssumeRolePolicyDocument.Statement[0].Condition.StringEquals[
      'token.actions.githubusercontent.com:sub'
    ] = '*';
    const errors = validateOidcDeployRoleTemplate(widened);
    expect(errors.some((error) => error.includes('production environment'))).toBe(true);

    const untaggedFunctionRole = JSON.parse(await readFile(oidcTemplatePath, 'utf8'));
    untaggedFunctionRole.Resources.FitwiseGitHubDeployRole.Properties.Policies[0].PolicyDocument.Statement =
      untaggedFunctionRole.Resources.FitwiseGitHubDeployRole.Properties.Policies[0].PolicyDocument.Statement.filter(
        (statement) => statement.Sid !== 'TagNewFitwiseDirectoryFunctions',
      );
    expect(
      validateOidcDeployRoleTemplate(untaggedFunctionRole).some((error) =>
        error.includes('tagging'),
      ),
    ).toBe(true);
  });

  it('rejects public bucket access and a non-HTTPS cache behavior', async () => {
    const template = JSON.parse(await readFile(templatePath, 'utf8'));
    template.Resources.StaticSiteBucket.Properties.PublicAccessBlockConfiguration.BlockPublicPolicy = false;
    template.Resources.SiteDistribution.Properties.DistributionConfig.DefaultCacheBehavior.ViewerProtocolPolicy =
      'allow-all';
    const errors = validateInfrastructureTemplate(template);
    expect(errors.some((error) => error.includes('BlockPublicPolicy'))).toBe(true);
    expect(errors.some((error) => error.includes('redirect viewers to HTTPS'))).toBe(true);
  });

  it('rejects broad bucket listing and an unsafe immutable-asset policy', async () => {
    const template = JSON.parse(await readFile(templatePath, 'utf8'));
    const statements =
      template.Resources.PrivateOriginBucketPolicy.Properties.PolicyDocument.Statement;
    statements.find(
      (statement) => statement.Sid === 'AllowOnlyThisCloudFrontDistributionRead',
    ).Action = 's3:ListBucket';
    template.Resources.SiteDistribution.Properties.DistributionConfig.CacheBehaviors[0].CachePolicyId =
      {
        Ref: 'HtmlCachePolicy',
      };
    const errors = validateInfrastructureTemplate(template);
    expect(errors.some((error) => error.includes('wildcard S3 grants'))).toBe(true);
    expect(errors.some((error) => error.includes('immutable asset cache policy'))).toBe(true);
  });

  it('rewrites root and directory routes but preserves files/assets and query strings', async () => {
    const template = JSON.parse(await readFile(templatePath, 'utf8'));
    const handlerSource = template.Resources.DirectoryIndexFunction.Properties.FunctionCode.replace(
      /^function handler/,
      'function',
    );
    const handler = vm.runInNewContext(`(${handlerSource})`);
    const rewrite = (uri, querystring = {}) => handler({ request: { uri, querystring } });

    expect(rewrite('/').uri).toBe('/index.html');
    expect(rewrite('/workspace/').uri).toBe('/workspace/index.html');
    expect(rewrite('/workspace/what-fits').uri).toBe('/workspace/what-fits/index.html');
    expect(rewrite('/404.html').uri).toBe('/404.html');
    expect(rewrite('/sitemap.xml').uri).toBe('/sitemap.xml');
    expect(rewrite('/robots.txt').uri).toBe('/robots.txt');
    expect(rewrite('/_astro/app.deadbeef.js').uri).toBe('/_astro/app.deadbeef.js');
    const queryRoute = rewrite('/workspace/', { units: { value: 'imperial' } });
    expect(queryRoute.uri).toBe('/workspace/index.html');
    expect(queryRoute.querystring.units.value).toBe('imperial');

    const errors =
      template.Resources.SiteDistribution.Properties.DistributionConfig.CustomErrorResponses;
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ErrorCode: 403,
          ResponseCode: '404',
          ResponsePagePath: '/404.html',
        }),
        expect.objectContaining({
          ErrorCode: 404,
          ResponseCode: '404',
          ResponsePagePath: '/404.html',
        }),
      ]),
    );
  });

  it('plans deterministic file metadata and cache invalidations without AWS calls', async () => {
    const dist = await makeDist();
    const first = await createDeploymentPlan(dist);
    const second = await createDeploymentPlan(dist);

    expect(first.awsCallsMade).toBe(false);
    expect(first.mode).toBe('local-plan-only');
    expect(first.objects).toEqual(second.objects);
    expect(first.excludedDevelopmentFiles).toEqual(['dev/preview.html']);
    expect(first.objects.some((object) => object.path.startsWith('dev/'))).toBe(false);
    expect(first.objects.find((object) => object.path === 'index.html')?.cacheControl).toContain(
      's-maxage=300',
    );
    expect(
      first.objects.find((object) => object.path.startsWith('_astro/'))?.cacheControl,
    ).toContain('immutable');
    expect(first.invalidationPaths).toContain('/index.html');
    expect(first.invalidationPaths).not.toContain('/_astro/app.deadbeef.js');
    expect(first.postApprovalDryRunCommands[0]).toContain('--exclude "dev/*"');
  });
});
