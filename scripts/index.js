$(function() {
  const configData = configDiscoveryData;
  function init() {
    let configApi = new ConfigApi(configData);
    let analyzer = new WindowsAnalysis( configApi );
    let viewBuilder = new ViewBuilder( analyzer.results )
    viewBuilder.buildView()
  }
  init();
})
