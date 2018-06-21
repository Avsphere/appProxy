$(function() {
  const configData = configDiscoveryData;
  function HtmlMaster() {
    this.createTable = function( sites ) {
      function createRow( site ) {
        let randomScore = Math.floor( Math.random()*100 ),
            randomConfidence = Math.floor( Math.random()*100 );
            console.log(site.siteName);
        let html = `<tr class='clickable-row'>
                      <td class="siteName">${site.siteName}</td>
                      <td>${randomScore}</td>
                      <td>${randomConfidence}</td>
                    </tr>`
        return html;
      }
      let html = ` <table class="table">
                      <thead>
                        <tr>
                          <th>Site Name</th>
                          <th>Readiness Score (%) </th>
                          <th>Confidence (%) </th>
                        </tr>
                      </thead>
                      <tbody>`
      sites.forEach( (site) => {
        html += createRow(site);
      })
      html += `</tbody></table>`
      return html;
    }
    this.createDetailedView = function( site ) {
      function createListItem( labelName, status ) {
        let html = '';
        if ( status ) {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">${labelName}<span class="badge badge-primary badge-pill">✓</span></a>`
        } else {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">${labelName}<span class="badge badge-danger badge-pill">✖</span></a>`
        }
        return html;

      }
      let html = '<div class="list-group" id="detailedConfig">';
      let authType = site.authenticationConfig;
      if ( authType.hasOwnProperty('windowsAuthentication') ) {
        let appPoolCreds = authType.windowsAuthentication.useAppPoolCredentials;
        let useKernelMode = authType.windowsAuthentication.useKernelMode;
        html += createListItem("Authentication : Windows Integrated", true);
        html += createListItem("Authentication : useAppPoolCredentials", appPoolCreds);
        html += createListItem("Authentication : useKernelMode Integrated", useKernelMode);
      } else {
        html += createListItem("Autentication : Windows Integrated", false)
      }

      if ( site.poolConfig.identityType === "SpecificUser") {
        html += createListItem("App Pool Identity Type: SpecificUser", true);
      } else {
        html += createListItem("App Pool Identity Type: SpecificUser", false);
      }
      html += '</div>'
      return html;


    }

    this.setBaseInfo = function( serverName , iisVersion, osInfo ) {
      $('#serverName').text( "Server name: " + serverName.toLowerCase() )
      $('#osInfo').text( "Os: " + osInfo );
      $('#iisVersion').text( "IIS Version: " + iisVersion );
    }

  }
function findSite( sites, siteName ) {
  let found = sites.find( (a) => {
  	if ( a.siteName === siteName ) {
  		return a;
  	}
  })
  if ( found ) { return found; }
  else { throw new Error("Couldn't find clicked site") }
}

  function demo() {
    let htmlMaster = new HtmlMaster();
    let sites = configData.sites,
        serverName = configData.serverName,
        iisVersion = configData.iisVersion,
        osInfo = configData.os;
    htmlMaster.setBaseInfo( serverName, iisVersion, osInfo );
    $('#siteTable').append( htmlMaster.createTable( sites ) )
    $('.clickable-row').on('click', (el) => {
      let siteName = $(el.target).parent().find('.siteName').text();
      let site = findSite( sites, siteName) ;
      $('#detailedConfig').html( htmlMaster.createDetailedView( site ) );

    })

  }

  function init() {
    let configApi = new ConfigApi(configData);
    let analyzer = new Analyzer( configApi );
    let viewBuilder = new ViewBuilder( analyzer.results )




  }



  //demo();
  init();








})
