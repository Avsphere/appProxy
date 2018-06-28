class ViewBuilder {
  constructor ( analysis ) {
    this.analysis = analysis;
  }

  setBaseInfo(){
    $('#serverName').text( "Server name: " + this.analysis.serverName )
    $('#osInfo').text( "Os: " + this.analysis.os );
    $('#iisVersion').text( "IIS Version: " + this.analysis.serverVersion );
  }

  buildTable() {
    let that = this;
    function createRow( site ) {
      let readinessScore = site.readinessScore.toPrecision(3),
          appCount = site.analyzedApps.length;
      let html = `<tr class='clickable-row'>
                    <td class="siteName">${site.siteName}</td>
                    <td>${readinessScore}</td>
                    <td>${appCount}</td>
                  </tr>`
      return html;
    }
    let html = `<table class="table">
                    <thead>
                      <tr>
                        <th>Site Name</th>
                        <th>Readiness (%) </th>
                        <th>Nested Applications</th>
                      </tr>
                    </thead>
                    <tbody>`;
    this.analysis.analyzedSites.forEach( (site) => {
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
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${check.name} : ${check.value}<span class="badge badge-warning badge-pill">Warning!</span></a>`
      } else {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${check.name} : ${check.value}<span class="badge badge-danger badge-pill">X</span></a>`
      }
      return html;
    }
    function buildSiteSection() {
      let readinessScore = clickedSite.readinessScore.toPrecision(3);
      let html = `<div class="siteSection"><h3 class="sectionHeader">Site: ${clickedSite.siteName} <span style="float:right"> Readiness Score: ${readinessScore} </span></h3>`;
      that.orderChecks(clickedSite.checks);
      clickedSite.checks.forEach( (check) => {
        html += buildListItem(check);
      })
      html += '</div>';
      return html;
    }
    function buildAppsSection() {
      let html = '';
      clickedSite.analyzedApps.forEach( (app) => {
        let appData = app.app,
            readinessScore = app.readinessScore.toPrecision(3);
        html += `<div class="appSection" data-appName="${appData.appName}"> <h3 class="sectionHeader">App: ${appData.appName} <span style="float:right"> Readiness Score: ${readinessScore}</span></h3>`;
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

  populateModal( analyzedSite ) {
    let that = this;
    function setHeader() {

    }
    function buildSpnTable( siteOrApp ) {
      function createRow( spnCount, spnValue ) {
        let html = `<tr class='clickable-row'>
                      <td>SPN: ${spnCount}</td>
                      <td>spnValue</td>
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
      this.analysis.analyzedSites.forEach( (site) => {
        html += createRow(site);
      })
      html += `</tbody></table>`
      return html;
    }
    function infoSection() {
      let html = ''
    }

    $('#detailModal').modal({})
  }

  modalTesting( el ) {
    let parent = $(el.target).parent();
    console.log("parent:", parent);
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
      function buildCheckTable() {
        function createRow( check ) {
          let html = '';
          if ( check.status !== 'correct' ) {
            html = `<tr class='clickable-row'>
                          <td>${check.name}</td>
                          <td>${check.status}</td>
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
        return html;
      }
      function buildInfoSection() {
        let html = '<div class="modalInfo">'
        html += '<h3> Info for site </h3>'
        html += '<p> This is important info about site.... </p>'
        html += '</div>'
        return html;
      }
      let html = buildInfoSection();
      html += buildSpnTable();
      html += buildBindingsTable();
      html += buildCheckTable();
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
      function buildCheckTable() {
        function createRow( check ) {
          let html = '';
          if ( check.status !== 'correct' ) {
            html = `<tr class='clickable-row'>
                          <td>${check.name}</td>
                          <td>${check.status}</td>
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
        return html;
      }
      function buildInfoSection() {
        let html = '<div class="modalInfo">'
        html += '<h3> Info for App </h3>'
        html += '<p> This is important info about App.... </p>'
        html += '</div>'
        return html;
      }
      let html = buildInfoSection();
      html += buildSpnTable();
      html += buildCheckTable();
      return html;
    }

    if ( type === 'site' ) {
      let site = siteOrApp.site;
      $('.modal-title').text(site.siteName)
      $('.modal-body').html( siteModalBody() )
    } else if ( type === 'app' ) {
      let app = siteOrApp.app;
      $('.modal-title').text(app.appName)
      $('.modal-body').html( appModalBody() )
    }

    $('#detailModal').modal({})
  }






  handles() {
    let that = this;
    function setDetailedItemsHandle2( analyzedSite ) {
      $('.detailedItem').on('click', (el) => {
        that.modalTesting( el, analyzedSite );
      })
    }
    function setDetailedItemsHandle3() {
      $('.detailedItem').on('click', (el) => {
        let modalTitle = $(el.target).text(),
            modalBody = $(el.target).attr('data-details');
        //making the checkmark or Xmark spaced differently
        modalTitle = modalTitle.substring(0, modalTitle.length-1) + '  ' + modalTitle[modalTitle.length-1];
        let parent = $(el.target).parent();
        console.log("parent:", parent);
        that.spawnModal( modalTitle, modalBody );
      })
    }
    function setDetailedItemsHandle(){
      $('.detailedItem').on('click', (el) => {
        let parent = $(el.target).parent(),
            siteContext = $('#detailedView').data('data'),
            analyzedApps = siteContext.analyzedApps;
        let siteOrApp, type;
        if ( parent.hasClass('appSection') ) {
          let appName = parent.attr('data-appName');
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
    $('.clickable-row').on('click', (el) => {
      let siteName = $(el.target).parent().find('.siteName').text();
      let analyzedSite = this.findSite( siteName );
      $('#detailedView').html( this.buildSummaryView( analyzedSite ) );
      $('#detailedView').data('data', analyzedSite);
      setDetailedItemsHandle( analyzedSite );
    })
  }

  buildView() {
    console.log(this.analysis)
    let htmlTable = this.buildTable( this.analysis.analyzedSites )
    $('#siteTable').append(htmlTable)
    this.setBaseInfo();
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
                  <hr>
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
    this.setBaseInfo();
    this.handles();

  }


}
