class ViewBuilder {
  constructor ( analysis ) {
    this.analysis = analysis;
    this.buildView();
  }

  setBaseInfo(){
    $('#serverName').text( "Server name: " + this.analysis.serverName )
    $('#osInfo').text( "Os: " + this.analysis.os );
    $('#iisVersion').text( "IIS Version: " + this.analysis.serverVersion );
  }

  buildTable() {
    function createRow( site ) {
      let readinessScore = site.readinessScore.toPrecision(3);
      let html = `<tr class='clickable-row'>
                    <td class="siteName">${site.siteName}</td>
                    <td>${readinessScore}</td>
                    <td>${site.confidence}</td>
                  </tr>`
      return html;
    }
    let html = `<table class="table">
                    <thead>
                      <tr>
                        <th>Site Name</th>
                        <th>Readiness Score (%) </th>
                        <th>Confidence (%) </th>
                      </tr>
                    </thead>
                    <tbody>`;
    this.analysis.analyzedSites.forEach( (site) => {
      html += createRow(site);
    })
    html += `</tbody></table>`
    return html;
  }

  buildDetailedView( clickedSite ) {
    function buildListItem( check ) {
      let html = '';
      if ( check.status === 'correct' ) {
        html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${check.name} : ${check.value}<span class="badge badge-primary badge-pill">✓</span></a>`
      } else {
          html = `<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="${check.details}">${check.name} : ${check.value}<span class="badge badge-danger badge-pill">X</span></a>`
      }
      return html;
    }
    function buildSiteSection() {
      let readinessScore = clickedSite.readinessScore.toPrecision(3);
      let html = `<h3 class="sectionHeader">Site: ${clickedSite.siteName} <span style="float:right"> Readiness Score: ${readinessScore} </span></h3>`;
      clickedSite.checks.forEach( (check) =>{
        html += buildListItem(check);
      })
      return html;
    }
    function buildAppsSection() {
      let html = '';
      clickedSite.analyzedApps.forEach( (app) => {
        let appData = app.app,
            readinessScore = app.readinessScore.toPrecision(3);
        html += `<h3 class="sectionHeader">App: ${appData.appName} <span style="float:right"> Readiness Score: ${readinessScore} </span></h3>`;
        app.checks.forEach( (check) => {
          html += buildListItem(check);
        })
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

  spawnModal( title, body) {
    if ( title && body ) {
      $('.modal-title').text(title);
      $('#modalBody').text(body);
    }
    $('#detailModal').modal({})
  }

  handles() {
    let that = this;
    function setDetailedItemsHandle() {
      $('.detailedItem').on('click', (el) => {
        let modalTitle = $(el.target).text(),
            modalBody = $(el.target).attr('data-details');
        //making the checkmark or Xmark spaced differently
        modalTitle = modalTitle.substring(0, modalTitle.length-1) + '  ' + modalTitle[modalTitle.length-1];
        console.log(modalBody)
        that.spawnModal( modalTitle, modalBody );
      })
    }
    $('.clickable-row').on('click', (el) => {
      let siteName = $(el.target).parent().find('.siteName').text();
      let analyzedSite = this.findSite( siteName );
      $('#detailedView').html( this.buildDetailedView( analyzedSite ) );
      setDetailedItemsHandle();
    })
  }

  buildView(){
    console.log(this.analysis)
    let htmlTable = this.buildTable( this.analysis.analyzedSites )
    $('#siteTable').append(htmlTable)
    this.setBaseInfo();
    this.handles();
  }


}
