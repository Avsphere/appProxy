$(function() {
  const configData = configDiscoveryData;

  function init() {
    let configApi = new ConfigApi(configData);
    let analyzer = new WindowsAnalysis( configApi );
    let autoPublish = new AutoPublish( analyzer.results )
  }

  init();


})


class AutoPublish {

  constructor( analysisResults ) {
    this.analysis = analysisResults;
    console.log(this.analysis);
    this.initView();
  }


  buildTable() {
    let that = this;
    function determineProgressColor( score ) {
      if ( score < 50 ) { return 'bg-danger'; }
      else if ( score < 70 ) { return 'bg-warning'; }
      else if ( score < 90 ) { return 'bg-success'; }
      else { return ''; }
    }
    function buildSpnDropdown( spns ) {
      if ( spns && spns.length > 0 ) {
        spns = spns.sort().reverse();
        let spnHtml = '';
        spns.forEach( (s) => {
          spnHtml += `<a class="dropdown-item" href="#">${s}</a>`
        })
        let html = `<div class="dropdown spn-dropdown">
                      <button class="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        ${spns[0]}
                      </button>
                      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                        ${spnHtml}
                      </div>
                    </div>`;
        return html;
      } else {
        return '';
      }


    }
    function createSiteRow( analyzedSite,  parentId) {
      let readinessScore = analyzedSite.readinessScore.toPrecision(3),
          appCount = analyzedSite.analyzedApps.length,
          bindings = analyzedSite.site.bindings;
      if ( bindings.hostName.length === 0 ) { bindings.hostName = 'localhost' }
      let internalUrl = bindings.protocol + '://' + bindings.hostName + ':' + bindings.port;
      let progressColor = determineProgressColor( readinessScore );
      let progressHtml = `
      <div class="progress">
        <div class="progress-bar ${progressColor} progress-bar-striped" role="progressbar" aria-valuenow="${readinessScore}%" aria-valuemin="0" aria-valuemax="100" style="width:${readinessScore}%">
          ${readinessScore}
        </div>
      </div>`
      let html = `<tr class='clickable-row siteRow' id=${parentId} data-internalUrl="${internalUrl}">
                    <td class="siteName">${analyzedSite.siteName}</td>
                    <td>${progressHtml}</td>
                    <td class="chosenSpn">${buildSpnDropdown(analyzedSite.site.appPool.spns)}</td>
                    <td class="connectorCol"><input type="text" class="form-control connectorGroup" autocomplete="off" placeholder="Connector Group"></td>
                    <td class="tenantName"><input type="text" class="form-control tenantGroup" autocomplete="off" placeholder="Tenant Name"></td>
                  </tr>`
      return html;
    }
    function createAppRow( app, siteName, internalUrl, childId, parentId ) {
      let readinessScore = app.readinessScore.toPrecision(3),
          progressColor = determineProgressColor( readinessScore ),
          progressHtml = `
        <div class="progress">
          <div class="progress-bar ${progressColor} progress-bar-striped" role="progressbar" aria-valuenow="${readinessScore}%" aria-valuemin="0" aria-valuemax="100" style="width:${readinessScore}%">
            ${readinessScore}
          </div>
        </div>`
      let html = `<tr class='clickable-row' id="${childId}" data-parentId=${parentId} data-internalUrl=${internalUrl}>
                    <td class="siteName">${siteName}/${app.app.appName}</td>
                    <td>${progressHtml}</td>
                    <td class="chosenSpn">${buildSpnDropdown(app.app.appPool.spns)}</td>
                    <td class="connectorCol"><input type="text" class="form-control connectorGroup" autocomplete="off" placeholder="Connector Group"></td>
                    <td class="tenantName"><input type="text" class="form-control tenantGroup" autocomplete="off" placeholder="Tenant Name"></td>
                  </tr>`
      return html;
    }
    function createBaseTable(){
      let html = `<table class="table" id="baseTable">
                      <thead>
                        <tr>
                          <th>Site / App Name</th>
                          <th>Readiness (%) </th>
                          <th>SPN</th>
                          <th>Connector Group</th>
                          <th>Tenant Name</th>
                        </tr>
                      </thead>
                      <tbody></tbody></table>`;
      return html;
    }
    $('#selectionContainer').append( createBaseTable() );

    this.analysis.analyzedSites
    .sort( (a,b) => {
      return b.readinessScore - a.readinessScore
    })
    .forEach( (site, i) => {
      let bindings = site.site.bindings,
          parentId = 'site-' + i.toString(),
          siteRow = createSiteRow(site, parentId),
          children = [];
      if ( bindings.hostName.length === 0 ) { bindings.hostName = 'localhost' }
      site.analyzedApps.forEach( (app, j) => {
        let childId = 'app-' + i.toString() + '-' + j.toString(),
            appUrl = bindings.protocol + '://' + bindings.hostName + ':' + bindings.port + '/' + app.app.appName,
            appRow = createAppRow( app, site.siteName, appUrl, childId, parentId );
        children.push( $(appRow) );
      })

      $('#baseTable').append(siteRow);
      $('#' + parentId).data('children', children)
      children.forEach( (c) => {
        $('#baseTable').append(c);
      })


    })

  }

