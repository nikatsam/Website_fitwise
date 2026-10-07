import { createHash } from 'node:crypto';
import { Console } from 'node:console';
import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const console = new Console(process.stdout, process.stderr);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const templatePath = path.join(projectRoot, 'infra', 'fitwise-static-site.template.json');
const oidcTemplatePath = path.join(projectRoot, 'infra', 'github-oidc-deploy-role.template.json');

export function validateInfrastructureTemplate(template) {
  const errors = [];
  const resources = template.Resources ?? {};
  const requireResource = (id, type) => {
    if (resources[id]?.Type !== type) errors.push(`${id} must be ${type}.`);
    return resources[id]?.Properties ?? {};
  };
  const bucket = requireResource('StaticSiteBucket', 'AWS::S3::Bucket');
  requireResource('SiteOriginAccessControl', 'AWS::CloudFront::OriginAccessControl');
  requireResource('HtmlCachePolicy', 'AWS::CloudFront::CachePolicy');
  requireResource('HashedAssetsCachePolicy', 'AWS::CloudFront::CachePolicy');
  requireResource('ImagesCachePolicy', 'AWS::CloudFront::CachePolicy');
  const headers = requireResource(
    'SiteSecurityHeadersPolicy',
    'AWS::CloudFront::ResponseHeadersPolicy',
  );
  const directoryFunction = requireResource('DirectoryIndexFunction', 'AWS::CloudFront::Function');
  const distribution = requireResource('SiteDistribution', 'AWS::CloudFront::Distribution');
  const bucketPolicy = requireResource('PrivateOriginBucketPolicy', 'AWS::S3::BucketPolicy');

  const publicAccess = bucket.PublicAccessBlockConfiguration ?? {};
  for (const setting of [
    'BlockPublicAcls',
    'BlockPublicPolicy',
    'IgnorePublicAcls',
    'RestrictPublicBuckets',
  ]) {
    if (publicAccess[setting] !== true)
      errors.push(`S3 public-access block '${setting}' must be true.`);
  }
  if (bucket.WebsiteConfiguration) errors.push('The S3 bucket must not enable website hosting.');
  if (bucket.OwnershipControls?.Rules?.[0]?.ObjectOwnership !== 'BucketOwnerEnforced') {
    errors.push('S3 object ownership must be BucketOwnerEnforced.');
  }
  if (
    bucket.BucketEncryption?.ServerSideEncryptionConfiguration?.[0]?.ServerSideEncryptionByDefault
      ?.SSEAlgorithm !== 'AES256'
  ) {
    errors.push('S3 default encryption must be AES256.');
  }
  const lifecycleRules = bucket.LifecycleConfiguration?.Rules ?? [];
  if (!lifecycleRules.some((rule) => rule.Prefix === '_astro/' && rule.ExpirationInDays >= 365)) {
    errors.push(
      'S3 lifecycle must retain fingerprinted assets beyond their one-year edge-cache lifetime.',
    );
  }

  const siteDistribution = distribution.DistributionConfig ?? {};
  const origin = siteDistribution.Origins?.[0] ?? {};
  if (siteDistribution.Origins?.length !== 1)
    errors.push('Distribution must have exactly one S3 origin.');
  if (origin.S3OriginConfig?.OriginAccessIdentity !== '') {
    errors.push('S3 REST origin must not use a public website endpoint/OAI.');
  }
  if (
    !origin.OriginAccessControlId?.Ref ||
    origin.OriginAccessControlId.Ref !== 'SiteOriginAccessControl'
  ) {
    errors.push('S3 origin must use the declared OAC.');
  }

  const behaviors = [
    siteDistribution.DefaultCacheBehavior,
    ...(siteDistribution.CacheBehaviors ?? []),
  ].filter(Boolean);
  for (const behavior of behaviors) {
    if (behavior.TargetOriginId !== 'PrivateS3Origin')
      errors.push('Every cache behavior must target the private S3 origin.');
    if (behavior.ViewerProtocolPolicy !== 'redirect-to-https') {
      errors.push('Every cache behavior must redirect viewers to HTTPS.');
    }
    if (behavior.ResponseHeadersPolicyId?.Ref !== 'SiteSecurityHeadersPolicy') {
      errors.push('Every cache behavior must attach the security headers policy.');
    }
    if (
      !behavior.FunctionAssociations?.some(
        (association) => association.EventType === 'viewer-request',
      )
    ) {
      errors.push('Every cache behavior must apply the directory-index viewer-request function.');
    }
  }
  if (!siteDistribution.Aliases?.some((alias) => alias.Ref === 'ApexDomainName')) {
    errors.push('Distribution must use the configured apex alias.');
  }
  if (
    siteDistribution.ViewerCertificate?.MinimumProtocolVersion !== 'TLSv1.2_2021' ||
    !siteDistribution.ViewerCertificate?.AcmCertificateArn?.Ref
  ) {
    errors.push(
      'Viewer certificate must use the supplied ACM certificate and TLSv1.2_2021 minimum.',
    );
  }
  if (
    !siteDistribution.CustomErrorResponses?.some(
      (response) =>
        response.ErrorCode === 404 &&
        response.ResponseCode === '404' &&
        response.ResponsePagePath === '/404.html',
    )
  ) {
    errors.push('Distribution must return the static /404.html page with HTTP 404.');
  }
  if (
    !siteDistribution.CustomErrorResponses?.some(
      (response) =>
        response.ErrorCode === 403 &&
        response.ResponseCode === '404' &&
        response.ResponsePagePath === '/404.html',
    )
  ) {
    errors.push(
      'Private S3 origin 403 responses for missing objects must map to the real static HTTP 404 page.',
    );
  }
  const cacheBehaviors = siteDistribution.CacheBehaviors ?? [];
  if (
    !cacheBehaviors.some(
      (behavior) =>
        behavior.PathPattern === '_astro/*' &&
        behavior.CachePolicyId?.Ref === 'HashedAssetsCachePolicy',
    )
  ) {
    errors.push('Fingerprint-named assets must use the immutable asset cache policy.');
  }
  if (
    !cacheBehaviors.some(
      (behavior) =>
        behavior.PathPattern === 'assets/images/*' &&
        behavior.CachePolicyId?.Ref === 'ImagesCachePolicy',
    )
  ) {
    errors.push('Public images must use their bounded one-day cache policy.');
  }

  const allow = bucketPolicy.PolicyDocument?.Statement?.find(
    (statement) => statement.Sid === 'AllowOnlyThisCloudFrontDistributionRead',
  );
  const sourceArn = allow?.Condition?.StringEquals?.['AWS:SourceArn']?.['Fn::Sub'];
  if (
    allow?.Effect !== 'Allow' ||
    allow?.Principal?.Service !== 'cloudfront.amazonaws.com' ||
    allow?.Action !== 's3:GetObject' ||
    typeof sourceArn !== 'string' ||
    !sourceArn.includes('${SiteDistribution}')
  ) {
    errors.push(
      'Bucket policy must grant only CloudFront GetObject scoped to this distribution ARN.',
    );
  }
  const statements = bucketPolicy.PolicyDocument?.Statement ?? [];
  if (
    !statements.some(
      (statement) =>
        statement.Effect === 'Deny' &&
        statement.Principal === '*' &&
        statement.Condition?.Bool?.['aws:SecureTransport'] === 'false',
    )
  ) {
    errors.push('Bucket policy must deny insecure transport.');
  }
  if (
    statements.some(
      (statement) =>
        statement.Effect === 'Allow' &&
        (statement.Principal === '*' ||
          statement.Action === 's3:*' ||
          statement.Action === 's3:ListBucket'),
    )
  ) {
    errors.push('Bucket policy must not contain public or wildcard S3 grants.');
  }

  const security = headers.ResponseHeadersPolicyConfig?.SecurityHeadersConfig ?? {};
  if (
    security.ContentTypeOptions?.Override !== true ||
    security.FrameOptions?.FrameOption !== 'DENY' ||
    security.StrictTransportSecurity?.AccessControlMaxAgeSec < 31536000 ||
    !security.ContentSecurityPolicy?.ContentSecurityPolicy?.includes("default-src 'self'")
  ) {
    errors.push(
      'Security headers must include nosniff, DENY framing, HSTS, and a restrictive CSP.',
    );
  }
  if (!directoryFunction.FunctionCode?.includes("request.uri = uri + 'index.html'")) {
    errors.push('CloudFront Function must rewrite trailing-slash paths to index.html.');
  }
  if (Object.values(resources).some((resource) => resource.Type === 'AWS::Lambda::Function')) {
    errors.push('Normal page requests must not depend on Lambda.');
  }

  return errors;
}

