const generateBlog = require('./generate-blog-index');

class MDXCompassPlugin {
  constructor(options) {
    this.options = options;
  }

  getChangedFiles(compiler) {
    const { watchFileSystem } = compiler;
    const watcher = watchFileSystem.watcher || watchFileSystem.wfs.watcher;

    return Object.keys(watcher.mtimes);
  }

  apply(compiler) {
    // Set up blog index at start
    compiler.hooks.environment.tap('MDXCompass', () => {
      generateBlog(this.options);
    });

    // Re generate blog index when MDX files change
    compiler.hooks.watchRun.tap('MDXCompass', () => {
      const changedFile = this.getChangedFiles(compiler);

      if (changedFile.find(file => file.includes('.mdx'))) {
        generateBlog(this.options);
      }
    });
  }
}

module.exports = (nextConfig = {}) => {
  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      if (!options.defaultLoaders) {
        throw new Error(
          'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
        );
      }

      config.plugins.push(new MDXCompassPlugin(nextConfig));

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    }
  });
};
