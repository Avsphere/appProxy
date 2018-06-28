$(function() {
  const configData = configDiscoveryData;

  function init() {
    let configApi = new ConfigApi(configData);
    let analyzer = new Analyzer( configApi );
    let viewBuilder = new ViewBuilder( analyzer.results )
    viewBuilder.buildView()



  }



  init();








})
