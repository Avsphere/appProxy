$(function() {
  const configData = configDiscoveryData;
  function initIndex() {
    let configApi = new ConfigApi(configData);
    let analyzer = new WindowsAnalysis( configApi );
    let viewBuilder = new ViewBuilder( analyzer.results )
    viewBuilder.buildView()
  }
  function initAutoPub() {
    let configApi = new ConfigApi(configData);
    let analyzer = new WindowsAnalysis( configApi );
    let autoPublish = new AutoPublish( analyzer.results );
  }
  function initHeadless() {
    let headless = new Headless();
  }
  function init(){
    let path = window.location.href;
    if ( path.includes('autoPub.html') || path.includes('autopub.html') ) {
      initAutoPub()
    } else if ( path.includes('headless.html') ) {
      initHeadless();
    } else {
      initIndex();
    }
  }
  init();
})