export function validateOidcDeployRoleTemplate(template) {
  const errors = [];
  const role = template.Resources?.FitwiseGitHubDeployRole;
  if (role?.Type !== 'AWS::IAM::Role') {
    errors.push('FitwiseGitHubDeployRole must be an IAM role.');
    return errors;
  }
  const properties = role.Properties ?? {};
  const trust = properties.AssumeRolePolicyDocument?.Statement?.[0];
  const trustConditions = trust?.Condition?.StringEquals ?? {};
  if (
    trust?.Action !== 'sts:AssumeRoleWithWebIdentity' ||
    !trust?.Principal?.Federated?.['Fn::Sub']?.includes('token.actions.githubusercontent.com') ||
    trustConditions['token.actions.githubusercontent.com:aud'] !== 'sts.amazonaws.com' ||
    trustConditions['token.actions.githubusercontent.com:sub'] !==
      'repo:nikatsam@22520540/Website_fitwise@1407694634:environment:production'
  ) {
    errors.push('OIDC trust must be restricted to the Fitwise repository production environment.');
  }
  if (properties.MaxSessionDuration > 3600 || properties.MaxSessionDuration < 900) {
    errors.push('OIDC sessions must be limited to 15-60 minutes.');
  }
  if (!properties.Tags?.some((tag) => tag.Key === 'project' && tag.Value === 'fitwise')) {
    errors.push('OIDC deploy role must be tagged project=fitwise.');
  }

  const statements =
    properties.Policies?.flatMap((policy) => policy.PolicyDocument?.Statement ?? []) ?? [];
  if (
    statements.some(
      (statement) =>
        statement.Action === '*' ||
        statement.Action === 'iam:*' ||
        statement.Action === 's3:*' ||
        statement.Action === 'cloudfront:*',
    )
  ) {
    errors.push('OIDC role must not contain administrator/service-wide action wildcards.');
  }
  const stackArn = statements.find(
    (statement) => statement.Sid === 'ManageOnlyFitwiseStaticSiteStack',
  )?.Resource?.['Fn::Sub'];
  if (typeof stackArn !== 'string' || !stackArn.includes('stack/fitwise-static-site/')) {
    errors.push('CloudFormation permissions must be scoped to the fitwise-static-site stack.');
  }
  const bucketArn = statements.find(
    (statement) => statement.Sid === 'SyncObjectsOnlyToFitwiseBucket',
  )?.Resource?.['Fn::Sub'];
  if (
    typeof bucketArn !== 'string' ||
    !bucketArn.includes('s3:::fitwise-static-site-${AWS::AccountId}-${AWS::Region}/*')
  ) {
    errors.push('S3 sync permissions must be scoped to Fitwise bucket objects.');
  }
  if (
    !statements.some(
      (statement) =>
        statement.Sid === 'CreateOnlyTaggedFitwiseDistribution' &&
        statement.Condition?.StringEquals?.['aws:RequestTag/project'] === 'fitwise',
    )
  ) {
    errors.push('CloudFront distribution creation must require project=fitwise.');
  }
  if (
    !statements.some(
      (statement) =>
        statement.Sid === 'CreateFitwiseOriginAccessControl' &&
        statement.Action === 'cloudfront:CreateOriginAccessControl' &&
        statement.Resource === '*',
    )
  ) {
    errors.push(
      'CloudFront OAC creation must be explicitly authorized; IAM requires wildcard resource scope for this API.',
    );
  }
  if (
    !statements.some(
      (statement) =>
        statement.Sid === 'TagNewFitwiseDistributions' &&
        statement.Action === 'cloudfront:TagResource' &&
        statement.Condition?.StringEquals?.['aws:RequestTag/project'] === 'fitwise',
    ) ||
    !statements.some(
      (statement) =>
        statement.Sid === 'TagNewFitwiseDirectoryFunctions' &&
        statement.Action === 'cloudfront:TagResource' &&
        statement.Condition?.StringEquals?.['aws:RequestTag/project'] === 'fitwise',
    )
  ) {
    errors.push(
      'CloudFront distribution and directory-function tagging must be limited to project=fitwise.',
    );
  }
  if (
    !statements.some(
      (statement) =>
        statement.Sid === 'RequestOnlyTaggedFitwiseApexCertificate' &&
        statement.Condition?.StringEquals?.['aws:RequestTag/project'] === 'fitwise' &&
        statement.Condition?.['ForAllValues:StringEquals']?.['acm:DomainNames']?.includes(
          'fitwise.stream',
        ),
    )
  ) {
    errors.push('ACM request permission must be limited to the tagged fitwise.stream certificate.');
  }
  if (
    statements.some(
      (statement) =>
        typeof statement.Action === 'string' &&
        ['iam:CreateUser', 'iam:CreateAccessKey', 'iam:CreateLoginProfile'].includes(
          statement.Action,
        ),
    )
  ) {
    errors.push('OIDC role must not create long-lived IAM users or credentials.');
  }
  return errors;
}

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json'],
  ['.ico', 'image/vnd.microsoft.icon'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.xml', 'application/xml'],
  ['.woff2', 'font/woff2'],
]);

