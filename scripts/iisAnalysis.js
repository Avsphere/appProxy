function ConfigCheck( resultData ) {
  let requiredFields = [ 'name', 'value', 'status', 'detailsHtml', 'docRef' ]
  requiredFields.forEach( (field) => {
    if ( !resultData.hasOwnProperty(field) ) {
      throw new Error("Status obj cannot be constructed with the given fields")
    } else {
      this[field] = resultData[field];
    }
  })
}
function camelToTitleCase( stringValue ){
  return stringValue.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1")
}
class WindowsAnalysis {
  constructor( api ) {
    this.api = api;
    this.results = {
      serverName : this.api.getServerName(),
      os : this.api.getOs(),
      serverVersion : this.api.rawData.iisVersion || "Unknown IIS Version",
      analyzedSites : this.runChecks()
    };


  }
  simpleReadiness( checks ) {
    let totalChecks = checks.length,
        correctCount = 0;

    checks.forEach( (c) => {
      if ( c.status === 'correct' ) {
        correctCount++;
      }
    })
    return (correctCount / totalChecks)*100;
  }


  checkAuth( authData, identityType ) {
    let checks = [],
        authTypes = Object.keys(authData),
        runWIAChecks = false;
    if ( authTypes.length > 1 ) {
      if ( authTypes.includes('windowsAuthentication') ) {
        runWIAChecks = true;
        checks.push( new ConfigCheck({
          name : 'Multiple authentication methods are enabled',
          value : authTypes.toString().replace(/,/g, ', '),
          status : 'incorrect',
          detailsHtml : '<p> Multiple authentication methods are enabled where one is Windows Authentication. Because one authentication method may override another, this may produce unexpected results. Enable just the authentication method you intend this app to use. </p>',
          docRef : 'A1'
        }))
      } else {
        checks.push( new ConfigCheck({
          name : 'Multiple authentication methods are enabled',
          value : authTypes.toString().replace(/,/g, ', '),
          status : 'warning',
          detailsHtml : '<p> Multiple authentication methods are enabled. Because one authentication method may override another, this may produce unexpected results. Enable just the authentication method you intend this app to use. </p>',
          docRef : 'A2'
        }))
      }
    } else if ( authTypes.length === 1 ) {
      if ( authTypes.includes('windowsAuthentication') ) {
        runWIAChecks = true;
        checks.push( new ConfigCheck({
          name : 'Authentication',
          value : 'Windows Authentication',
          status : 'correct',
          detailsHtml : '',
          docRef : 'A3'

        }))
      } else {
        checks.push( new ConfigCheck({
          name : 'Authentication type is',
          value : authTypes[0],
          status : 'warning',
          detailsHtml : 'Because of the possible ways to configure non-Windows Integrated Authentication applications, there is not as much available diagnosis information.',
          docRef : 'A4'
        }))
      }
    }

    if ( runWIAChecks ) {
      /* Provider checks */
      let providers = authData.windowsAuthentication.providers;
      if ( !providers.first && !providers.second ) {
        checks.push( new ConfigCheck({
          name : 'No configured providers',
          value : '',
          status : 'incorrect',
          detailsHtml : '<p>For Kerberos to work properly Windows Integrated Authentication apps should have the provider "Negotiate" configured. Find more information <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> <p>',
          docRef : 'C3'
        }))
      } else if ( providers.first === 'Negotiate' ) {
        checks.push( new ConfigCheck({
          name : 'Configured first provider is',
          value : providers.first,
          status : 'correct',
          detailsHtml : '',
          docRef : 'C1'
        }))
      } else if ( providers.first === 'NTLM' ) {
        checks.push( new ConfigCheck({
          name : 'Configured first provider is',
          value : providers.first,
          status : 'incorrect',
          detailsHtml : '<p> If NTLM is listed as the first provider, then the Kerberos protocol will not be used. Find the proper provider configuration instructions <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
          docRef : 'C2'
        }))
      }

      /* App Pool identity and useKernelMode / useAppPoolCredentials checks */

      let useAppPoolCredentials = authData.windowsAuthentication.useAppPoolCredentials,
          useKernelMode = authData.windowsAuthentication.useKernelMode;
      if ( useAppPoolCredentials && useKernelMode ) {
      checks.push( new ConfigCheck({
        name : 'Both useKernelMode and useAppPoolCredentials are true',
        value : '',
        status : 'warning',
        detailsHtml : '<p> This configuration can yield unpredictable results, so either use an SPN that is defined against the Identity discovered in the above table, or consider setting useAppPoolCredentials to false, and using an SPN defined against the machine object, in AD. Find the instructions for the proper mode to use <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
        docRef : 'B6'
      }))
    }
    if ( useAppPoolCredentials && identityType === 'SpecificUser' ) {
        checks.push( new ConfigCheck({
          name : 'Identity type is Custom Account and useAppPoolCredentials is true',
          value : '',
          status : 'correct',
          detailsHtml : '',
          docRef : 'B1'
        }))
      } else if ( !useAppPoolCredentials && identityType === 'SpecificUser') {
         checks.push( new ConfigCheck({
           name : 'App pool configured identity is Custom Account and useAppPoolCredentials is false',
           value : '',
           status : 'incorrect',
           detailsHtml : '<p> The app pool has a "Custom Identity" configured, but useAppPoolCredentials is false. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
           docRef : 'B2'
         }))
       } else if ( useKernelMode && identityType !== 'SpecificUser') {
          checks.push( new ConfigCheck({
            name : `App pool identity is ${identityType} and useKernelMode is true`,
            value : '',
            status : 'warning',
            detailsHtml : '<p> While this could work if the connector has the SPNs registered to this identity, it is not recommended. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
            docRef : 'B3'
          }))
        } else if ( !useKernelMode && identityType !== 'SpecificUser') {
           checks.push( new ConfigCheck({
             name : `App pool identity is ${identityType} and useKernelMode is false`,
             value : '',
             status : 'incorrect',
             detailsHtml : `<p> The app pool configured identity is ${identityType} and useKernelMode is false. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>`,
             docRef : 'B4'
           }))
         } else {
           checks.push( new ConfigCheck({
             name : `App Pool configured identity and useAppPoolCredentials / useKernelMode error`,
             value : '',
             status : 'incorrect',
             detailsHtml : `<p> Generally the app pool identity should be set to "Custom Account" with useAppPoolCredentials set to true. Instructions for the proper configuration can be found <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a>> </p>`,
             docRef : 'B5'
           }))
         }
    }
    return checks;
  }
  checkAppPool( site ) {
    let checks = [],
        uniqDict = {},
        apps = this.api.getSiteApps( site.siteName );
    uniqDict[ site.appPool.name ] = true;
    if ( apps && apps.length > 1) {
      apps.forEach( (app) => {
        uniqDict[ app.appPool.name ] = true;
      })
      if ( Object.keys( uniqDict ).length > 1 ) {
        checks.push( new ConfigCheck({
          name : 'Site or child app(s) have differing app pools',
          value : Object.keys( uniqDict ).toString(),
          status : 'warning',
          detailsHtml : '<p> This site or its child app(s) are utilizing differing app pools which could be a cause of error if planning on KCD SSO </p>',
          docRef : 'F1'
        }))
      }
    }

    return checks;
  }