  generatePublishScript() {
    function pullDataFromRow(row) {
      let dataBlob = {
        siteName : $(row).find('td.siteName').text(),
        chosenSpn : $(row).find('td.chosenSpn').find('.dropdown-toggle').text().trim(),
        connectorGroup : $(row).find('td.connectorCol input').val(),
        tenantName : $(row).find('td.tenantName input').val(),
        internalUrl : $(row).attr('data-internalUrl')
      }
      if ( $(row).hasClass('siteRow') ) {
        dataBlob.type = 'site';
      } else { dataBlob.type = 'app'; }
      return dataBlob;
    }
    function buildPsScript( dataBlobs ) {
      let psScript = `Connect-AzureAd`;
      dataBlobs.forEach( (blob) => {
        let externalUrl = `https://${blob.siteName}-${blob.tenantName}.msappproxy.net/`
        if ( blob.type === 'app' ) {
          let pathDirs = blob.siteName.split('/');
          pathDirs.splice(0,1);
          externalUrl += pathDirs.join('/') + '/'
        }

        let scriptBlock = `
        $connectorGroup = Get-AzureADApplicationProxyConnectorGroup |  where-object {$_.name -eq ${blob.connectorGroup}}
        New-AzureADApplicationProxyApplication -DisplayName ${blob.siteName} -InternalUrl ${blob.internalUrl} -ConnectorGroupId $connectorGroup.id -ExternalUrl ${externalUrl} -ExternalAuthenticationType AadPreAuthentication
        $AppProxyApp1=Get-AzureADApplication  | where-object {$_.Displayname -eq ${blob.siteName}}
        Set-AzureADApplicationProxyApplicationSingleSignOn -ObjectId $AppProxyApp1.Objectid -SingleSignOnMode OnPremisesKerberos -KerberosInternalApplicationServicePrincipalName ${blob.chosenSpn} -KerberosDelegatedLoginIdentity OnPremisesUserPrincipalName
        `;

        psScript += '\n' + scriptBlock;
      })
      return psScript;
    }

    let parents = [], children = [], relevantRows = [];
    $('.clickable-row').toArray().forEach( (r) => {
      if ( $(r).hasClass('table-primary') ) {
        if ( $(r).hasClass('siteRow') ) { parents.push(r); }
        else { children.push(r); }
      }
    })

    //Remove children that are encapsulated by parent publishing
    parents.forEach( (p) => {
      let childrenIds = $(p).data('children').map( c => $(c).attr('id') );
      children = children.filter( (c) => {
        if ( !childrenIds.includes( $(c).attr('id') ) ) {
          return c;
        }
      })
    })
    relevantRows =  parents.concat(children);

    let dataBlobs = relevantRows.map( row => pullDataFromRow(row) )
    console.log( dataBlobs );
    return buildPsScript( dataBlobs )
  }


