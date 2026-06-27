const __uniConfig = {"pages":[],"globalStyle":{"navigationBarTextStyle":"black","navigationBarTitleText":"AI 助手","navigationBarBackgroundColor":"#FFFFFF","backgroundColor":"#F5F5F5"},"appname":"iosweb","compilerVersion":"5.07","entryPagePath":"pages/index/index","entryPageQuery":"","realEntryPagePath":"","themeConfig":{}};
__uniConfig.getTabBarConfig = () =>  {return undefined};
__uniConfig.tabBar = __uniConfig.getTabBarConfig();
const __uniRoutes = [{"path":"pages/index/index","meta":{"isQuit":true,"isEntry":true,"navigationBarTitleText":"AI 助手"}},{"path":"pages/ai-chat/ai-chat","meta":{"navigationBarTitleText":"AI 助手 - 智能聊天"}}].map(uniRoute=>(uniRoute.meta.route=uniRoute.path,__uniConfig.pages.push(uniRoute.path),uniRoute.path='/'+uniRoute.path,uniRoute)).concat(typeof __uniSystemRoutes !== 'undefined' ? __uniSystemRoutes : []);

