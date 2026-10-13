// =============================================
// CONFIG PLUGIN — Ciclo de vida UIScene (requerido desde iOS 27)
// Las apps compiladas con el SDK de iOS 27 que no adoptan UIScene se cierran
// al abrir. Expo SDK 57 incluye ExpoAppSceneDelegate pero la plantilla nativa
// todavía no lo conecta, así que lo hacemos aquí en cada prebuild / EAS Build.
// =============================================
const { withAppDelegate, withInfoPlist } = require('expo/config-plugins');

const SCENE_DELEGATE_CLASS = 'EXExpoAppSceneDelegate';

function withSceneManifest(config) {
  return withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: SCENE_DELEGATE_CLASS,
          },
        ],
      },
    };
    return cfg;
  });
}

function withSceneAppDelegate(config) {
  return withAppDelegate(config, (cfg) => {
    if (cfg.modResults.language !== 'swift') {
      throw new Error('withSceneLifecycle: only a Swift AppDelegate is supported');
    }
    let src = cfg.modResults.contents;

    // 1. Exponer la factory de React Native al scene delegate
    if (!src.includes('ExpoReactNativeFactoryProvider')) {
      const before = src;
      src = src.replace(
        /class AppDelegate: ExpoAppDelegate \{/,
        'class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {',
      );
      if (src === before) {
        throw new Error('withSceneLifecycle: AppDelegate class declaration not found');
      }
    }

    // 2. La ventana ahora la crea ExpoAppSceneDelegate; quitar el arranque desde el AppDelegate
    const windowBlock =
      /#if os\(iOS\) \|\| os\(tvOS\)\s*window = UIWindow\(frame: UIScreen\.main\.bounds\)\s*factory\.startReactNative\([\s\S]*?\)\s*#endif\n?/;
    if (windowBlock.test(src)) {
      src = src.replace(
        windowBlock,
        '    // La ventana y startReactNative los maneja ExpoAppSceneDelegate (ciclo de vida UIScene)\n',
      );
    } else if (src.includes('UIWindow(frame: UIScreen.main.bounds)')) {
      throw new Error('withSceneLifecycle: could not remove the AppDelegate window setup');
    }

    cfg.modResults.contents = src;
    return cfg;
  });
}

module.exports = function withSceneLifecycle(config) {
  return withSceneAppDelegate(withSceneManifest(config));
};
