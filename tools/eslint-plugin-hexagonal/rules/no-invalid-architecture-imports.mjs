/** @type {import("eslint").Rule.RuleModule} */

const defaultConfig = {
  sharedModule: 'shared',
  layers: {
    domain: 'domain',
    application: 'application',
    infrastructure: 'infrastructure',
    presentation: 'presentation',
  },
  whiteListPatterns: ['@/variables/', '.test.ts'],
  allowedImports: {
    domain: [],
    application: ['domain'],
    infrastructure: ['application', 'domain'],
    presentation: ['infrastructure', 'application', 'domain'],
  },
  appRouterFileRegex: 'app.router.ts*',
  routeFileRegex: 'route.*',
  documentationInfoPath: 'documentation/shared/hexagonal-architecture.md',
};

function mergeConfig(options) {
  const userConfig = options?.[0] || {};
  return {
    ...defaultConfig,
    ...userConfig,
    layers: { ...defaultConfig.layers, ...userConfig.layers },
    allowedImports: {
      ...defaultConfig.allowedImports,
      ...userConfig.allowedImports,
    },
    whiteListPatterns: [...(defaultConfig.whiteListPatterns || []), ...(userConfig.whiteListPatterns || [])],
    appRouterFileRegex: userConfig.appRouterFileRegex || defaultConfig.appRouterFileRegex,
    routeFileRegex: userConfig.routeFileRegex || defaultConfig.routeFileRegex,
    documentationInfoPath: userConfig.documentationInfoPath || defaultConfig.documentationInfoPath,
  };
}

function getLayer(filePath, layers) {
  const normalized = filePath.replace(/\\/g, '/');
  return Object.values(layers).find(layer => normalized.includes(layer)) ?? null;
}

function extractAppModuleName(path, fallback = '') {
  const normalizedPath = path.replace(/\\/g, '/');
  const regex = /(?:^|\/)(?:src\/app|@)\/modules\/([^\/]+)\//;
  const match = normalizedPath.match(regex);
  return match ? match[1] : fallback;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce hexagonal architecture import rules',
      recommended: true,
      url: 'documentation/shared/hexagonal-architecture.md',
    },
    schema: [
      {
        type: 'object',
        properties: {
          sharedModule: { type: 'string' },
          layers: { type: 'object' },
          whiteListPatterns: {
            type: 'array',
            items: { type: 'string' },
          },
          allowedImports: { type: 'object' },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      crossModule: `Hexagonal architecture violation: {{currentFileModule}} module cannot import from {{importFileModule}} module. ℹ️ Cross-module imports must go through the shared module. {{documentationInfoPath}}`,
      dependencyViolation: `Hexagonal architecture violation: {{currentLayer}} layer cannot import from {{importedLayer}} layer. ℹ️ Dependencies must flow from {{layersOrder}}.
      {{documentationInfoPath}}`,
      domainExternalImport: `Hexagonal architecture violation: Domain layer cannot have external imports. ℹ️ Domain must only import from its own local domain files, no external dependencies allowed. {{documentationInfoPath}}`,
    },
  },

  create(context) {
    const config = mergeConfig(context.options);
    const layersOrder = Object.values(config.layers).join(' → ');
    const { appRouterFileRegex, routeFileRegex, documentationInfoPath } = config;

    return {
      ImportDeclaration(node) {
        const currentFilename = context.getFilename();
        const importFilename = node.source.value;

        // Skip white-listed patterns
        if (
          config.whiteListPatterns.some(
            pattern => currentFilename.includes(pattern) || importFilename.includes(pattern)
          )
        ) {
          return;
        }

        const localLayerOrExternalFile = 'local';

        const layerCurrentFile = getLayer(currentFilename, config.layers) ?? localLayerOrExternalFile;
        const layerImportedFile = getLayer(importFilename, config.layers) ?? localLayerOrExternalFile;

        // Check if domain is importing external packages (non-relative imports)
        const isDomainFile = layerCurrentFile === config.layers.domain;
        const isRelativeImport = importFilename.startsWith('.') || importFilename.startsWith('/');
        const isSharedModuleImport = importFilename.includes(`/${config.sharedModule}`);

        if (isDomainFile && !isRelativeImport && !isSharedModuleImport) {
          context.report({
            node,
            messageId: 'domainExternalImport',
            data: {
              documentationInfoPath,
            },
          });
          return;
        }

        // Skip files not in layers for performance
        if (layerCurrentFile === localLayerOrExternalFile || layerImportedFile === localLayerOrExternalFile) {
          return;
        }

        const currentFileModule = extractAppModuleName(currentFilename);
        const importFileModule = extractAppModuleName(importFilename, currentFileModule);

        const cannotImportFromOtherModule =
          importFileModule !== config.sharedModule && currentFileModule !== importFileModule;

        const isRouterFile = RegExp(appRouterFileRegex).test(currentFilename);
        const isRouteFile = RegExp(routeFileRegex).test(importFilename);
        const isRouterImportingRoute = isRouterFile && isRouteFile;

        // Prevent cross-module imports that do not go through shared
        if (cannotImportFromOtherModule && !isRouterImportingRoute) {
          context.report({
            node,
            messageId: 'crossModule',
            data: {
              currentFileModule,
              importFileModule,
              documentationInfoPath,
            },
          });
          return;
        }

        if (
          !config.allowedImports[layerCurrentFile]?.includes(layerImportedFile) &&
          layerCurrentFile !== layerImportedFile
        ) {
          context.report({
            node,
            messageId: 'dependencyViolation',
            data: {
              currentLayer: layerCurrentFile,
              importedLayer: layerImportedFile,
              layersOrder,
              documentationInfoPath,
            },
          });
        }
      },
    };
  },
};