  checkSpns( appPool ) {
    let checks = [],
        spns = appPool.spns,
        checkValue = appPool.username,
        identityType = appPool.identityType;
    if ( identityType === 'SpecificUser' && spns && spns.length > 0 ) {
      checks.push( new ConfigCheck({
        name : 'Valid SPNs exist for configured identity type',
        value : '',
        status : 'correct',
        detailsHtml : '',
        docRef : 'D1'
      }))
    } else if ( spns && spns.length > 0 ) {
      checks.push( new ConfigCheck({
        name : `Valid SPNs exist for configured identity type, but identity type is ${identityType}`,
        value : '',
        status : 'warning',
        detailsHtml : `<p> If your intention was to decrypt the Kerberos ticket using the configured app pool identity ${identityType}, ${spns.length} do exist for this identity, but it is not the recommended configuration. Find how to set spns <a target="_blank" href="https://support.microsoft.com/en-us/help/929650/how-to-use-spns-when-you-configure-web-applications-that-are-hosted-on"> here </a> or find more comprehensive instructions <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>`,
        docRef : 'D2'
      }))
    } else {
      checks.push( new ConfigCheck({
        name : 'SPNs do not exist for',
        value : checkValue,
        status : 'incorrect',
        detailsHtml : '<p> No SPNs exist for the configure app pool identity, you can quickly find how to set SPNs <a target="_blank" href="https://support.microsoft.com/en-us/help/929650/how-to-use-spns-when-you-configure-web-applications-that-are-hosted-on"> here </a> or find more comprehensive instructions <a target="_blank" href="https://blogs.msdn.microsoft.com/chiranth/2014/04/17/setting-up-kerberos-authentication-for-a-website-in-iis/"> here </a> </p>',
        docRef : 'D3'
      }))
    }
    return checks;
  }



