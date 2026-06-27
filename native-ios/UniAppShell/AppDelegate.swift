import UIKit
import DCloudUniappRuntime

@main
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {

        // 初始化 uni-app x SDK
        UniAppXSDK.initSDK()

        // 集成生命周期
        UniAppXSDK.applicationDidFinishLaunchingWithOptions(application, launchOptions)

        // 创建窗口
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.backgroundColor = .white

        let vc = ViewController()
        let nav = UINavigationController(rootViewController: vc)
        window?.rootViewController = nav
        window?.makeKeyAndVisible()

        return true
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        UniAppXSDK.didRegisterForRemoteNotifications(deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        UniAppXSDK.didFailToRegisterForRemoteNotifications(error)
    }

    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        UniAppXSDK.applicationDidReceiveRemoteNotificationCompletionHandler(application, userInfo, completionHandler)
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
        return UniAppXSDK.applicationOpenURLOptions(app, url, options)
    }

    func applicationWillResignActive(_ application: UIApplication) {
        UniAppXSDK.applicationWillResignActive(application)
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        UniAppXSDK.applicationDidBecomeActive(application)
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        UniAppXSDK.applicationDidEnterBackground(application)
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        UniAppXSDK.applicationWillEnterForeground(application)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        return UniAppXSDK.applicationContinueUserActivityRestorationHandler(application, userActivity, restorationHandler)
    }
}
