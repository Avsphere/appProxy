class ViewBuilder {
  constructor ( analysis ) {
    this.analysis = analysis;
  }

  setBaseServerInfo(){
    $('#serverName').text( "Server name: " + this.analysis.serverName )
    $('#osInfo').text( "OS: " + this.analysis.os );
    $('#iisVersion').text( "IIS Version: " + this.analysis.serverVersion );
  }
  buildTable() {
    let that = this;
    function determineProgressColor( score ) {
      if ( score < 50 ) { return 'bg-danger'; }
      else if ( score < 75 ) { return 'amber bg-success'; }
      else { return ''; }
    }
    function createRow( analyzedSite ) {
      let readinessScore = analyzedSite.readinessScore.toPrecision(3),
          readinessText = readinessScore,
          appCount = analyzedSite.analyzedApps.length,
          bindings = analyzedSite.site.bindings;
      let url = bindings.protocol + '://' + bindings.hostName + ':' + bindings.port;
      if ( bindings.hostName.length === 0 ) { url = ''; }
      let progressColor = determineProgressColor( readinessScore );
      if ( !analyzedSite.site.authentication.hasOwnProperty('windowsAuthentication') ) {
        progressColor = 'dull bg-success';
        readinessScore = 100;
        readinessText = 'Non WIA'
      }
      let progressHtml = `
      <div class="progress">
        <div class="progress-bar ${progressColor} progress-bar-striped" role="progressbar" aria-valuenow="${readinessScore}%" aria-valuemin="0" aria-valuemax="100" style="width:${readinessScore}%">
          ${readinessText}
        </div>
      </div>`
      let html = `<tr class='clickable-row'>
                    <td class="siteName">${analyzedSite.siteName}</td>
                    <td>${progressHtml}</td>
                    <td>${appCount}</td>
                    <td><a href="${url}" target="_blank">${url}</a> </td>
                    <td class="open-icon"> <i class="fas fa-angle-right"></i> </td>
                  </tr>`
      return html;
    }
    let html = `<table class="table table">
                    <thead>
                      <tr>
                        <th>IIS Site Name</th>
                        <th>Readiness (%) </th>
                        <th>Child Applications</th>
                        <th>Defined Hostname</th>
                        <th> </th>
                      </tr>
                    </thead>
                    <tbody>`;

    this.analysis.analyzedSites
    .sort( (a,b) => {
      return b.readinessScore - a.readinessScore
    })
    .forEach( (site) => {
      html += createRow(site);
    })
    html += `</tbody></table>`
    return html;
  }
  orderChecks( checks ) {
    let c = checks.sort( (a,b) => {
      if ( a.status === b.status ) { return 0; }
      else if ( a.status === 'correct' ) { return -1; }
      else if ( a.status === 'warning' && b.status === 'incorrect' ) { return -1; }
      else { return 1; }
    })
  }
  buildSummaryView( clickedSite ) {
    let that = this;
    function buildListItem( check ) {
      let html = '',
          addColon = check.value !== '' ? ' : '  : '',
          itemText = check.name + addColon + check.value;
      if ( check.status === 'correct' ) {
        html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${itemText}<span class="badge badge-primary badge-pill">✓</span></a>`
      } else if ( check.status === 'warning' ) {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${itemText}<span class="badge badge-warning badge-pill"><i class="fas fa-question"></i></span></a>`
      } else {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${itemText}<span class="badge badge-danger badge-pill"><i class="fas fa-exclamation"></i></span></a>`
      }
      return html;
    }

    function buildSiteSection() {
      function buildSiteTitle() {
        let readinessScore = clickedSite.readinessScore.toPrecision(3);
        if ( !clickedSite.site.authentication.hasOwnProperty('windowsAuthentication') ){
          readinessScore = 'Non WIA'
        }
        let html = `
        <div class="row">
          <div class="col" style="white-space: nowrap;">
            <h3>Site: <span class="sectionTitle"> ${clickedSite.siteName} </span> </h3>
          </div>
          <div class="col" style="white-space: nowrap;">
            <h3>Readiness Score: <span class="sectionTitle"> ${readinessScore} </span> </h3>
          </div>
          </div>`;
          return html;
      }
      let html = `<div class="siteSection">`;
      html += buildSiteTitle();
      that.orderChecks(clickedSite.checks);
      clickedSite.checks.forEach( (check) => {
        html += buildListItem(check);
      })
      html += '</div>';
      return html;
    }
    function buildAppsSection() {
      //7/6 there is a div not being closed? Must be careful here as I am storing the app data in this div then doing a parent search to find
      function buildAppTitle( app ) {
        let appData = app.app,
            readinessScore = app.readinessScore.toPrecision(3);
        let html = `
        <div class="row" data-appName="${appData.appName}">
          <div class="col" style="white-space: nowrap;">
            <h5 class="sectionHeader">App: <span class="sectionTitle"> ${appData.appName} </span> </h5>
          </div>
          <div class="col" style="white-space: nowrap;">
            <h5 class="sectionHeader">Readiness Score: <span class="sectionTitle"> ${readinessScore} </span> </h5>
          </div>
          </div>`;
          return html;
      }
      let html = '';
      clickedSite.analyzedApps.forEach( (app) => {
        html += '<div class="appSection">';
        html += buildAppTitle( app );
        //html += `<div class="appSection" data-appName="${appData.appName}"> <h5 class="sectionHeader">App: ${appData.appName} <span style="float:right"> Readiness Score: ${readinessScore}</span></h5>`;
        that.orderChecks(app.checks);
        app.checks.forEach( (check) => {
          html += buildListItem(check);
        })
        html += '</div>'
      })
      return html;
    }
    let html = buildSiteSection();
    html += buildAppsSection();
    return html;
  }
  findSite( siteName ) {
    let found = this.analysis.analyzedSites.find( (a) => {
      if ( a.siteName === siteName ) {
        return a;
      }
    })
    return found;
  }
  buildTutorial() {
    let html = `<div style="margin-left: 10%;">
                  <a href="./documentation.html" style="color:black;"> <h3> About This Tool</h3> </a>
                  <p>If this is your first time using this tool it is highly recommended to thoroughly read the documentation</p>
                  <p> Click a site in the table to the left to reveal its configuration settings in the context of Application Proxy</p>
                  <p> Once a site has been clicked you can select one of the list items for a more detailed view / publication script </p>
                  <p>Use the readiness heuristic score to quickly gauge what sites or apps likely need the most work.</p>
                </div>`
    return html;
  }
  spawnModal( siteOrApp , type) {
    function siteModalBody() {
      let site = siteOrApp.site;
      function buildSpnIdentityTable() {
        function createRow( spnNumber, spnValue ) {
          let html = `<tr class='clickable-row'>
                        <td>${site.appPool.username}</td>
                        <td>${spnValue}</td>
                      </tr>`
          return html;
        }
        let html = `<table class="table" id="spnTable">
                        <thead>
                          <tr>
                            <th>Configured Identity</th>
                            <th>Existing SPNs</th>
                          </tr>
                        </thead>
                        <tbody>`;
        if ( site.appPool.spns ) {
          site.appPool.spns.forEach( (spn, i) => {
            html += createRow(i, spn);
          })
          html += `</tbody></table>`
          return html;
        } else {
          return '';
        }


      }
      function buildBindingsTable() {
        let bindings = site.bindings,
            addressText = bindings.address === '*' ? '* (Listening on all IPs)' : bindings.address;

        let html = `<table class="table" id="bindingsTable">
                        <thead>
                          <tr>
                            <th>Site Bindings</th>
                            <th></th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr class='clickable-row'>
                              <td>Port:</td>
                              <td>${bindings.port}</td>
                          </tr>
                          <tr class='clickable-row'>
                              <td>Address: </td>
                              <td>${addressText}</td>
                          </tr>
                          <tr class='clickable-row'>
                              <td>Hostname: </td>
                              <td>${bindings.hostName}</td>
                          </tr>
                        </tbody></table>
                        `;
        return html;
      }
      function buildSiteCheckTable() {
        let createdCheckCount = 0;
        function createCheckRow( check ) {
          let html = '';
          if ( check.status !== 'correct' ) {
            createdCheckCount++;
            let checkStatusHtml = `<span class="badge badge-warning badge-pill"><i class="fas fa-question"></i></i></span>`;
            if ( check.status === 'incorrect' ) {
              checkStatusHtml = `<span class="badge badge-danger badge-pill"><i class="fas fa-exclamation"></i></span>`;
            }
            html = `<tr class='clickable-row'>
                          <td>${check.name}</td>
                          <td>${checkStatusHtml}</td>
                          <td>${check.detailsHtml}</td>
                        </tr>`
          }
          return html;
        }
        let checks = siteOrApp.checks;
        let html = `<table class="table" id="checksTable">
                        <thead>
                          <tr>
                            <th>Site Check</th>
                            <th>Status</th>
                            <th>Possible Solution</th>
                          </tr>
                          </thead>
                          <tbody>
                        `;
        checks.forEach( (check) => {
          html += createCheckRow( check );
        })

        html += '</tbody></table>';
        if ( createdCheckCount === 0 ) { html = '';}
        return html;
      }
      function buildInfoSection() {
        let html = '<div class="modalInfo">'
        html += '<h3>General Info</h3>'
        html += `<p> Important info</p>`;
        html += '</div>'
        return html;
      }
      function buildAppPoolTable() {
        let identityClassRow = '';
        if ( site.appPool.identityObjectClass ) {
          identityClassRow = `<tr class='clickable-row'>
                                    <td>Identity Object Class</td>
                                    <td>${site.appPool.identityObjectClass}</td>
                              </tr>`
        }
        let html = `<table class="table" id="appPoolTable">
                        <thead>
                          <tr>
                            <th>App Pool Settings</th>
                            <th></th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr class='clickable-row'>
                              <td>App Pool Name</td>
                              <td>${site.appPool.name}</td>
                          </tr>
                          <tr class='clickable-row'>
                              <td>Identity Type</td>
                              <td>${site.appPool.identityType}</td>
                          </tr>
                          ${identityClassRow}
                          <tr class='clickable-row'>
                              <td>Identity Value</td>
                              <td>${site.appPool.username}</td>
                        </tr>
                        </tbody></table>
                        `;
        return html;
      }
      //let html = buildInfoSection();
      let html = buildBindingsTable();
      html += buildAppPoolTable();
      html += buildSpnIdentityTable();
      html += buildSiteCheckTable();
      return html;
    }
    function appModalBody() {
      let app = siteOrApp.app;
      function buildSpnIdentityTable() {
        function createRow( spnNumber, spnValue ) {
          let html = `<tr class='clickable-row'>
                        <td>${app.appPool.username}</td>
                        <td>${spnValue}</td>
                      </tr>`
          return html;
        }
        let html = `<table class="table" id="spnTable">
                        <thead>
                          <tr>
                          <th>Configured Identity</th>
                          <th>Existing SPNs</th>
                          </tr>
                        </thead>
                        <tbody>`;
        app.appPool.spns.forEach( (spn, i) => {
          html += createRow(i, spn);
        })
        html += `</tbody></table>`
        return html;
      }
      function buildAppPoolTable() {
        let identityClassRow = '';
        if ( app.appPool.identityObjectClass ) {
          identityClassRow = `<tr class='clickable-row'>
                                    <td>Identity Object Class</td>
                                    <td>${app.appPool.identityObjectClass}</td>
                              </tr>`
        }
        let html = `<table class="table" id="appPoolTable">
                        <thead>
                          <tr>
                            <th>App Pool Settings</th>
                            <th></th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr class='clickable-row'>
                              <td>App Pool Name</td>
                              <td>${app.appPool.name}</td>
                          </tr>
                          <tr class='clickable-row'>
                              <td>Identity Type</td>
                              <td>${app.appPool.identityType}</td>
                          </tr>
                          ${identityClassRow}
                          <tr class='clickable-row'>
                              <td>Identity Value</td>
                              <td>${app.appPool.username}</td>
                        </tr>
                        </tbody></table>
                        `;
        return html;
      }
      function buildAppCheckTable() {
        let createdCheckCount = 0;
        function createRow( check ) {
          let html = '';
          if ( check.status !== 'correct' ) {
            createdCheckCount++;
            let checkStatusHtml = `<span class="badge badge-warning badge-pill"><i class="fas fa-question"></i></span>`;
            if ( check.status === 'incorrect' ) {
              checkStatusHtml = `<span class="badge badge-danger badge-pill"><i class="fas fa-exclamation"></i></span>`;
            }
            html = `<tr class='clickable-row'>
                      <td>${check.name}</td>
                      <td>${checkStatusHtml}</td>
                      <td>${check.detailsHtml}</td>
                        </tr>`
          }
          return html;
        }
        let checks = siteOrApp.checks;
        let html = `<table class="table" id="checksTable">
                        <thead>
                          <tr>
                            <th>App Check</th>
                            <th>Status</th>
                            <th>Possible Solution</th>
                          </tr>
                          </thead>
                          <tbody>
                        `;
        checks.forEach( (check) => {
          html += createRow( check );
        })

        html += '</tbody></table>';
        if ( createdCheckCount === 0 ) { html = '';}
        return html;
      }
      function buildInfoSection() {
        let html = '<div class="modalInfo">'
        html += '<h3> Info for App </h3>'
        html += '<p> This is important info about App.... </p>'
        html += '</div>'
        return html;
      }
      //let html = buildInfoSection();
      let html = buildAppPoolTable();
      html += buildSpnIdentityTable();
      html += buildAppCheckTable();
      return html;
    }

    if ( type === 'site' ) {
      let site = siteOrApp.site,
          modalTitle = "Site Name: " + site.siteName;
      $('.modal-title').text(modalTitle)
      $('.modal-body').html( siteModalBody() )
    } else if ( type === 'app' ) {
      let app = siteOrApp.app,
          modalTitle = "Application name: " + app.appName;
      $('.modal-title').text(modalTitle)
      $('.modal-body').html( appModalBody() )
    }
    $('#detailModal').data('currentData', siteOrApp);
    $('#detailModal').modal({})
  }
  handles() {
    let that = this;
    function setDetailedItemsHandle(){
      $('.detailedItem').on('click', (el) => {
        let parent = $(el.target).parent(),
            siteContext = $('#detailedView').data('data'),
            analyzedApps = siteContext.analyzedApps;
        let siteOrApp, type;
        if ( parent.hasClass('appSection') ) {
          let appName = parent.find('.row').attr('data-appName');
          analyzedApps.find( (a) => {
            let currApp = a.app.appName;
            if ( currApp === appName) {
              siteOrApp = a;
              type = 'app';
            }
          })
        } else {
          siteOrApp = siteContext;
          type = 'site'
        }
          that.spawnModal( siteOrApp , type);
      })
    }
    function toggleRow( clickedRow ) {
      //first reset current selection
      let tableRows = $('#siteTable').find('tr').toArray(),
          iconCol = $(clickedRow).find('.open-icon');

      if ( $(clickedRow).hasClass('table-primary') ) {
        //The clicked row is currently open
        let iconCol = $(clickedRow).find('.open-icon');
        iconCol.html('<i class="fas fa-angle-right"></i>')
        $(clickedRow).removeClass('table-primary');
        $('#detailedView').fadeOut('fast', function() {
          $('#detailedView').html( that.buildTutorial() )
            $('#detailedView').fadeIn();
        });


      } else {
        tableRows.forEach( (row) => {
          if ( $(row).hasClass('table-primary') ) {
            let iconCol = $(row).find('.open-icon');
            iconCol.html('<i class="fas fa-angle-right"></i>')
            $(row).removeClass('table-primary')
          }
        })
        $(clickedRow).addClass('table-primary');
        $(iconCol).html('<i class="fas fa-angle-left"></i>')
      }






    }
    function download(filename, text) {
      let element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
    $('#autoPubBtn').on('click', (el) => {
      window.location.href = './autoPub.html'
    })
    $('#downloadJson').on('click', (el) => {
      let currentData = $('#detailModal').data('currentData'),
          siteOrAppName = currentData.siteName || currentData.app.appName,
          filename = siteOrAppName.split(' ').join('_') + '.json',
          jsonData = JSON.stringify(currentData);
      download(filename, jsonData);
    })
    $('.clickable-row').on('click', (el) => {
      let clickedRow = $(el.target).closest('.clickable-row'),
          siteName = clickedRow.find('.siteName').text(),
          analyzedSite = this.findSite( siteName );
      if ( clickedRow)
      toggleRow( clickedRow )
      $('#detailedView').html( this.buildSummaryView( analyzedSite ) );
      $('#detailedView').data('data', analyzedSite);
      setDetailedItemsHandle( analyzedSite );
    })

    $(window).on('resize', (el) => {
      that.resizeModal();
    })

  }
  resizeModal() {
    let maxModalHeight = $(window).height() - 200;
    $('#detailModal .modal-body').css('max-height', maxModalHeight + 'px')
  }
  buildView() {
    let htmlTable = this.buildTable( this.analysis.analyzedSites );
    $('#siteTable').append(htmlTable)
    this.setBaseServerInfo();
    $('#detailedView').html( this.buildTutorial() )
    this.resizeModal();
    this.handles();
  }
  buildHeadlessView() {
    function rebuildBody() {
      let baseHtml = `<main role="main" class="container-fluid">
            <div class="modal" id="detailModal" tabindex="-1" role="dialog" aria-hidden="true">
              <div class="modal-dialog modal-dialog-centered" role="document" style="max-width:800px">
                <div class="modal-content">
                  <div class="modal-header">
                    <h1 class="modal-title">Modal title</h1>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true">&times;</span>
                    </button>
                  </div>
                  <div class="modal-body" style="overflow-y:scroll;">
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-primary" id="downloadJson">Download JSON <i class="fas fa-download"></i></button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="baseInfo">
              <h1 class="mt-5" id="serverName"></h1>
              <h5 id="iisVersion"></h5>
              <h5 id="osInfo"></h5>
            </div>
            <br>
            <br>
            <div class="container" style="max-width:1400px; margin-top:2%">
              <div class="row">
                <div class="col-sm">
                  <div id="siteTable">
                    <h2>Discovered Sites</h2>
                  </div>
                  <br/>
                  <div>
                    <h4>Ready to Automate Publication?</h4>
                    <button type="button" class="btn btn-primary" id="autoPubBtn">Generate Publication Scripts <i class="fas fa-arrow-right"></i></button>
                  </div>
                </div>
                <div class="col-sm" id="rightColumn">
                  <div style="margin-left:2%">
                    <div class="list-group" id="detailedView">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
          <footer class="footer">
            <div class="container" style="height:200px">
            </div>
          </footer>`

        $('#headlessContainer').html( baseHtml )
    }

    rebuildBody()
    let htmlTable = this.buildTable( this.analysis.analyzedSites )
    $('#siteTable').append(htmlTable)
    $('#detailedView').html( this.buildTutorial() )
    this.setBaseServerInfo();
    this.handles();
  }
}
