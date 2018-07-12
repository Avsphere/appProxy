class ViewBuilder {
  constructor ( analysis ) {
    this.analysis = analysis;
  }

  setBaseServerInfo(){
    $('#serverName').text( "Server name: " + this.analysis.serverName )
    $('#osInfo').text( "Os: " + this.analysis.os );
    $('#iisVersion').text( "IIS Version: " + this.analysis.serverVersion );
  }
  buildTable() {
    let that = this;
    function determineProgressColor( score ) {
      if ( score < 50 ) { return 'bg-danger'; }
      else if ( score < 70 ) { return 'bg-warning'; }
      else if ( score < 90 ) { return 'bg-success'; }
      else { return ''; }
    }
    function createRow( analyzedSite ) {
      let readinessScore = analyzedSite.readinessScore.toPrecision(3),
          appCount = analyzedSite.analyzedApps.length,
          bindings = analyzedSite.site.bindings;
      let url = bindings.protocol + '://' + bindings.hostName + ':' + bindings.port;
      let progressColor = determineProgressColor( readinessScore );
      let progressHtml = `
      <div class="progress">
        <div class="progress-bar ${progressColor} progress-bar-striped" role="progressbar" aria-valuenow="${readinessScore}%" aria-valuemin="0" aria-valuemax="100" style="width:${readinessScore}%">
          ${readinessScore}
        </div>
      </div>`
      let html = `<tr class='clickable-row'>
                    <td class="open-icon"> <i class="fas fa-plus-circle"></i> </td>
                    <td class="siteName">${analyzedSite.siteName}</td>
                    <td>${progressHtml}</td>
                    <td>${appCount}</td>
                    <td><a href="${url}" target="_blank">${url}</a> </td>
                  </tr>`
      return html;
    }
    let html = `<table class="table table">
                    <thead>
                      <tr>
                        <th> </th>
                        <th>Site Name</th>
                        <th>Readiness (%) </th>
                        <th>Nested Applications</th>
                        <th>Hostname</th>
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
      let html = '';
      if ( check.status === 'correct' ) {
        html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${check.name} : ${check.value}<span class="badge badge-primary badge-pill">✓</span></a>`
      } else if ( check.status === 'warning' ) {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${check.name} : ${check.value}<span class="badge badge-warning badge-pill">Warning</span></a>`
      } else {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${check.name} : ${check.value}<span class="badge badge-danger badge-pill">X</span></a>`
      }
      return html;
    }

    function buildSiteSection() {
      function buildSiteTitle() {
        let readinessScore = clickedSite.readinessScore.toPrecision(3);
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
    let html = `<div style="margin-left: 20%;">
                  <a href="./documentation.html" style="color:black;"> <h3> About This Tool</h3> </a>
                  <p>For more detailed documentation click the link above or the documentation link </p>
                  <p> Click a site in the table to the left to reveal its configuration settings in the context of Application Proxy</p>
                  <p> Once a site has been clicked you can select one of the list items for a more detailed view / publication script </p>
                  <p>Use the readiness score to quickly gauge what sites or apps likely need the most work.</p>


                </div>`
    return html;
  }
  spawnModal( siteOrApp , type) {
    function siteModalBody() {
      let site = siteOrApp.site;
      function buildSpnTable() {
        function createRow( spnNumber, spnValue ) {
          let html = `<tr class='clickable-row'>
                        <td>SPN #${spnNumber}</td>
                        <td>${spnValue}</td>
                      </tr>`
          return html;
        }
        let html = `<table class="table" id="spnTable">
                        <thead>
                          <tr>
                            <th>Found SPNs</th>
                            <th>SPN value</th>
                          </tr>
                        </thead>
                        <tbody>`;
        site.appPool.spns.forEach( (spn, i) => {
          html += createRow(i, spn);
        })
        html += `</tbody></table>`
        return html;
      }
      function buildBindingsTable() {
        let bindings = site.bindings;
        let html = `<table class="table" id="bindingsTable">
                        <thead>
                          <tr>
                            <th>Binding Data</th>
                            <th></th>
                          </tr>
                          </thead>
                          <tbody>
                          <tr class='clickable-row'>
                              <td>Port:</td>
                              <td>${bindings.port}</td>
                          </tr>
                          <tr class='clickable-row'>
                              <td>Hostname: </td>
                              <td>${bindings.hostName}</td>
                          </tr>
                          <tr class='clickable-row'>
                              <td>Address: </td>
                              <td>${bindings.address}</td>
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
            let checkStatusHtml = `<span class="badge badge-warning badge-pill">Warning</span>`;
            if ( check.status === 'incorrect' ) {
              checkStatusHtml = `<span class="badge badge-danger badge-pill">Incorrect</span>`;
            }
            html = `<tr class='clickable-row'>
                          <td>${check.name}</td>
                          <td>${checkStatusHtml}</td>
                          <td>${check.details}</td>
                        </tr>`
          }
          return html;
        }
        let checks = siteOrApp.checks;
        let html = `<table class="table" id="checksTable">
                        <thead>
                          <tr>
                            <th>Check Name</th>
                            <th>Status</th>
                            <th>Tip</th>
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
        html += '<h3> Info for site </h3>'
        html += '<p> This is important info about site.... </p>'
        html += '</div>'
        return html;
      }
      //let html = buildInfoSection();
      let html = buildSpnTable();
      html += buildBindingsTable();
      html += buildSiteCheckTable();
      return html;
    }
    function appModalBody() {
      let app = siteOrApp.app;
      function buildSpnTable() {
        function createRow( spnNumber, spnValue ) {
          let html = `<tr class='clickable-row'>
                        <td>SPN #${spnNumber}</td>
                        <td>${spnValue}</td>
                      </tr>`
          return html;
        }
        let html = `<table class="table" id="spnTable">
                        <thead>
                          <tr>
                            <th>Found SPNs</th>
                            <th>SPN value</th>
                          </tr>
                        </thead>
                        <tbody>`;
        app.appPool.spns.forEach( (spn, i) => {
          html += createRow(i, spn);
        })
        html += `</tbody></table>`
        return html;
      }
      function buildAppCheckTable() {
        let createdCheckCount = 0;
        function createRow( check ) {
          let html = '';
          if ( check.status !== 'correct' ) {
            createdCheckCount++;
            let checkStatusHtml = `<span class="badge badge-warning badge-pill">Warning</span>`;
            if ( check.status === 'incorrect' ) {
              checkStatusHtml = `<span class="badge badge-danger badge-pill">Incorrect</span>`;
            }
            html = `<tr class='clickable-row'>
                          <td>${check.name}</td>
                          <td>${checkStatusHtml}</td>
                          <td>${check.details}</td>
                        </tr>`
          }
          return html;
        }
        let checks = siteOrApp.checks;
        let html = `<table class="table" id="checksTable">
                        <thead>
                          <tr>
                            <th>Check Name</th>
                            <th>Status</th>
                            <th>Tip</th>
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
      let html = buildSpnTable();
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
        console.log("Paerent", parent)
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
        iconCol.html('<i class="fas fa-plus-circle"></i>')
        $(clickedRow).removeClass('table-primary');
        $('#detailedView').fadeOut('fast', function() {
          $('#detailedView').html( that.buildTutorial() )
            $('#detailedView').fadeIn();
        });


      } else {
        tableRows.forEach( (row) => {
          if ( $(row).hasClass('table-primary') ) {
            let iconCol = $(row).find('.open-icon');
            iconCol.html('<i class="fas fa-plus-circle"></i>')
            $(row).removeClass('table-primary')
          }
        })
        $(clickedRow).addClass('table-primary');
        $(iconCol).html('<i class="fas fa-minus-circle"></i>')
      }






    }

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
  }

  buildView() {
    console.log("Analysis", this.analysis)
    let htmlTable = this.buildTable( this.analysis.analyzedSites )
    $('#siteTable').append(htmlTable)
    this.setBaseServerInfo();
    $('#detailedView').html( this.buildTutorial() )
    this.handles();
  }

  buildHeadlessView() {
    function rebuildBody() {
      let baseHtml = `<!-- Begin page content -->
        <main role="main" class="container">
          <div class="modal" id="detailModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document" style="max-width:800px">
              <div class="modal-content">
                <div class="modal-header">
                  <h1 class="modal-title">Modal title</h1>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-info">Generate publish script <i class="fas fa-cloud-upload-alt"></i></button>
                  <button type="button" class="btn btn-primary">Download JSON <i class="fas fa-download"></i></button>
                  <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
              </div>
            </div>
          </div>
          <h1 class="mt-5" id="serverName">Title</h1>
          <h5 id="iisVersion"> IIS : 3.4</h5>
          <h5 id="osInfo"> OS : Windows Data server</h5>
          <br>
          <br>
          <div class="container">
            <div class="row">
              <div class="col-sm">
                <div id="siteTable">
                  <h2>Site View</h2>
                  <p>Click on an element for a closer look!</p>

                </div>
              </div>
              <div class="col-sm">
                <div style="margin-left:2%">
                  <h2>Configuration Summary</h2>
                  <p>Click an item for remediation assitance or if the app / site has a 100% readiness score, click for a publication script!</p>
                  <div class="list-group" id="detailedView">
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>

        <footer class="footer">
          <div class="container">

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
