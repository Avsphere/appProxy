'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AutoPublish = function () {
  function AutoPublish(analysisResults) {
    _classCallCheck(this, AutoPublish);

    this.analysis = analysisResults;
    console.log(this.analysis);
    this.initView();
    this.customDomainChecked = false;
  }

  _createClass(AutoPublish, [{
    key: 'buildTable',
    value: function buildTable() {
      var that = this;
      function determineProgressColor(score) {
        if (score < 50) {
          return 'bg-danger';
        } else if (score < 70) {
          return 'bg-warning';
        } else if (score < 90) {
          return 'bg-success';
        } else {
          return '';
        }
      }
      function buildSpnDropdown(spns) {
        if (spns && spns.length > 0) {
          spns = spns.sort().reverse();
          var spnHtml = '';
          spns.forEach(function (s) {
            spnHtml += '<a class="dropdown-item" href="#">' + s + '</a>';
          });
          var html = '<div class="dropdown spn-dropdown">\n                      <button class="btn btn-light dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n                        ' + spns[0] + '\n                      </button>\n                      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">\n                        ' + spnHtml + '\n                      </div>\n                    </div>';
          return html;
        } else {
          return '';
        }
      }
      function createSiteRow(analyzedSite, parentId) {
        var readinessScore = analyzedSite.readinessScore.toPrecision(3),
            readinessText = readinessScore,
            appCount = analyzedSite.analyzedApps.length,
            siteType = 'forms',
            bindings = analyzedSite.site.bindings;
        if (bindings.hostName.length === 0) {
          bindings.hostName = 'localhost';
        }
        if (Object.keys(analyzedSite.site.authentication).includes('windowsAuthentication')) {
          siteType = 'wia';
        }
        var internalUrl = bindings.protocol + '://' + bindings.hostName + ':' + bindings.port + '/';
        var progressColor = determineProgressColor(readinessScore);
        if (!analyzedSite.site.authentication.hasOwnProperty('windowsAuthentication')) {
          progressColor = 'dull bg-success';
          readinessScore = 100;
          readinessText = 'Non WIA';
        }
        var progressHtml = '\n      <div class="progress">\n        <div class="progress-bar ' + progressColor + ' progress-bar-striped" role="progressbar" aria-valuenow="' + readinessScore + '%" aria-valuemin="0" aria-valuemax="100" style="width:' + readinessScore + '%">\n          ' + readinessText + '\n        </div>\n      </div>';
        var html = '<tr class=\'clickable-row siteRow\' id=' + parentId + ' data-type=' + siteType + ' data-hostName="' + bindings.hostName + '" data-internalUrl="' + internalUrl + '">\n                    <td class="siteName">' + analyzedSite.siteName + '</td>\n                    <td>' + progressHtml + '</td>\n                    <td class="chosenSpn">' + buildSpnDropdown(analyzedSite.site.appPool.spns) + '</td>\n                    <td class="connectorCol"><input type="text" class="form-control connectorGroup" autocomplete="off" placeholder="Connector Group"></td>\n                    <td class="tenantName"><input type="text" class="form-control tenantGroup" autocomplete="off" placeholder="Tenant Name"></td>\n                    <td class="customDomain"><input type="text" class="form-control" autocomplete="off" placeholder="Custom Domain"></td>\n                  </tr>';
        return html;
      }
      // function buildCheckBox() {
      //   let html = `<div class="col">
      //                 <div class="form-check" style="margin-top:5%">
      //                   <input type="checkbox" class="form-check-input customDomain" >
      //                   <label class="form-check-label" for="customDomain">Custom Domain</label>
      //               </div>
      //               </div>`;
      //   return html;
      // }
      function createAppRow(app, siteName, internalUrl, childId, parentId, bindings) {
        var readinessScore = app.readinessScore.toPrecision(3),
            readinessText = readinessScore,
            progressColor = determineProgressColor(readinessScore),
            appType = 'forms';
        if (!app.app.authentication.hasOwnProperty('windowsAuthentication')) {
          progressColor = 'dull bg-success';
          readinessScore = 100;
          readinessText = 'Non WIA';
        }
        var progressHtml = '\n        <div class="progress">\n          <div class="progress-bar ' + progressColor + ' progress-bar-striped" role="progressbar" aria-valuenow="' + readinessScore + '%" aria-valuemin="0" aria-valuemax="100" style="width:' + readinessScore + '%">\n            ' + readinessText + '\n          </div>\n        </div>';

        if (Object.keys(app.app.authentication).includes('windowsAuthentication')) {
          appType = 'wia';
        }
        var html = '<tr class=\'clickable-row\' id="' + childId + '" data-type=' + appType + ' data-parentId=' + parentId + ' data-internalUrl=' + internalUrl + ' data-hostName="' + bindings.hostName + '">\n                    <td class="siteName">' + siteName + '/' + app.app.appName + '</td>\n                    <td>' + progressHtml + '</td>\n                    <td class="chosenSpn">' + buildSpnDropdown(app.app.appPool.spns) + '</td>\n                    <td class="connectorCol"><input type="text" class="form-control connectorGroup" autocomplete="off" placeholder="Connector Group"></td>\n                    <td class="tenantName"><input type="text" class="form-control tenantGroup" autocomplete="off" placeholder="Tenant Name"></td>\n                    <td class="customDomain"><input type="text" class="form-control" autocomplete="off" placeholder="Custom Domain"></td>\n                  </tr>';
        return html;
      }
      function createBaseTable() {
        var html = '<table class="table" id="baseTable">\n                      <thead>\n                        <tr>\n                          <th>Site / App Name</th>\n                          <th>Readiness (%) </th>\n                          <th>SPN</th>\n                          <th>Connector Group</th>\n                          <th>Tenant Name</th>\n                          <th>Custom Domain (optional)</th>\n                        </tr>\n                      </thead>\n                      <tbody></tbody></table>';
        return html;
      }
      $('#selectionContainer').append(createBaseTable());

      this.analysis.analyzedSites.sort(function (a, b) {
        return b.readinessScore - a.readinessScore;
      }).forEach(function (site, i) {
        var bindings = site.site.bindings,
            parentId = 'site-' + i.toString(),
            siteRow = createSiteRow(site, parentId),
            children = [];
        if (bindings.hostName.length === 0) {
          bindings.hostName = 'localhost';
        }
        site.analyzedApps.forEach(function (app, j) {
          var childId = 'app-' + i.toString() + '-' + j.toString(),
              appUrl = bindings.protocol + '://' + bindings.hostName + ':' + bindings.port + '/' + app.app.appName + '/',
              appRow = createAppRow(app, site.siteName, appUrl, childId, parentId, bindings);
          children.push($(appRow));
        });

        $('#baseTable').append(siteRow);
        $('#' + parentId).data('children', children);
        children.forEach(function (c) {
          $('#baseTable').append(c);
        });
      });
    }
  }, {
    key: 'generatePublishScript',
    value: function generatePublishScript() {
      var that = this;
      that.customDomainChecked = false;
      function pullDataFromRow(row) {
        var dataBlob = {
          siteName: $(row).find('td.siteName').text(),
          chosenSpn: $(row).find('td.chosenSpn').find('.dropdown-toggle').text().trim(),
          connectorGroup: $(row).find('td.connectorCol input').val(),
          tenantName: $(row).find('td.tenantName input').val(),
          customDomain: $(row).find('td.customDomain input').val(),
          internalUrl: $(row).attr('data-internalUrl'),
          hostName: $(row).attr('data-hostName'),
          itemType: $(row).attr('data-type')
        };
        if ($(row).hasClass('siteRow')) {
          dataBlob.type = 'site';
        } else {
          dataBlob.type = 'app';
        }
        return dataBlob;
      }
      function buildExternalUrl(blob) {
        var domain = void 0,
            externalUrl = void 0;
        if (blob.customDomain === "") {
          domain = 'msappproxy.net';
          externalUrl = 'https://' + blob.hostName + '-' + blob.tenantName + '.' + domain + '/';
        } else {
          that.customDomainChecked = true;
          domain = blob.customDomain;
          externalUrl = 'https://' + blob.hostName + '.' + domain + '/';
        }
        return externalUrl;
      }
      function buildPsScript(dataBlobs) {
        var psScript = 'Connect-AzureAd',
            upNextBlob = '';
        dataBlobs.forEach(function (blob, blobIndex) {

          var externalUrl = buildExternalUrl(blob);
          if (blob.type === 'app') {
            var pathDirs = blob.siteName.split('/');
            pathDirs.splice(0, 1);
            externalUrl += pathDirs.join('/') + '/';
          }

          if (blob.itemType === 'forms') {
            upNextBlob += 'Write-Host "Site ' + blob.siteName + ' has been published! -> ' + externalUrl + ' check it out and begin adding groups / users who can access the application!" -ForegroundColor Green \n';
            psScript += '\n          Write-Host "Publishing ' + blob.siteName + '" -ForegroundColor Green\n          $connectorGroup_' + blobIndex + ' = Get-AzureADApplicationProxyConnectorGroup |  where-object {$_.name -eq "' + blob.connectorGroup + '"}\n          New-AzureADApplicationProxyApplication -DisplayName "' + blob.siteName + '" -InternalUrl "' + blob.internalUrl + '" -ConnectorGroupId $connectorGroup_' + blobIndex + '.id -ExternalUrl "' + externalUrl + '" -ExternalAuthenticationType Passthru';
          } else {
            upNextBlob += 'Write-Host "Site ' + blob.siteName + ' has been published! -> ' + externalUrl + ' check it out and begin adding groups / users who can access the application!" -ForegroundColor Green \n';
            psScript += '\n          Write-Host "Publishing ' + blob.siteName + '" -ForegroundColor Green\n          $connectorGroup_' + blobIndex + ' = Get-AzureADApplicationProxyConnectorGroup |  where-object {$_.name -eq "' + blob.connectorGroup + '"}\n          New-AzureADApplicationProxyApplication -DisplayName "' + blob.siteName + '" -InternalUrl "' + blob.internalUrl + '" -ConnectorGroupId $connectorGroup_' + blobIndex + '.id -ExternalUrl "' + externalUrl + '" -ExternalAuthenticationType AadPreAuthentication\n          $AppProxyApp_' + blobIndex + '=Get-AzureADApplication  | where-object {$_.Displayname -eq "' + blob.siteName + '"}\n          Set-AzureADApplicationProxyApplicationSingleSignOn -ObjectId $AppProxyApp_' + blobIndex + '.Objectid -SingleSignOnMode OnPremisesKerberos -KerberosInternalApplicationServicePrincipalName ' + blob.chosenSpn + ' -KerberosDelegatedLoginIdentity OnPremisesUserPrincipalName\n          ';
          }
          psScript += '\n';
        });
        psScript += upNextBlob;
        return psScript;
      }

      var parents = [],
          children = [],
          relevantRows = [];
      $('.clickable-row').toArray().forEach(function (r) {
        if ($(r).hasClass('table-primary')) {
          if ($(r).hasClass('siteRow')) {
            parents.push(r);
          } else {
            children.push(r);
          }
        }
      });

      /*Remove children that are encapsulated by parent publishing --- Like the highlighting this has currently been commented our to allow more cusomtizability */
      // parents.forEach( (p) => {
      //   let childrenIds = $(p).data('children').map( c => $(c).attr('id') );
      //   children = children.filter( (c) => {
      //     if ( !childrenIds.includes( $(c).attr('id') ) ) {
      //       return c;
      //     }
      //   })
      // })
      relevantRows = parents.concat(children);

      var dataBlobs = relevantRows.map(function (row) {
        return pullDataFromRow(row);
      });
      return buildPsScript(dataBlobs);
    }
  }, {
    key: 'handles',
    value: function handles() {
      var that = this;
      function toggleSiteRow(clickedRow) {
        //The auto selection / deselection of children reduces user power and so has been currently commented out
        var tableRows = $('#siteTable').find('tr').toArray(),
            childrenIds = $(clickedRow).data('children').map(function (c) {
          return $(c).attr('id');
        });
        if ($(clickedRow).hasClass('table-primary')) {
          // childrenIds.forEach( (c) => {
          //   let $child = $('#' + c);
          //   if ( $child.hasClass('table-primary') ) { $child.removeClass('table-primary') }
          // })
          $(clickedRow).removeClass('table-primary');
        } else {
          $(clickedRow).addClass('table-primary');
          //In this case we should also select all of its children
          // childrenIds.forEach( (c) => {
          //   let $child = $('#' + c);
          //   if ( !$child.hasClass('table-primary') ) { $child.addClass('table-primary') }
          // })
        }
      }
      function toggleAppRow(clickedChild) {
        //first reset current selection
        var tableRows = $('#siteTable').find('tr').toArray(),
            parentRow = $('#' + $(clickedChild).attr('data-parentId')),
            childrenIds = parentRow.data('children').map(function (c) {
          return $(c).attr('id');
        });
        if ($(clickedChild).hasClass('table-primary')) {
          $(clickedChild).removeClass('table-primary');
          //if ( $(parentRow).hasClass('table-primary') ) { $(parentRow).removeClass('table-primary'); }
        } else {
          //Select child but also check if siblings are selected.
          $(clickedChild).addClass('table-primary');
          var childSelectedCount = 0;
          childrenIds.forEach(function (c) {
            var $child = $('#' + c);
            if ($child.hasClass('table-primary')) {
              childSelectedCount++;
            }
          });
          // if ( childSelectedCount === childrenIds.length ) {
          //   $(parentRow).addClass('table-primary');
          // }
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
      function spawnModal(psScript) {
        //This customDomainChecked attribute is only on psScriptGeneration
        var html = '<pre><code> ' + psScript + ' </code></pre>';
        $('#modal-psScript').html('');
        $('#modal-psScript').append(html);
        $('#modal-psScript pre code').toArray().forEach(function (block) {
          hljs.highlightBlock(block);
        });
        if (that.customDomainChecked) {
          $('#modal-psScript').prepend('<p>**The certificate for the custom domain(s) should have already been uploaded to Azure AD </p>');
        }
        //reset clipboard
        $('#copyClipboard').html('<i class="fas fa-clipboard clipboard"></i>');
        $('#publishModal').modal({});
      }

      $('#copyClipboard').on('click', function (el) {
        el.preventDefault();
        var textArea = document.createElement('textarea'),
            modalText = document.getElementById('modal-psScript');
        modalText.appendChild(textArea);
        textArea.value = $('#modal-psScript').text();
        textArea.focus();
        textArea.select();
        var successStatus = document.execCommand('copy');
        modalText.removeChild(textArea);
        $('#copyClipboard').fadeOut('fast', function () {
          $('#copyClipboard').html('<i class="fas fa-clipboard-check clipboard"></i>');
          $('#copyClipboard').fadeIn('fast');
        });
      });

      $('#dlScript').on('click', function (el) {
        var text = $('#modal-psScript').text();
        download('AppProxyAutoPub.ps1', text);
      });

      $('.dropdown-item').on('click', function (el) {
        var selectedItem = el.target;
        $(selectedItem).parent().parent().find('.btn').text($(selectedItem).text().trim());
      });
      $('#input-connectorMaster').on('keyup', function (el) {
        var target = el.target;
        $('.connectorGroup').val($(target).val());
      });
      $('#input-domainMaster').on('keyup', function (el) {
        var target = el.target;
        $('.tenantGroup').val($(target).val());
      });

      $('.clickable-row').on('click', function (el) {
        if (!$(el.target).is('input') && !$(el.target).is('button') && !$(el.target).is('a')) {
          var clickedRow = $(el.target).closest('.clickable-row');
          if (clickedRow.hasClass('siteRow')) {
            toggleSiteRow(clickedRow);
          } else {
            toggleAppRow(clickedRow);
          }
        }
      });
      $('.customDomain').on('keyup', function (el) {
        var customDomain = $(el.target).val(),
            $row = $(el.target).closest('.clickable-row');
        if (customDomain.length > 0) {
          //There is a custom domain so disable the tenant name
          $row.find('.tenantName input').attr('disabled', true);
        } else {
          $row.find('.tenantName input').attr('disabled', false);
        }
      });

      $('#publishBtn').on('click', function () {
        spawnModal(that.generatePublishScript());
      });

      $('.dropdown-item').on('click', function (el) {
        el.preventDefault();
      });
    }
  }, {
    key: 'initView',
    value: function initView() {
      this.buildTable();
      this.handles();
    }
  }]);

  return AutoPublish;
}();
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ConfigApi = function () {
  function ConfigApi(rawData) {
    _classCallCheck(this, ConfigApi);

    this.rawData = rawData;
  }

  _createClass(ConfigApi, [{
    key: "getSiteNames",
    value: function getSiteNames() {
      return this.rawData.sites.map(function (s) {
        return s.siteName;
      });
    }
  }, {
    key: "getServerName",
    value: function getServerName() {
      return this.rawData.serverName;
    }
  }, {
    key: "getOs",
    value: function getOs() {
      return this.rawData.os;
    }
  }, {
    key: "getSite",
    value: function getSite(siteName) {
      var name = siteName.toLowerCase();
      var site = this.rawData.sites.find(function (s) {
        if (s.siteName.toLowerCase() === name) {
          return s;
        }
      });
      return site;
    }
  }, {
    key: "getSites",
    value: function getSites() {
      return this.rawData.sites;
    }
  }, {
    key: "getSiteApps",
    value: function getSiteApps(siteName) {
      var site = this.getSite(siteName);
      return site.applications;
    }
  }, {
    key: "getAuthNames",
    value: function getAuthNames(siteOrApp) {
      if (!siteOrApp.hasOwnProperty('authentication')) {
        throw new "getAuth cannot find authentication property"();
      }
      return Object.keys(siteOrApp.authentication);
    }
  }]);

  return ConfigApi;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// $(function() {
//   const configData = configDiscoveryData;
//
//   function geometricPattern() {
//     //some borrowed pattern
//     var c = document.getElementsByTagName('canvas')[0],
//         x = c.getContext('2d'),
//         pr = window.devicePixelRatio || 1,
//         w = window.innerWidth,
//         h = window.innerHeight,
//         f = 90,
//         q,
//         m = Math,
//         r = 0,
//         u = m.PI*2,
//         v = m.cos,
//         z = m.random
//     c.width = w*pr
//     c.height = h*pr
//     x.scale(pr, pr)
//     x.globalAlpha = 0.6
//     function i(){
//         x.clearRect(0,0,w,h)
//         q=[{x:0,y:h*.7+f},{x:0,y:h*.7-f}]
//         while(q[1].x<w+f) d(q[0], q[1])
//     }
//     function d(i,j){
//         x.beginPath()
//         x.moveTo(i.x, i.y)
//         x.lineTo(j.x, j.y)
//         var k = j.x + (z()*2-0.25)*f,
//             n = y(j.y)
//         x.lineTo(k, n)
//         x.closePath()
//         r-=u/-50
//         x.fillStyle = '#'+(v(r)*127+128<<16 | v(r+u/3)*127+128<<8 | v(r+u/3*2)*127+128).toString(16)
//         x.fill()
//         q[0] = q[1]
//         q[1] = {x:k,y:n}
//     }
//     function y(p){
//         var t = p + (z()*2-1.1)*f
//         return (t>h||t<0) ? y(p) : t
//     }
//     document.onclick = i
//     i();
//   }
//   function init() {
//
//     geometricPattern();
//     $('#customFile').on('change', function() {
//       if ( document.getElementById('customFile').files.length === 1 ) {
//         let reader = new FileReader();
//         reader.onload = function(e) {
//           let jsonData = reader.result;
//           processData( jsonData );
//         }
//         reader.readAsText( document.getElementById('customFile').files[0] )
//       } else {
//         console.log("it appears the value is unchanged");
//       }
//     })
//   }
//   function processData( configData ) {
//     let parsedData = JSON.parse(configData);
//     let configApi = new ConfigApi(parsedData);
//     let analyzer = new WindowsAnalysis( configApi );
//     let viewBuilder = new ViewBuilder( analyzer.results )
//     viewBuilder.buildHeadlessView()
//   }
//
//
//
//   init();
// })

var Headless = function () {
  function Headless() {
    _classCallCheck(this, Headless);

    this.geometricPattern();
    this.handles();
  }

  _createClass(Headless, [{
    key: 'processData',
    value: function processData(configData) {
      var parsedData = JSON.parse(configData);
      var configApi = new ConfigApi(parsedData);
      var analyzer = new WindowsAnalysis(configApi);
      var viewBuilder = new ViewBuilder(analyzer.results);
      viewBuilder.buildHeadlessView();
    }
  }, {
    key: 'handles',
    value: function handles() {
      var that = this;
      $('#customFile').on('change', function () {
        if (document.getElementById('customFile').files.length === 1) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var jsonData = reader.result;
            that.processData(jsonData);
          };
          reader.readAsText(document.getElementById('customFile').files[0]);
        } else {
          console.log("it appears the value is unchanged");
        }
      });
    }
  }, {
    key: 'geometricPattern',
    value: function geometricPattern() {
      //some borrowed pattern
      var c = document.getElementsByTagName('canvas')[0],
          x = c.getContext('2d'),
          pr = window.devicePixelRatio || 1,
          w = window.innerWidth,
          h = window.innerHeight,
          f = 90,
          q,
          m = Math,
          r = 0,
          u = m.PI * 2,
          v = m.cos,
          z = m.random;
      c.width = w * pr;
      c.height = h * pr;
      x.scale(pr, pr);
      x.globalAlpha = 0.6;
      function i() {
        x.clearRect(0, 0, w, h);
        q = [{ x: 0, y: h * .7 + f }, { x: 0, y: h * .7 - f }];
        while (q[1].x < w + f) {
          d(q[0], q[1]);
        }
      }
      function d(i, j) {
        x.beginPath();
        x.moveTo(i.x, i.y);
        x.lineTo(j.x, j.y);
        var k = j.x + (z() * 2 - 0.25) * f,
            n = y(j.y);
        x.lineTo(k, n);
        x.closePath();
        r -= u / -50;
        x.fillStyle = '#' + (v(r) * 127 + 128 << 16 | v(r + u / 3) * 127 + 128 << 8 | v(r + u / 3 * 2) * 127 + 128).toString(16);
        x.fill();
        q[0] = q[1];
        q[1] = { x: k, y: n };
      }
      function y(p) {
        var t = p + (z() * 2 - 1.1) * f;
        return t > h || t < 0 ? y(p) : t;
      }
      document.onclick = i;
      i();
    }
  }]);

  return Headless;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function ConfigCheck(resultData) {
  var _this = this;

  var requiredFields = ['name', 'value', 'status', 'detailsHtml', 'docRef'];
  requiredFields.forEach(function (field) {
    if (!resultData.hasOwnProperty(field)) {
      throw new Error("Status obj cannot be constructed with the given fields");
    } else {
      _this[field] = resultData[field];
    }
  });
}
function camelToTitleCase(stringValue) {
  return stringValue.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
}

var WindowsAnalysis = function () {
  function WindowsAnalysis(api) {
    _classCallCheck(this, WindowsAnalysis);

    this.api = api;
    //if the serverName is not there then the data has not been populated. In which case I will display the tutorial
    if (this.api.rawData.serverName) {
      this.results = {
        serverName: this.api.getServerName(),
        os: this.api.getOs(),
        serverVersion: this.api.rawData.iisVersion || "Unknown IIS Version",
        analyzedSites: this.runChecks()
      };
    } else {
      $('#siteTable').html('<a href="./documentation.html"><h2> Hmmm it appears there is no data to show, head over to the documentation to learn how to capture your data </h2> </a>');
    }
  }

  _createClass(WindowsAnalysis, [{
    key: 'simpleReadiness',
    value: function simpleReadiness(checks) {
      var totalChecks = checks.length,
          correctCount = 0;

      checks.forEach(function (c) {
        if (c.status === 'correct') {
          correctCount++;
        }
      });
      return correctCount / totalChecks * 100;
    }
  }, {
    key: 'checkAuth',
    value: function checkAuth(authData, identityType) {
      var checks = [],
          authTypes = Object.keys(authData),
          runWIAChecks = false;
      if (authTypes.length > 1) {
        if (authTypes.includes('windowsAuthentication')) {
          runWIAChecks = true;
          checks.push(new ConfigCheck({
            name: 'Multiple authentication methods are enabled',
            value: authTypes.toString().replace(/,/g, ', '),
            status: 'incorrect',
            detailsHtml: '<p> Multiple authentication methods are enabled where one is Windows Authentication. Because one authentication method may override another, this may produce unexpected results. Enable just the authentication method you intend this app to use. </p>',
            docRef: 'A1'
          }));
        } else {
          checks.push(new ConfigCheck({
            name: 'Multiple authentication methods are enabled',
            value: authTypes.toString().replace(/,/g, ', '),
            status: 'warning',
            detailsHtml: '<p> Multiple authentication methods are enabled. Because one authentication method may override another, this may produce unexpected results. Enable just the authentication method you intend this app to use. </p>',
            docRef: 'A2'
          }));
        }
      } else if (authTypes.length === 1) {
        if (authTypes.includes('windowsAuthentication')) {
          runWIAChecks = true;
          checks.push(new ConfigCheck({
            name: 'Authentication',
            value: 'Windows Authentication',
            status: 'correct',
            detailsHtml: '',
            docRef: 'A3'

          }));
        } else {
          checks.push(new ConfigCheck({
            name: 'Authentication type is',
            value: authTypes[0],
            status: 'warning',
            detailsHtml: 'Because of the possible ways to configure non-Windows Integrated Authentication applications, there is not as much available diagnosis information.',
            docRef: 'A4'
          }));
        }
      }

      if (runWIAChecks) {
        /* Provider checks */
        var providers = authData.windowsAuthentication.providers;
        if (!providers.first && !providers.second) {
          checks.push(new ConfigCheck({
            name: 'No configured providers',
            value: '',
            status: 'incorrect',
            detailsHtml: '<p>For Kerberos to work properly Windows Integrated Authentication apps should have the provider "Negotiate" configured. Find more information <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> <p>',
            docRef: 'C3'
          }));
        } else if (providers.first === 'Negotiate') {
          checks.push(new ConfigCheck({
            name: 'Configured first provider is',
            value: providers.first,
            status: 'correct',
            detailsHtml: '',
            docRef: 'C1'
          }));
        } else if (providers.first === 'NTLM') {
          checks.push(new ConfigCheck({
            name: 'Configured first provider is',
            value: providers.first,
            status: 'incorrect',
            detailsHtml: '<p> If NTLM is listed as the first provider, then the Kerberos protocol will not be used. Find the proper provider configuration instructions <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
            docRef: 'C2'
          }));
        }

        /* App Pool identity and useKernelMode / useAppPoolCredentials checks */

        var useAppPoolCredentials = authData.windowsAuthentication.useAppPoolCredentials,
            useKernelMode = authData.windowsAuthentication.useKernelMode;
        if (useAppPoolCredentials && useKernelMode) {
          checks.push(new ConfigCheck({
            name: 'Both useKernelMode and useAppPoolCredentials are true',
            value: '',
            status: 'warning',
            detailsHtml: '<p> This configuration can yield unpredictable results, so either use an SPN that is defined against the Identity discovered in the above table, or consider setting useAppPoolCredentials to false, and using an SPN defined against the machine object, in AD. Find the instructions for the proper mode to use <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
            docRef: 'B6'
          }));
        }
        if (useAppPoolCredentials && identityType === 'SpecificUser') {
          checks.push(new ConfigCheck({
            name: 'Identity type is Custom Account and useAppPoolCredentials is true',
            value: '',
            status: 'correct',
            detailsHtml: '',
            docRef: 'B1'
          }));
        } else if (!useAppPoolCredentials && identityType === 'SpecificUser') {
          checks.push(new ConfigCheck({
            name: 'App pool configured identity is Custom Account and useAppPoolCredentials is false',
            value: '',
            status: 'incorrect',
            detailsHtml: '<p> The app pool has a "Custom Identity" configured, but useAppPoolCredentials is false. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
            docRef: 'B2'
          }));
        } else if (useKernelMode && identityType !== 'SpecificUser') {
          checks.push(new ConfigCheck({
            name: 'App pool identity is ' + identityType + ' and useKernelMode is true',
            value: '',
            status: 'warning',
            detailsHtml: '<p> While this could work if the connector has the SPNs registered to this identity, it is not recommended. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
            docRef: 'B3'
          }));
        } else if (!useKernelMode && identityType !== 'SpecificUser') {
          checks.push(new ConfigCheck({
            name: 'App pool identity is ' + identityType + ' and useKernelMode is false',
            value: '',
            status: 'incorrect',
            detailsHtml: '<p> The app pool configured identity is ' + identityType + ' and useKernelMode is false. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
            docRef: 'B4'
          }));
        } else {
          checks.push(new ConfigCheck({
            name: 'App Pool configured identity and useAppPoolCredentials / useKernelMode error',
            value: '',
            status: 'incorrect',
            detailsHtml: '<p> Generally the app pool identity should be set to "Custom Account" with useAppPoolCredentials set to true. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a>> </p>',
            docRef: 'B5'
          }));
        }
      }
      return checks;
    }
  }, {
    key: 'checkAppPool',
    value: function checkAppPool(site) {
      var checks = [],
          uniqDict = {},
          apps = this.api.getSiteApps(site.siteName);
      uniqDict[site.appPool.name] = true;
      if (apps && apps.length > 1) {
        apps.forEach(function (app) {
          uniqDict[app.appPool.name] = true;
        });
        if (Object.keys(uniqDict).length > 1) {
          checks.push(new ConfigCheck({
            name: 'Site or child app(s) have differing app pools',
            value: Object.keys(uniqDict).toString(),
            status: 'warning',
            detailsHtml: '<p> This site or its child app(s) are utilizing differing app pools which could be a cause of error if planning on KCD SSO </p>',
            docRef: 'F1'
          }));
        }
      }

      return checks;
    }
  }, {
    key: 'checkSpns',
    value: function checkSpns(appPool) {
      var checks = [],
          spns = appPool.spns,
          checkValue = appPool.username,
          identityType = appPool.identityType;
      if (identityType === 'SpecificUser' && spns && spns.length > 0) {
        checks.push(new ConfigCheck({
          name: 'Valid SPNs exist for configured identity type',
          value: '',
          status: 'correct',
          detailsHtml: '',
          docRef: 'D1'
        }));
      } else if (spns && spns.length > 0) {
        checks.push(new ConfigCheck({
          name: 'Valid SPNs exist for configured identity type, but identity type is ' + identityType,
          value: '',
          status: 'warning',
          detailsHtml: '<p> If your intention was to decrypt the Kerberos ticket using the configured app pool identity ' + identityType + ', ' + spns.length + ' do exist for this identity, but it is not the recommended configuration. Find how to set spns <a target="_blank" href="https://support.microsoft.com/en-us/help/929650/how-to-use-spns-when-you-configure-web-applications-that-are-hosted-on"> here </a> or find more comprehensive instructions <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
          docRef: 'D2'
        }));
      } else {
        checks.push(new ConfigCheck({
          name: 'SPNs do not exist for',
          value: checkValue,
          status: 'incorrect',
          detailsHtml: '<p> No SPNs exist for the configure app pool identity, you can quickly find how to set SPNs <a target="_blank" href="https://support.microsoft.com/en-us/help/929650/how-to-use-spns-when-you-configure-web-applications-that-are-hosted-on"> here </a> or find more comprehensive instructions <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
          docRef: 'D3'
        }));
      }
      return checks;
    }
  }, {
    key: 'checkDelegationSettings',
    value: function checkDelegationSettings(siteOrApp) {
      var containsWindowsAuth = Object.keys(siteOrApp.authentication).includes('windowsAuthentication');
      if (this.api.rawData.checkedConnector && containsWindowsAuth) {
        var checks = [],
            delegationSettings = siteOrApp.delegationSettings;
        if (!delegationSettings) {
          //In this case the user has WIA but no SPNs
          checks.push(new ConfigCheck({
            name: 'Delegation Check',
            value: 'No valid SPNs were found',
            status: 'incorrect',
            detailsHtml: '<p>The delegation check was ran but no valid SPNs exist. Find how to configure your connector <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>',
            docRef: 'E1'
          }));
          return checks;
        }
        delegationSettings.forEach(function (item) {
          if (item.trustedToAuthForDelegation && item.targetSpnInConnector) {
            checks.push(new ConfigCheck({
              name: 'Allowed to delegate to SPN',
              value: item.spn,
              status: 'correct',
              detailsHtml: '',
              docRef: 'E2'
            }));
          } else if (!item.trustedToAuthForDelegation && item.targetSpnInConnector) {
            checks.push(new ConfigCheck({
              name: 'Delegation Check',
              value: 'Connector is not configured to give delegationTo access',
              status: 'incorrect',
              detailsHtml: '<p> The ' + item.spn + ' exists in the connector delegation configuration but this connector machine is not trusted for delegation, find the instructions <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>',
              docRef: 'E3'
            }));
          } else if (item.trustedToAuthForDelegation && !item.targetSpnInConnector) {
            checks.push(new ConfigCheck({
              name: 'Delegation Check',
              value: 'The spn ' + item.spn + ' does not exist in the connector delegation tab',
              status: 'incorrect',
              detailsHtml: '<p> ' + item.spn + ' does not exist in the connector delegation configuration but this connector machine is trusted for delegation, find the instructions <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>',
              docRef: 'E4'
            }));
          } else {
            checks.push(new ConfigCheck({
              name: 'Delegation Check',
              value: 'SPN missing and no delegationTo access',
              status: 'incorrect',
              detailsHtml: '<p>Learn how to properly configure your connector <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>',
              docRef: 'E5'
            }));
          }
        });
        return checks;
      } else {
        return [];
      }
    }
  }, {
    key: 'runChecks',
    value: function runChecks() {
      var _this2 = this;

      var that = this,
          sites = this.api.getSites(),
          analyzedSites = [];
      sites.map(function (site) {
        var totalChecks = [],
            siteChecks = [],
            analyzedApps = [],
            siteApps = _this2.api.getSiteApps(site.siteName);
        siteChecks = siteChecks.concat(that.checkAuth(site.authentication, site.appPool.identityType));
        siteChecks = siteChecks.concat(that.checkSpns(site.appPool));
        siteChecks = siteChecks.concat(that.checkDelegationSettings(site));
        siteChecks = siteChecks.concat(that.checkAppPool(site));
        totalChecks = totalChecks.concat(siteChecks);
        if (siteApps) {
          //This is to fix the powershell convert to json write bug
          if (!siteApps.hasOwnProperty('length')) {
            siteApps = [siteApps];
          }

          siteApps.forEach(function (app) {
            var appChecks = [];

            appChecks = appChecks.concat(that.checkAuth(app.authentication, app.appPool.identityType));
            appChecks = appChecks.concat(that.checkSpns(app.appPool));
            appChecks = appChecks.concat(that.checkDelegationSettings(app));

            var readinessScore = that.simpleReadiness(appChecks);
            totalChecks = totalChecks.concat(appChecks);
            analyzedApps.push({
              app: app,
              readinessScore: readinessScore,
              checks: appChecks
            });
          });
        }
        analyzedSites.push({
          siteName: site.siteName,
          site: site,
          readinessScore: that.simpleReadiness(totalChecks),
          checks: siteChecks,
          analyzedApps: analyzedApps
        });
      });

      return analyzedSites;
    }
  }]);

  return WindowsAnalysis;
}();
'use strict';

$(function () {
  var configData = configDiscoveryData;
  function initIndex() {
    var configApi = new ConfigApi(configData);
    var analyzer = new WindowsAnalysis(configApi);
    var viewBuilder = new ViewBuilder(analyzer.results);
    viewBuilder.buildView();
  }
  function initAutoPub() {
    var configApi = new ConfigApi(configData);
    var analyzer = new WindowsAnalysis(configApi);
    var autoPublish = new AutoPublish(analyzer.results);
  }
  function initHeadless() {
    var headless = new Headless();
  }
  function init() {
    var path = window.location.href;
    if (path.includes('autoPub.html') || path.includes('autopub.html')) {
      initAutoPub();
    } else if (path.includes('headless.html')) {
      initHeadless();
    } else {
      initIndex();
    }
  }
  init();
});
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewBuilder = function () {
  function ViewBuilder(analysis) {
    _classCallCheck(this, ViewBuilder);

    this.analysis = analysis;
  }

  _createClass(ViewBuilder, [{
    key: 'setBaseServerInfo',
    value: function setBaseServerInfo() {
      $('#serverName').text("Server name: " + this.analysis.serverName);
      $('#osInfo').text("OS: " + this.analysis.os);
      $('#iisVersion').text("IIS Version: " + this.analysis.serverVersion);
    }
  }, {
    key: 'buildTable',
    value: function buildTable() {
      var that = this;
      function determineProgressColor(score) {
        if (score < 50) {
          return 'bg-danger';
        } else if (score < 75) {
          return 'amber bg-success';
        } else {
          return '';
        }
      }
      function createRow(analyzedSite) {
        var readinessScore = analyzedSite.readinessScore.toPrecision(3),
            readinessText = readinessScore,
            appCount = analyzedSite.analyzedApps.length,
            bindings = analyzedSite.site.bindings;
        var url = bindings.protocol + '://' + bindings.hostName + ':' + bindings.port;
        if (bindings.hostName.length === 0) {
          url = '';
        }
        var progressColor = determineProgressColor(readinessScore);
        if (!analyzedSite.site.authentication.hasOwnProperty('windowsAuthentication')) {
          progressColor = 'dull bg-success';
          readinessScore = 100;
          readinessText = 'Non WIA';
        }
        var progressHtml = '\n      <div class="progress">\n        <div class="progress-bar ' + progressColor + ' progress-bar-striped" role="progressbar" aria-valuenow="' + readinessScore + '%" aria-valuemin="0" aria-valuemax="100" style="width:' + readinessScore + '%">\n          ' + readinessText + '\n        </div>\n      </div>';
        var html = '<tr class=\'clickable-row\'>\n                    <td class="siteName">' + analyzedSite.siteName + '</td>\n                    <td>' + progressHtml + '</td>\n                    <td>' + appCount + '</td>\n                    <td><a href="' + url + '" target="_blank">' + url + '</a> </td>\n                    <td class="open-icon"> <i class="fas fa-angle-right"></i> </td>\n                  </tr>';
        return html;
      }
      var html = '<table class="table table">\n                    <thead>\n                      <tr>\n                        <th>IIS Site Name</th>\n                        <th>Readiness (%) </th>\n                        <th>Child Applications</th>\n                        <th>Defined Hostname</th>\n                        <th> </th>\n                      </tr>\n                    </thead>\n                    <tbody>';

      this.analysis.analyzedSites.sort(function (a, b) {
        return b.readinessScore - a.readinessScore;
      }).forEach(function (site) {
        html += createRow(site);
      });
      html += '</tbody></table>';
      return html;
    }
  }, {
    key: 'orderChecks',
    value: function orderChecks(checks) {
      var c = checks.sort(function (a, b) {
        if (a.status === b.status) {
          return 0;
        } else if (a.status === 'correct') {
          return -1;
        } else if (a.status === 'warning' && b.status === 'incorrect') {
          return -1;
        } else {
          return 1;
        }
      });
    }
  }, {
    key: 'buildSummaryView',
    value: function buildSummaryView(clickedSite) {
      var that = this;
      function buildListItem(check) {
        var html = '',
            addColon = check.value !== '' ? ' : ' : '',
            itemText = check.name + addColon + check.value;
        if (check.status === 'correct') {
          html = '<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="' + check.details + '">' + itemText + '<span class="badge badge-primary badge-pill">\u2713</span></a>';
        } else if (check.status === 'warning') {
          html = '<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="' + check.details + '">' + itemText + '<span class="badge badge-warning badge-pill"><i class="fas fa-question"></i></span></a>';
        } else {
          html = '<a href="#" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center detailedItem" data-details="' + check.details + '">' + itemText + '<span class="badge badge-danger badge-pill"><i class="fas fa-exclamation"></i></span></a>';
        }
        return html;
      }

      function buildSiteSection() {
        function buildSiteTitle() {
          var readinessScore = clickedSite.readinessScore.toPrecision(3);
          if (!clickedSite.site.authentication.hasOwnProperty('windowsAuthentication')) {
            readinessScore = 'Non WIA';
          }
          var html = '\n        <div class="row">\n          <div class="col" style="white-space: nowrap;">\n            <h3>Site: <span class="sectionTitle"> ' + clickedSite.siteName + ' </span> </h3>\n          </div>\n          <div class="col" style="white-space: nowrap;">\n            <h3>Readiness Score: <span class="sectionTitle"> ' + readinessScore + ' </span> </h3>\n          </div>\n          </div>';
          return html;
        }
        var html = '<div class="siteSection">';
        html += buildSiteTitle();
        that.orderChecks(clickedSite.checks);
        clickedSite.checks.forEach(function (check) {
          html += buildListItem(check);
        });
        html += '</div>';
        return html;
      }
      function buildAppsSection() {
        //7/6 there is a div not being closed? Must be careful here as I am storing the app data in this div then doing a parent search to find
        function buildAppTitle(app) {
          var appData = app.app,
              readinessScore = app.readinessScore.toPrecision(3);
          var html = '\n        <div class="row" data-appName="' + appData.appName + '">\n          <div class="col" style="white-space: nowrap;">\n            <h5 class="sectionHeader">App: <span class="sectionTitle"> ' + appData.appName + ' </span> </h5>\n          </div>\n          <div class="col" style="white-space: nowrap;">\n            <h5 class="sectionHeader">Readiness Score: <span class="sectionTitle"> ' + readinessScore + ' </span> </h5>\n          </div>\n          </div>';
          return html;
        }
        var html = '';
        clickedSite.analyzedApps.forEach(function (app) {
          html += '<div class="appSection">';
          html += buildAppTitle(app);
          //html += `<div class="appSection" data-appName="${appData.appName}"> <h5 class="sectionHeader">App: ${appData.appName} <span style="float:right"> Readiness Score: ${readinessScore}</span></h5>`;
          that.orderChecks(app.checks);
          app.checks.forEach(function (check) {
            html += buildListItem(check);
          });
          html += '</div>';
        });
        return html;
      }
      var html = buildSiteSection();
      html += buildAppsSection();
      return html;
    }
  }, {
    key: 'findSite',
    value: function findSite(siteName) {
      var found = this.analysis.analyzedSites.find(function (a) {
        if (a.siteName === siteName) {
          return a;
        }
      });
      return found;
    }
  }, {
    key: 'buildTutorial',
    value: function buildTutorial() {
      var html = '<div style="margin-left: 10%;">\n                  <a href="./documentation.html" style="color:black;"> <h3> About This Tool</h3> </a>\n                  <p>If this is your first time using this tool it is highly recommended to thoroughly read the documentation</p>\n                  <p> Click a site in the table to the left to reveal its configuration settings in the context of Application Proxy</p>\n                  <p> Once a site has been clicked you can select one of the list items for a more detailed view / publication script </p>\n                  <p>Use the readiness heuristic score to quickly gauge what sites or apps likely need the most work.</p>\n                </div>';
      return html;
    }
  }, {
    key: 'spawnModal',
    value: function spawnModal(siteOrApp, type) {
      function siteModalBody() {
        var site = siteOrApp.site;
        function buildSpnIdentityTable() {
          function createRow(spnNumber, spnValue) {
            var html = '<tr class=\'clickable-row\'>\n                        <td>' + site.appPool.username + '</td>\n                        <td>' + spnValue + '</td>\n                      </tr>';
            return html;
          }
          var html = '<table class="table" id="spnTable">\n                        <thead>\n                          <tr>\n                            <th>Configured Identity</th>\n                            <th>Existing SPNs</th>\n                          </tr>\n                        </thead>\n                        <tbody>';
          if (site.appPool.spns) {
            site.appPool.spns.forEach(function (spn, i) {
              html += createRow(i, spn);
            });
            html += '</tbody></table>';
            return html;
          } else {
            return '';
          }
        }
        function buildBindingsTable() {
          var bindings = site.bindings,
              addressText = bindings.address === '*' ? '* (Listening on all IPs)' : bindings.address;

          var html = '<table class="table" id="bindingsTable">\n                        <thead>\n                          <tr>\n                            <th>Site Bindings</th>\n                            <th></th>\n                          </tr>\n                          </thead>\n                          <tbody>\n                          <tr class=\'clickable-row\'>\n                              <td>Port:</td>\n                              <td>' + bindings.port + '</td>\n                          </tr>\n                          <tr class=\'clickable-row\'>\n                              <td>Address: </td>\n                              <td>' + addressText + '</td>\n                          </tr>\n                          <tr class=\'clickable-row\'>\n                              <td>Hostname: </td>\n                              <td>' + bindings.hostName + '</td>\n                          </tr>\n                        </tbody></table>\n                        ';
          return html;
        }
        function buildSiteCheckTable() {
          var createdCheckCount = 0;
          function createCheckRow(check) {
            var html = '';
            if (check.status !== 'correct') {
              createdCheckCount++;
              var checkStatusHtml = '<span class="badge badge-warning badge-pill"><i class="fas fa-question"></i></i></span>';
              if (check.status === 'incorrect') {
                checkStatusHtml = '<span class="badge badge-danger badge-pill"><i class="fas fa-exclamation"></i></span>';
              }
              html = '<tr class=\'clickable-row\'>\n                          <td>' + check.name + '</td>\n                          <td>' + checkStatusHtml + '</td>\n                          <td>' + check.detailsHtml + '</td>\n                        </tr>';
            }
            return html;
          }
          var checks = siteOrApp.checks;
          var html = '<table class="table" id="checksTable">\n                        <thead>\n                          <tr>\n                            <th>Site Check</th>\n                            <th>Status</th>\n                            <th>Possible Solution</th>\n                          </tr>\n                          </thead>\n                          <tbody>\n                        ';
          checks.forEach(function (check) {
            html += createCheckRow(check);
          });

          html += '</tbody></table>';
          if (createdCheckCount === 0) {
            html = '';
          }
          return html;
        }
        function buildInfoSection() {
          var html = '<div class="modalInfo">';
          html += '<h3>General Info</h3>';
          html += '<p> Important info</p>';
          html += '</div>';
          return html;
        }
        function buildAppPoolTable() {
          var identityClassRow = '';
          if (site.appPool.identityObjectClass) {
            identityClassRow = '<tr class=\'clickable-row\'>\n                                    <td>Identity Object Class</td>\n                                    <td>' + site.appPool.identityObjectClass + '</td>\n                              </tr>';
          }
          var html = '<table class="table" id="appPoolTable">\n                        <thead>\n                          <tr>\n                            <th>App Pool Settings</th>\n                            <th></th>\n                          </tr>\n                          </thead>\n                          <tbody>\n                          <tr class=\'clickable-row\'>\n                              <td>App Pool Name</td>\n                              <td>' + site.appPool.name + '</td>\n                          </tr>\n                          <tr class=\'clickable-row\'>\n                              <td>Identity Type</td>\n                              <td>' + site.appPool.identityType + '</td>\n                          </tr>\n                          ' + identityClassRow + '\n                          <tr class=\'clickable-row\'>\n                              <td>Identity Value</td>\n                              <td>' + site.appPool.username + '</td>\n                        </tr>\n                        </tbody></table>\n                        ';
          return html;
        }
        //let html = buildInfoSection();
        var html = buildBindingsTable();
        html += buildAppPoolTable();
        html += buildSpnIdentityTable();
        html += buildSiteCheckTable();
        return html;
      }
      function appModalBody() {
        var app = siteOrApp.app;
        function buildSpnIdentityTable() {
          function createRow(spnNumber, spnValue) {
            var html = '<tr class=\'clickable-row\'>\n                        <td>' + app.appPool.username + '</td>\n                        <td>' + spnValue + '</td>\n                      </tr>';
            return html;
          }
          var html = '<table class="table" id="spnTable">\n                        <thead>\n                          <tr>\n                          <th>Configured Identity</th>\n                          <th>Existing SPNs</th>\n                          </tr>\n                        </thead>\n                        <tbody>';
          app.appPool.spns.forEach(function (spn, i) {
            html += createRow(i, spn);
          });
          html += '</tbody></table>';
          return html;
        }
        function buildAppPoolTable() {
          var identityClassRow = '';
          if (app.appPool.identityObjectClass) {
            identityClassRow = '<tr class=\'clickable-row\'>\n                                    <td>Identity Object Class</td>\n                                    <td>' + app.appPool.identityObjectClass + '</td>\n                              </tr>';
          }
          var html = '<table class="table" id="appPoolTable">\n                        <thead>\n                          <tr>\n                            <th>App Pool Settings</th>\n                            <th></th>\n                          </tr>\n                          </thead>\n                          <tbody>\n                          <tr class=\'clickable-row\'>\n                              <td>App Pool Name</td>\n                              <td>' + app.appPool.name + '</td>\n                          </tr>\n                          <tr class=\'clickable-row\'>\n                              <td>Identity Type</td>\n                              <td>' + app.appPool.identityType + '</td>\n                          </tr>\n                          ' + identityClassRow + '\n                          <tr class=\'clickable-row\'>\n                              <td>Identity Value</td>\n                              <td>' + app.appPool.username + '</td>\n                        </tr>\n                        </tbody></table>\n                        ';
          return html;
        }
        function buildAppCheckTable() {
          var createdCheckCount = 0;
          function createRow(check) {
            var html = '';
            if (check.status !== 'correct') {
              createdCheckCount++;
              var checkStatusHtml = '<span class="badge badge-warning badge-pill"><i class="fas fa-question"></i></span>';
              if (check.status === 'incorrect') {
                checkStatusHtml = '<span class="badge badge-danger badge-pill"><i class="fas fa-exclamation"></i></span>';
              }
              html = '<tr class=\'clickable-row\'>\n                      <td>' + check.name + '</td>\n                      <td>' + checkStatusHtml + '</td>\n                      <td>' + check.detailsHtml + '</td>\n                        </tr>';
            }
            return html;
          }
          var checks = siteOrApp.checks;
          var html = '<table class="table" id="checksTable">\n                        <thead>\n                          <tr>\n                            <th>App Check</th>\n                            <th>Status</th>\n                            <th>Possible Solution</th>\n                          </tr>\n                          </thead>\n                          <tbody>\n                        ';
          checks.forEach(function (check) {
            html += createRow(check);
          });

          html += '</tbody></table>';
          if (createdCheckCount === 0) {
            html = '';
          }
          return html;
        }
        function buildInfoSection() {
          var html = '<div class="modalInfo">';
          html += '<h3> Info for App </h3>';
          html += '<p> This is important info about App.... </p>';
          html += '</div>';
          return html;
        }
        //let html = buildInfoSection();
        var html = buildAppPoolTable();
        html += buildSpnIdentityTable();
        html += buildAppCheckTable();
        return html;
      }

      if (type === 'site') {
        var site = siteOrApp.site,
            modalTitle = "Site Name: " + site.siteName;
        $('.modal-title').text(modalTitle);
        $('.modal-body').html(siteModalBody());
      } else if (type === 'app') {
        var app = siteOrApp.app,
            _modalTitle = "Application name: " + app.appName;
        $('.modal-title').text(_modalTitle);
        $('.modal-body').html(appModalBody());
      }
      $('#detailModal').data('currentData', siteOrApp);
      $('#detailModal').modal({});
    }
  }, {
    key: 'handles',
    value: function handles() {
      var _this = this;

      var that = this;
      function setDetailedItemsHandle() {
        $('.detailedItem').on('click', function (el) {
          var parent = $(el.target).parent(),
              siteContext = $('#detailedView').data('data'),
              analyzedApps = siteContext.analyzedApps;
          var siteOrApp = void 0,
              type = void 0;
          if (parent.hasClass('appSection')) {
            var appName = parent.find('.row').attr('data-appName');
            analyzedApps.find(function (a) {
              var currApp = a.app.appName;
              if (currApp === appName) {
                siteOrApp = a;
                type = 'app';
              }
            });
          } else {
            siteOrApp = siteContext;
            type = 'site';
          }
          that.spawnModal(siteOrApp, type);
        });
      }
      function toggleRow(clickedRow) {
        //first reset current selection
        var tableRows = $('#siteTable').find('tr').toArray(),
            iconCol = $(clickedRow).find('.open-icon');

        if ($(clickedRow).hasClass('table-primary')) {
          //The clicked row is currently open
          var _iconCol = $(clickedRow).find('.open-icon');
          _iconCol.html('<i class="fas fa-angle-right"></i>');
          $(clickedRow).removeClass('table-primary');
          $('#detailedView').fadeOut('fast', function () {
            $('#detailedView').html(that.buildTutorial());
            $('#detailedView').fadeIn();
          });
        } else {
          tableRows.forEach(function (row) {
            if ($(row).hasClass('table-primary')) {
              var _iconCol2 = $(row).find('.open-icon');
              _iconCol2.html('<i class="fas fa-angle-right"></i>');
              $(row).removeClass('table-primary');
            }
          });
          $(clickedRow).addClass('table-primary');
          $(iconCol).html('<i class="fas fa-angle-left"></i>');
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
      $('#autoPubBtn').on('click', function (el) {
        window.location.href = './autoPub.html';
      });
      $('#downloadJson').on('click', function (el) {
        var currentData = $('#detailModal').data('currentData'),
            siteOrAppName = currentData.siteName || currentData.app.appName,
            filename = siteOrAppName.split(' ').join('_') + '.json',
            jsonData = JSON.stringify(currentData);
        download(filename, jsonData);
      });
      $('.clickable-row').on('click', function (el) {
        var clickedRow = $(el.target).closest('.clickable-row'),
            siteName = clickedRow.find('.siteName').text(),
            analyzedSite = _this.findSite(siteName);
        if (clickedRow) toggleRow(clickedRow);
        $('#detailedView').html(_this.buildSummaryView(analyzedSite));
        $('#detailedView').data('data', analyzedSite);
        setDetailedItemsHandle(analyzedSite);
      });

      $(window).on('resize', function (el) {
        that.resizeModal();
      });
    }
  }, {
    key: 'resizeModal',
    value: function resizeModal() {
      var maxModalHeight = $(window).height() - 200;
      $('#detailModal .modal-body').css('max-height', maxModalHeight + 'px');
    }
  }, {
    key: 'buildView',
    value: function buildView() {
      var htmlTable = this.buildTable(this.analysis.analyzedSites);
      $('#siteTable').append(htmlTable);
      this.setBaseServerInfo();
      $('#detailedView').html(this.buildTutorial());
      this.resizeModal();
      this.handles();
    }
  }, {
    key: 'buildHeadlessView',
    value: function buildHeadlessView() {
      function rebuildBody() {
        var baseHtml = '<main role="main" class="container-fluid">\n            <div class="modal" id="detailModal" tabindex="-1" role="dialog" aria-hidden="true">\n              <div class="modal-dialog modal-dialog-centered" role="document" style="max-width:800px">\n                <div class="modal-content">\n                  <div class="modal-header">\n                    <h1 class="modal-title">Modal title</h1>\n                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                      <span aria-hidden="true">&times;</span>\n                    </button>\n                  </div>\n                  <div class="modal-body" style="overflow-y:scroll;">\n                  </div>\n                  <div class="modal-footer">\n                    <button type="button" class="btn btn-primary" id="downloadJson">Download JSON <i class="fas fa-download"></i></button>\n                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n                  </div>\n                </div>\n              </div>\n            </div>\n            <div class="baseInfo">\n              <h1 class="mt-5" id="serverName"></h1>\n              <h5 id="iisVersion"></h5>\n              <h5 id="osInfo"></h5>\n            </div>\n            <br>\n            <br>\n            <div class="container" style="max-width:1400px; margin-top:2%">\n              <div class="row">\n                <div class="col-sm">\n                  <div id="siteTable">\n                    <h2>Discovered Sites</h2>\n                  </div>\n                  <br/>\n                  <div>\n                    <h4>Ready to Automate Publication?</h4>\n                    <button type="button" class="btn btn-primary" id="autoPubBtn">Generate Publication Scripts <i class="fas fa-arrow-right"></i></button>\n                  </div>\n                </div>\n                <div class="col-sm" id="rightColumn">\n                  <div style="margin-left:2%">\n                    <div class="list-group" id="detailedView">\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </main>\n          <footer class="footer">\n            <div class="container" style="height:200px">\n            </div>\n          </footer>';

        $('#headlessContainer').html(baseHtml);
      }

      rebuildBody();
      var htmlTable = this.buildTable(this.analysis.analyzedSites);
      $('#siteTable').append(htmlTable);
      $('#detailedView').html(this.buildTutorial());
      this.setBaseServerInfo();
      this.handles();
    }
  }]);

  return ViewBuilder;
}();
