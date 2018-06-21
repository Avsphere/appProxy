//This is tightly coupled with the analyzer class, splitting for readability
class HtmlGenerator {
  constructor( analysis ) {
    this.analysis = analysis;
    if ( analysis.type === 'windows' ) {
      console.log(analysis)
      this.buildWindowsView(analysis);
    } else {
      throw new Error('Did not recognize analysis type');
    }
  }

  setBaseInfo() {
    $('#serverName').text( "Server name: " + this.analysis.serverName )
    $('#osInfo').text( "Os: " + this.analysis.os );
    $('#iisVersion').text( "IIS Version: " + this.analysis.serverVersion );
  }
  buildWindowsView( analysis ) {
    function buildTable( analyzedSites ) {
      function createRow( site ) {
        let html = `<tr class='clickable-row'>
                      <td class="siteName">${site.siteName}</td>
                      <td>${site.readinessScore}</td>
                      <td>${site.confidence}</td>
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
                      <tbody>`;
      analyzedSites.forEach( (site) => {
        html += createRow(site);
      })
      html += `</tbody></table>`
      return html;
    }
    function buildDetailedView( clickedSite ) {
      let siteName = clickedSite
      function createListItem( check ) {
        let html = '';
        console.log("This is the check", check);
        return html;
      }
      function createSiteSection(){
        let html = '<div class="list-group" id="detailedConfig">';
        html += '</div>'
        let listItemHtml = clickedSite.checks.map( (check) => {
          return createListItem( check )
        })

      }
      function createAppSection(){}

      createSiteSection();

    }
    function findSite( siteName ) {
      let found = this.analysis.analyzedSites.find( (a) => {
        if ( a.siteName === siteName ) {
          return a;
        }
      })
      return found;
    }
    function initHandles() {
      $('.clickable-row').on('click', (el) => {
        let siteName = $(el.target).parent().find('.siteName').text();
        let analyzedSite = findSite( siteName );
        $('#detailedConfig').html( this.buildDetailedView( analyzedSite ) );

      })
    }

    let htmlTable = buildTable( analysis.analyzedSites )
    $('#siteTable').append(htmlTable)
    this.setBaseInfo();
    initHandles();
  }




}