function metadataFor(relativePath) {
  if (/^_astro\//.test(relativePath)) {
    return { cacheControl: 'public, max-age=31536000, immutable', group: 'fingerprintedAssets' };
  }
  if (/\.html$/i.test(relativePath)) {
    return {
      cacheControl: 'public, max-age=0, s-maxage=300, must-revalidate',
      group: 'html',
    };
  }
  if (relativePath === 'robots.txt' || relativePath === 'sitemap.xml') {
    return {
      cacheControl: 'public, max-age=0, s-maxage=300, must-revalidate',
      group: 'crawlControl',
    };
  }
  if (/^assets\/images\//.test(relativePath)) {
    return { cacheControl: 'public, max-age=86400', group: 'images' };
  }
  return { cacheControl: 'public, max-age=3600', group: 'otherStatic' };
}

async function listFiles(directory, relative = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const nextRelative = relative ? `${relative}/${entry.name}` : entry.name;
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? listFiles(fullPath, nextRelative)
        : [{ fullPath, relativePath: nextRelative.replaceAll(path.sep, '/') }];
    }),
  );
  return files.flat();
}

export async function createDeploymentPlan(
  distDirectory,
  destination = 's3://<SiteBucketName-stack-output>/',
) {
  const absoluteDist = path.resolve(distDirectory);
  await access(absoluteDist);
  const allFiles = await listFiles(absoluteDist);
  const excludedDevelopmentFiles = allFiles
    .filter((file) => file.relativePath.startsWith('dev/'))
    .map((file) => file.relativePath)
    .sort();
  const files = allFiles.filter((file) => !file.relativePath.startsWith('dev/'));
  if (!files.some((file) => file.relativePath === 'index.html')) {
    throw new Error(`Static build root index.html is missing from ${absoluteDist}.`);
  }

  const objects = await Promise.all(
    files.map(async ({ fullPath, relativePath }) => {
      const contents = await readFile(fullPath);
      const metadata = metadataFor(relativePath);
      return {
        path: relativePath,
        sizeBytes: contents.byteLength,
        sha256: createHash('sha256').update(contents).digest('hex'),
        contentType:
          contentTypes.get(path.extname(relativePath).toLowerCase()) ?? 'application/octet-stream',
        cacheControl: metadata.cacheControl,
        uploadGroup: metadata.group,
      };
    }),
  );

  const invalidationPaths = objects
    .filter((object) => object.uploadGroup !== 'fingerprintedAssets')
    .map((object) => `/${object.path}`)
    .sort();
  const htmlCacheControl = metadataFor('index.html').cacheControl;
  const assetCacheControl = metadataFor('_astro/example.js').cacheControl;
  const imageCacheControl = metadataFor('assets/images/example.webp').cacheControl;
  const operationsFiles = objects.filter((object) => object.uploadGroup === 'crawlControl');
  const otherFiles = objects.filter((object) => object.uploadGroup === 'otherStatic');
  const dryRunCommands = [
    `aws s3 sync dist/ "${destination}" --dryrun --delete --exclude "*" --include "*.html" --exclude "dev/*" --cache-control "${htmlCacheControl}"`,
    `aws s3 sync dist/_astro/ "${destination}_astro/" --dryrun --cache-control "${assetCacheControl}"`,
    `aws s3 sync dist/assets/images/ "${destination}assets/images/" --dryrun --cache-control "${imageCacheControl}"`,
    ...operationsFiles.map(
      (object) =>
        `aws s3 cp "dist/${object.path}" "${destination}${object.path}" --dryrun --cache-control "${object.cacheControl}" --content-type "${object.contentType}"`,
    ),
    ...otherFiles.map(
      (object) =>
        `aws s3 cp "dist/${object.path}" "${destination}${object.path}" --dryrun --cache-control "${object.cacheControl}" --content-type "${object.contentType}"`,
    ),
  ];

  return {
    mode: 'local-plan-only',
    awsCallsMade: false,
    destination,
    source: path.relative(projectRoot, absoluteDist).replaceAll(path.sep, '/'),
    objectCount: objects.length,
    excludedDevelopmentFiles,
    objects,
    invalidationPaths,
    postApprovalDryRunCommands: dryRunCommands,
    notes: [
      'This command only reads the local dist/ tree and prints a JSON plan; it never invokes AWS CLI.',
      'The HTML sync dry-run is filtered to HTML keys so --delete cannot remove assets.',
      'Development-only /dev/ preview routes are excluded from upload. If an older deployment contains them, remove them only as a separately approved cleanup after confirming the target inventory.',
      'Fingerprint-named _astro assets are not in the invalidation list; HTML, mutable images, and crawl-control files are.',
      'Review dry-run output and require explicit owner approval before executing a real sync or invalidation.',
    ],
  };
}