  checkDelegationSettings( siteOrApp ) {
    let containsWindowsAuth = Object.keys( siteOrApp.authentication ).includes('windowsAuthentication');
    if ( this.api.rawData.checkedConnector && containsWindowsAuth) {
      let checks = [],
          delegationSettings = siteOrApp.delegationSettings;
      if ( !delegationSettings ) {
        //In this case the user has WIA but no SPNs
        checks.push( new ConfigCheck({
          name : 'Delegation Check',
          value : 'No valid SPNs were found',
          status : 'incorrect',
          detailsHtml : '<p>The delegation check was ran but no valid SPNs exist. Find how to configure your connector <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>',
          docRef : 'E1'
        }))
        return checks;
      }
      delegationSettings.forEach( (item) => {
        if ( item.trustedToAuthForDelegation && item.targetSpnInConnector ) {
          checks.push( new ConfigCheck({
            name : 'Allowed to delegate to SPN',
            value : item.spn,
            status : 'correct',
            detailsHtml : '',
            docRef : 'E2'
          }))
        } else if ( !item.trustedToAuthForDelegation && item.targetSpnInConnector ) {
          checks.push( new ConfigCheck({
            name : 'Delegation Check',
            value : 'Connector is not configured to give delegationTo access',
            status : 'incorrect',
            detailsHtml : `<p> The ${item.spn} exists in the connector delegation configuration but this connector machine is not trusted for delegation, find the instructions <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>`,
            docRef : 'E3'
          }))
        } else if ( item.trustedToAuthForDelegation && !item.targetSpnInConnector ) {
          checks.push( new ConfigCheck({
            name : 'Delegation Check',
            value : 'The spn ' + item.spn + ' does not exist in the connector delegation tab',
            status : 'incorrect',
            detailsHtml : `<p> ${item.spn} does not exist in the connector delegation configuration but this connector machine is trusted for delegation, find the instructions <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>`,
            docRef : 'E4'
          }))
        } else {
          checks.push( new ConfigCheck({
            name : 'Delegation Check',
            value : 'SPN missing and no delegationTo access',
            status : 'incorrect',
            detailsHtml : '<p>Learn how to properly configure your connector <a target="_blank" href="https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/application-proxy-configure-single-sign-on-with-kcd"> here </a> </p>',
            docRef : 'E5'
          }))
        }
      })
      return checks;
    }
    else { return []; }
  }

  runChecks() {
    let that = this,
        sites = this.api.getSites(),
        analyzedSites = [];
    sites.map( (site) => {
      let totalChecks = [],
          siteChecks = [],
          analyzedApps = [],
          siteApps = this.api.getSiteApps( site.siteName );
      siteChecks = siteChecks.concat( that.checkAuth( site.authentication, site.appPool.identityType ) );
      siteChecks = siteChecks.concat( that.checkSpns( site.appPool ) );
      siteChecks = siteChecks.concat( that.checkDelegationSettings( site ) );
      siteChecks = siteChecks.concat( that.checkAppPool( site ) );
      totalChecks = totalChecks.concat( siteChecks );
      if ( siteApps ) {
        //This is to fix the powershell convert to json write bug
        if ( !siteApps.hasOwnProperty('length') ) { siteApps = [siteApps]; }

        siteApps.forEach( (app) => {
          let appChecks = [];

          appChecks = appChecks.concat( that.checkAuth( app.authentication, app.appPool.identityType ) );
          appChecks = appChecks.concat( that.checkSpns( app.appPool ) );
          appChecks = appChecks.concat( that.checkDelegationSettings( app ) );

          let readinessScore = that.simpleReadiness( appChecks );
          totalChecks = totalChecks.concat( appChecks )
          analyzedApps.push({
            app : app,
            readinessScore : readinessScore,
            checks : appChecks
          })

        })
      }
      analyzedSites.push({
        siteName : site.siteName,
        site : site,
        readinessScore : that.simpleReadiness( totalChecks ),
        checks : siteChecks,
        analyzedApps : analyzedApps
      })
    })

    return analyzedSites;
  }


}
