// function ConfigCheck( resultData ) {
//   let requiredFields = [ 'name', 'value', 'status', 'details' ]
//   requiredFields.forEach( (field) => {
//     if ( !resultData.hasOwnProperty(field) ) {
//       throw new Error("Status obj cannot be constructed with the given fields")
//     } else {
//       this[field] = resultData[field];
//     }
//   })
// }

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
          name : 'Multiple enabled auths w/ W.I.A',
          value : authTypes.toString().replace(/,/g, ', '),
          status : 'incorrect',
          details : 'If for some reason two authentications are enabled if one is anonymous it would default to it'
        }))
      } else {
        checks.push( new ConfigCheck({
          name : 'Multiple enabled auths',
          value : authTypes.toString().replace(/,/g, ', '),
          status : 'warning',
          details : 'If for some reason two authentications are enabled if one is anonymous it would default to it'
        }))
      }
    } else if ( authTypes.length === 1 ) {
      if ( authTypes.includes('windowsAuthentication') ) {
        runWIAChecks = true;
        checks.push( new ConfigCheck({
          name : 'Authentication',
          value : 'windowsAuthentication',
          status : 'correct',
          details : 'None'
        }))
      } else {
        checks.push( new ConfigCheck({
          name : 'Authentication',
          value : authTypes[0],
          status : 'warning',
          details : 'This tool is less reliable for non WIA apps'
        }))
      }
    }

    if ( runWIAChecks ) {
      let useAppPoolCredentials = authData.windowsAuthentication.useAppPoolCredentials,
          useKernelMode = authData.windowsAuthentication.useKernelMode;
      if ( useAppPoolCredentials && useKernelMode ) {
      checks.push( new ConfigCheck({
        name : 'useKernelMode and useAppPoolCredentials',
        value : useKernelMode,
        status : 'incorrect',
        details : 'This is incorrect as it will always default to useAppPoolCredentials if available, and if it is not then just useKernelMode should be set'
      }))
      }
      if ( useAppPoolCredentials && identityType === 'SpecificUser' ) {
        checks.push( new ConfigCheck({
          name : 'useAppPoolCredentials',
          value : useAppPoolCredentials,
          status : 'correct',
          details : 'None'
        }))
      } else if ( useKernelMode && identityType === 'ApplicationPoolIdentity' ) {
          checks.push( new ConfigCheck({
            name : 'useKernelMode',
            value : useKernelMode,
            status : 'correct',
            details : 'If trying to configure KCD this should be true so that the application pool identity can recieve tickets on behalf of the application'
          }))
      } else if ( !useAppPoolCredentials && identityType === 'SpecificUser' ) {
          checks.push( new ConfigCheck({
            name : 'useAppPoolCredentials',
            value : useAppPoolCredentials,
            status : 'incorrect',
            details : 'If trying to configure KCD this should be true so that the application pool identity can recieve tickets on behalf of the application'
          }))
        } else if ( !useKernelMode && identityType === 'ApplicationPoolIdentity' ) {
            checks.push( new ConfigCheck({
              name : 'useKernelMode',
              value : useKernelMode,
              status : 'incorrect',
              details : 'If trying to configure KCD this should be true so that the application pool identity can recieve tickets on behalf of the application'
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
      console.log( uniqDict);
      if ( Object.keys( uniqDict ).length > 1 ) {
        checks.push( new ConfigCheck({
          name : 'Multiple App Pools',
          value : Object.keys( uniqDict ).toString(),
          status : 'warning',
          details : 'This sites apps are utilizing multiple app pools which is a likely cause of error if planning on KCD SSO'
        }))
      }
    }

    return checks;
  }

  checkSpns( appPool ) {
    let checks = [],
        spns = appPool.spns,
        checkValue = appPool.username;
    if ( appPool.identityType === 'ApplicationPoolIdentity') {
      checkValue = appPool.identityType;
      checks.push( new ConfigCheck({
        name : 'Identity Type is ',
        value : checkValue,
        status : 'warning',
        details : 'Generally one would would find this to be set to SpecificUser'
      }))
    } else if ( appPool.identityType === 'SpecificUser' ) {
      checks.push( new ConfigCheck({
        name : 'Identity Type is ',
        value : checkValue,
        status : 'correct',
        details : 'None'
      }))
    } else {
      checkValue = appPool.identityType;
      checks.push( new ConfigCheck({
        name : 'Identity Type is ',
        value : checkValue,
        status : 'incorrect',
        details : 'None'
      }))
    }
    if ( spns && spns.length > 0 ) {
      checks.push( new ConfigCheck({
        name : 'Valid SPNs exist for ',
        value : checkValue,
        status : 'correct',
        details : 'None'
      }))
    } else {
      checks.push( new ConfigCheck({
        name : 'SPNs do not exist for',
        value : checkValue,
        status : 'incorrect',
        details : 'Please create the required SPNs for the appPool identity'
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
          details : 'In this case there should already be an invalid SPN errror'
        }))
        return checks;
      }
      delegationSettings.forEach( (item) => {
        if ( item.trustedToAuthForDelegation && item.targetSpnInConnector ) {
          checks.push( new ConfigCheck({
            name : 'Delegation Check for ',
            value : item.spn,
            status : 'correct',
            details : 'None'
          }))
        } else if ( !item.trustedToAuthForDelegation && item.targetSpnInConnector ) {
          checks.push( new ConfigCheck({
            name : 'Delegation Check',
            value : 'Connector is not given delegationTo access',
            status : 'incorrect',
            details : 'The spn was added to the connector but the connector does not have delegationTo access'
          }))
        } else if ( item.trustedToAuthForDelegation && !item.targetSpnInConnector ) {
          checks.push( new ConfigCheck({
            name : 'Delegation Check',
            value : item.spn + ' does not exist in the connector',
            status : 'incorrect',
            details : 'The connector is properly configured to delegationTo but does not have the target SPN'
          }))
        } else {
          checks.push( new ConfigCheck({
            name : 'Delegation Check',
            value : 'SPN missing and no delegationTo access',
            status : 'incorrect',
            details : 'None'
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