async function main() {
  const mode = process.argv[2];
  if (mode === 'validate-infra') {
    let template;
    let oidcTemplate;
    try {
      template = JSON.parse(await readFile(templatePath, 'utf8'));
      oidcTemplate = JSON.parse(await readFile(oidcTemplatePath, 'utf8'));
    } catch (error) {
      throw new Error(`Cannot parse offline infrastructure JSON: ${error.message}`, {
        cause: error,
      });
    }
    const errors = [
      ...validateInfrastructureTemplate(template),
      ...validateOidcDeployRoleTemplate(oidcTemplate),
    ];
    if (errors.length) {
      console.error(`Offline infrastructure validation failed (${errors.length} issue(s)):`);
      errors.forEach((error) => console.error(`- ${error}`));
      process.exitCode = 1;
      return;
    }
    console.log(
      'Offline checks passed: private S3/OAC/TLS, security/cache/404 policies, and repository/environment-scoped GitHub OIDC role. No AWS APIs called.',
    );
    return;
  }
  if (mode === 'deployment-plan') {
    const distDirectory = process.argv[3] ?? path.join(projectRoot, 'dist');
    const plan = await createDeploymentPlan(distDirectory);
    console.log(JSON.stringify(plan, null, 2));
    return;
  }
  throw new Error(
    'Usage: node scripts/release-prep.mjs <validate-infra|deployment-plan> [dist-path]',
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
