import UIKit
import DCloudUniappRuntime

class ViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .white
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        startUniApp()
    }

    func startUniApp() {
        let options = UniAppXSDKStartOptions()
        options.openType = .push
        options.animationType = .auto
        UniAppXSDK.start(options: options)
    }
}
