package id.app.guardian

import android.app.Application
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.soloader.SoLoader
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping

// TikTok SDK
import com.tiktok.TikTokBusinessSdk
import com.tiktok.TikTokBusinessSdk.TTConfig
import com.tiktok.appevents.base.TTBaseEvent

// React Native 桥接
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.NativeModule
import com.facebook.react.uimanager.ViewManager

// ========== TikTok Native Module ==========
class TikTokModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "TikTokModule"

    @ReactMethod
    fun trackEvent(eventName: String, properties: ReadableMap?) {
        try {
            val builder = TTBaseEvent.newBuilder(eventName)
            properties?.toHashMap()?.forEach { (key, value) ->
                builder.addProperty(key, value.toString())
            }
            TikTokBusinessSdk.trackTTEvent(builder.build())
        } catch (e: Exception) {
            Log.e("TikTokModule", "❌ Event error: ${e.message}")
        }
    }

    @ReactMethod
    fun trackPurchase(price: Double, currency: String, eventName: String, properties: ReadableMap?) {
        try {
            val builder = TTBaseEvent.newBuilder(eventName)
                .addProperty("value", price)
                .addProperty("currency", currency)
            properties?.toHashMap()?.forEach { (key, value) ->
                builder.addProperty(key, value.toString())
            }
            TikTokBusinessSdk.trackTTEvent(builder.build())
        } catch (e: Exception) {
            Log.e("TikTokModule", "❌ Purchase error: ${e.message}")
        }
    }
}

class TikTokPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(TikTokModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
// ==========================================

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override fun getPackages(): MutableList<ReactPackage> =
            PackageList(this).packages.apply {
              add(TikTokPackage())
            }

        override fun getJSMainModuleName(): String = "index"

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override fun onCreate() {
    super.onCreate()
      SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      load()
    }

    // === TIKTOK SDK === //
    // Use the token-free initializer, matching the GUVN Flutter native bridge.
    val ttConfig = TTConfig(this)
        .setAppId(BuildConfig.TIKTOK_APP_ID)
        .setTTAppId(BuildConfig.TIKTOK_TIKTOK_APP_ID)

    TikTokBusinessSdk.initializeSdk(ttConfig, object : TikTokBusinessSdk.TTInitCallback {
        override fun success() {
            Log.d("MainApplication", "[TikTok] ✅ TikTok SDK initialized successfully")
        }

        override fun fail(code: Int, msg: String) {
            Log.e("MainApplication", "[TikTok] ❌ TikTok SDK init failed: code=$code, msg=$msg")
        }
    })
    // === TIKTOK SDK === //
  }

  override fun registerReceiver(receiver: BroadcastReceiver?, filter: IntentFilter?): Intent? {
    if (Build.VERSION.SDK_INT >= 34 && applicationInfo.targetSdkVersion >= 34) {
      return super.registerReceiver(receiver, filter, Context.RECEIVER_EXPORTED)
    } else {
      return super.registerReceiver(receiver, filter)
    }
  }
}
