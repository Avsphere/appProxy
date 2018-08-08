$(function() {
  const configData = configDiscoveryData;
  function init() {
    squares()
    $('#customFile').on('change', function() {
      if ( document.getElementById('customFile').files.length === 1 ) {
        let reader = new FileReader();
        reader.onload = function(e) {
          let jsonData = reader.result;
          processData( jsonData );
        }
        reader.readAsText( document.getElementById('customFile').files[0] )
      } else {
        console.log("it appears the value is unchanged");
      }
    })
  }
  function processData( configData ) {
    let parsedData = JSON.parse(configData);
    let configApi = new ConfigApi(parsedData);
    let analyzer = new WindowsAnalysis( configApi );
    let viewBuilder = new ViewBuilder( analyzer.results )
    viewBuilder.buildHeadlessView()
  }



  init();








})
