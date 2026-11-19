#import "AppDelegate.h"

// ADD THIS
#if RCT_DEV
#import <React/RCTDevLoadingView.h>
#endif
// TILL HERE
#import "RNSplashScreen.h"
#import <Firebase.h>
#import <GoogleMaps/GoogleMaps.h>
#import <RNCConfig.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <TikTokBusinessSDK/TikTokBusinessSDK.h>

#import <Firebase.h>

static NSString *const kRNConcurrentRoot = @"concurrentRoot";

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application
    didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // === FIREBASE === //
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }
  // === FIREBASE === //

  // === TIKTOK SDK === //
  // Use the token-free initializer, matching the GUVN Flutter native bridge.
  TikTokConfig *config = [[TikTokConfig alloc] initWithAppId:@"1623324002"
                                                   tiktokAppId:@"7657796846998454293"];
  [TikTokBusiness initializeSdk:config
              completionHandler:^(BOOL success, NSError * _Nullable error) {
      if (success) {
          NSLog(@"[TikTok] ✅ TikTok SDK initialized successfully");
      } else {
          NSLog(@"[TikTok] ❌ TikTok SDK init failed: %@", error.localizedDescription);
      }
  }];
  // === TIKTOK SDK === //

  NSString *googleMapsApiKey = [RNCConfig envFor:@"GOOGLE_MAPS_API_KEY"];
  [GMSServices provideAPIKey:googleMapsApiKey];

  self.moduleName = @"GuardianID";
  // You need to call the superclass method and create the root view properly
  BOOL result = [super application:application
      didFinishLaunchingWithOptions:launchOptions];

  // === RNSPLASH === //
  [RNSplashScreen showSplash:@"LaunchScreen"
                  inRootView:self.window.rootViewController.view];
  // === RNSPLASH === //

  // Request IDFA authorization (iOS 14+)
  [self requestIDFA];

  return result;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge {
  return [self getBundleURL];
}

- (NSURL *)getBundleURL {
#if DEBUG
  return
      [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main"
                                 withExtension:@"jsbundle"];
#endif
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:
                (NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options {
  return [RCTLinkingManager application:application
                                openURL:url
                                options:options];
}

- (BOOL)application:(UIApplication *)application
    continueUserActivity:(nonnull NSUserActivity *)userActivity
      restorationHandler:
          (nonnull void (^)(NSArray<id<UIUserActivityRestoring>> *_Nullable))
              restorationHandler {
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

#pragma mark - TikTok IDFA Authorization

- (void)requestIDFA {
    if (@available(iOS 14, *)) {
        [TikTokBusiness requestTrackingAuthorizationWithCompletionHandler:^(NSUInteger status) {
            NSLog(@"[TikTok] IDFA authorization status: %lu", (unsigned long)status);
        }];
    }
}


@end