  handles() {
    let that = this;
    function toggleSiteRow( clickedRow ) {
      //first reset current selection
      let tableRows = $('#siteTable').find('tr').toArray(),
          childrenIds = $(clickedRow).data('children').map( c =>  $(c).attr('id') )

      if ( $(clickedRow).hasClass('table-primary') ) {
        //If a site is selected again, deselect all the children
        childrenIds.forEach( (c) => {
          let $child = $('#' + c);
          if ( $child.hasClass('table-primary') ) { $child.removeClass('table-primary') }
        })
        $(clickedRow).removeClass('table-primary');

      } else {
        $(clickedRow).addClass('table-primary');

        //In this case we should also select all of its children
        childrenIds.forEach( (c) => {
          let $child = $('#' + c);
          if ( !$child.hasClass('table-primary') ) { $child.addClass('table-primary') }
        })
      }
    }
    function toggleAppRow( clickedChild ) {
      //first reset current selection
      let tableRows = $('#siteTable').find('tr').toArray(),
          parentRow = $('#' + $(clickedChild).attr('data-parentId') ),
          childrenIds = parentRow.data('children').map( c =>  $(c).attr('id') );

      console.log(parentRow, childrenIds);
      if ( $(clickedChild).hasClass('table-primary') ) {
        $(clickedChild).removeClass('table-primary');
        //Also deselect parent if parent was selected
        if ( $(parentRow).hasClass('table-primary') ) { $(parentRow).removeClass('table-primary'); }
      } else {
        //Select child but also check if siblings are selected.
        $(clickedChild).addClass('table-primary');
        let childSelectedCount = 0;
        childrenIds.forEach( (c) => {
          let $child = $('#' + c);
          if ( $child.hasClass('table-primary') ) { childSelectedCount++; }
        })

        if ( childSelectedCount === childrenIds.length ) {
          $(parentRow).addClass('table-primary');

        }
      }
    }
    function download(filename, text) {
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }
    function spawnModal( psScript) {
      let html = `<pre><code> ${psScript} </code></pre>`;
      $('#modal-psScript').html('');
      $('#modal-psScript').append(html)
      $('#modal-psScript pre code')
      .toArray()
      .forEach( (block) => {
      	hljs.highlightBlock(block);
      })
      //reset clipboard
      $('#copyClipboard').html('<i class="fas fa-clipboard clipboard"></i>')
      $('#publishModal').modal({})
    }

    $('#copyClipboard').on('click', (el) => {
      el.preventDefault();
      let textArea = document.createElement('textarea'),
          modalText = document.getElementById('modal-psScript');
      modalText.appendChild(textArea);
      textArea.value = $('#modal-psScript').text();
      textArea.focus();
      textArea.select();
      let successStatus = document.execCommand('copy');
      console.log("Copy success:", successStatus, textArea.value);
      modalText.removeChild(textArea);
      $('#copyClipboard').fadeOut('fast', function() {
        $('#copyClipboard').html('<i class="fas fa-clipboard-check clipboard"></i>');
        $('#copyClipboard').fadeIn('fast');
      })

    })

    $('#dlScript').on('click', (el) => {
      let text = $('#modal-psScript').text();
      download('AppProxyAutoPub.ps1', text);
    })

    $('.dropdown-item').on('click', (el) => {
    	let selectedItem = el.target;
      $(selectedItem).parent().parent().find('.btn').text( $(selectedItem).text().trim() )
    })
    $('#input-connectorMaster').on('keyup', function(el) {
    	let target = el.target;
      $('.connectorGroup').val( $(target).val() )
    })
    $('#input-domainMaster').on('keyup', function(el) {
      let target = el.target;
      $('.tenantGroup').val( $(target).val() )
    })

    $('.clickable-row').on('click', (el) => {
      let clickedRow = $(el.target).closest('.clickable-row');
      if ( clickedRow.hasClass('siteRow') ) { toggleSiteRow(clickedRow) }
      else { toggleAppRow(clickedRow) }
    })

    $('#publishBtn').on('click', () => {
      spawnModal( that.generatePublishScript() )
    });

  }

  initView() {
    this.buildTable();
    this.handles()
  }



}
