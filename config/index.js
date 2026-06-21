import path from 'path';

import { defineConfig } from '@tarojs/cli';

import devConfig from './dev';
import prodConfig from './prod';

const resolvePath = p => path.resolve(__dirname, '..', p);

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig(async (merge, { _command, _mode }) => {
  const baseConfig = {
    projectName: 'medical-chaperon-miniapp',
    date: '2025-6-20',
    designWidth: 375,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    alias: {
      '@': resolvePath('src'),
    },
    plugins: ['@tarojs/plugin-html'],
    defineConstants: {
      ENABLE_INNER_HTML: JSON.stringify(true),
      ENABLE_ADJACENT_HTML: JSON.stringify(true),
      ENABLE_SIZE_APIS: JSON.stringify(true),
      ENABLE_TEMPLATE_CONTENT: JSON.stringify(true),
      ENABLE_CLONE_NODE: JSON.stringify(true),
      ENABLE_THIRD_PARTY_COMPONENTS: JSON.stringify(true),
      ENABLE_CONTAINS: JSON.stringify(true),
      ENABLE_MUTATION_OBSERVER: JSON.stringify(true),
    },
    copy: {
      patterns: [
        {
          from: 'src/components/agent-ui/imgs',
          to: 'dist/components/agent-ui/imgs'
        },
        {
          from: 'src/components/agent-ui/wd-markdown/copy',
          to: 'dist/components/agent-ui/wd-markdown/copy'
        },
        {
          from: 'src/components/agent-ui/md5.js',
          to: 'dist/components/agent-ui/md5.js'
        },
        {
          from: 'src/components/agent-ui/tools.js',
          to: 'dist/components/agent-ui/tools.js'
        }
      ],
      options: {},
    },
    framework: 'react',
    compiler: {
      type: 'webpack5',
      prebundle: {
        enable: true,
      },
    },
    cache: {
      enable: true,
    },
    mini: {
      miniCssExtractPluginOption: {
        ignoreOrder: true,
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {
            selectorBlackList: ['nut-'],
          },
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js',
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        },
      },
    },
  };
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
