function ConfigCheck( resultData ) {
  let requiredFields = [ 'name', 'value', 'status', 'details' ]
  requiredFields.forEach( (field) => {
    if ( !resultData.hasOwnProperty(field) ) {
      throw new Error("Status obj cannot be constructed with the given fields")
    } else {
      this[field] = resultData[field];
    }
  })
}

class Analyzer {
  constructor( api ) {
    this.api = api;
    this.analysisType = this.determineScope( api.getOs() )
    this.results = this.analysisType()
    this.attachDetails( this.results );
  }

  determineScope( siteOrApp ) {
    let osType = this.api.getOs(),
        scope = {};
    if ( osType.includes('Microsoft') ) {
      scope = this.windowsAnalysis.bind(this);
    } else {
      throw new Error("Unknown scope")
    }
      return scope;
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
  attachDetails() {
    this.results.serverName = this.api.getServerName()
    this.results.os = this.api.getOs();
    if ( this.api.rawData.hasOwnProperty('iisVersion') ) {
      this.results.serverVersion = this.api.rawData.iisVersion;
    } else {
      this.results.serverVersion = 'Unknown server version';
    }
  }
  windowsAnalysis() {
    let analysisType = "windows"
    function checkAuth( siteOrApp ) {
      //currently I have a leniance allowing for multiple auths
      let authenticationName = this.api.getAuthNames( siteOrApp )[0],
          checks = []

      if ( authenticationName === 'windowsAuthentication') {
        checks.push( new ConfigCheck({
          name : 'Authentication',
          value : authenticationName,
          status : 'correct',
          details : 'None'
        }))
        let useAppPoolCredentials = siteOrApp.authentication.windowsAuthentication.useAppPoolCredentials;
        if ( useAppPoolCredentials ) {
          checks.push( new ConfigCheck({
            name : 'useAppPoolCredentials',
            value : useAppPoolCredentials,
            status : 'correct',
            details : 'None'
          }))
        } else {
            checks.push( new ConfigCheck({
              name : 'useAppPoolCredentials',
              value : useAppPoolCredentials,
              status : 'incorrect',
              details : 'If trying to configure KCD this should be true so that the application pool identity can recieve tickets on behalf of the application'
            }))
        }
      } else {
        checks.push( new ConfigCheck({
          name : 'Authentication',
          value : authenticationName,
          status : 'incorrect',
          details : 'In order to configure SSO via app proxy the authentication method must be windowsIntegrated or if header based using pingAccess the authentication method should be anonymousAuthentication'
        }))
      }
      return checks;
    }
    function checkSpns( appPool ) {
      let spns = appPool.spns,
          checks = [],
          runAdditionalChecks = false,
          checkValue = appPool.username;
      if ( appPool.identityType === 'ApplicationPoolIdentity') {
        checkValue = appPool.identityType;
      }
      if ( spns.length > 0 ) {
        checks.push( new ConfigCheck({
          name : 'Valid SPNs exist for ',
          value : checkValue,
          status : 'correct',
          details : 'None'
        }))
        runAdditionalChecks = true;
      } else {
        checks.push( new ConfigCheck({
          name : 'SPNs do not exist for',
          value : checkValue,
          status : 'incorrect',
          details : 'None'
        }))
      }

      //@NOTE This seems like a worthless check
      if ( runAdditionalChecks && appPool.identityType === 'ApplicationPoolIdentity' || appPool.identityType === 'SpecificUser') {
        checks.push( new ConfigCheck({
          name : 'App Pool identity type ',
          value : appPool.identityType,
          status : 'correct',
          details : 'None'
        }))
      } else if ( runAdditionalChecks ) {
        checks.push( new ConfigCheck({
          name : 'App Pool identity type',
          value : appPool.identityType,
          status : 'incorrect',
          details : 'None'
        }))
      }

      return checks;
    }
    function checkAppPool( siteOrApp ) {
      let appPool = siteOrApp.appPool,
          checks = [];
      if ( appPool.identityType === 'SpecificUser' ) {
        checks.push( new ConfigCheck({
          name : 'App Pool Identity Type',
          value : appPool.identityType,
          status : 'correct',
          details : 'None'
        }))
        let spnChecks = checkSpns( appPool );
        checks = checks.concat( spnChecks)
      } else {
        checks.push( new ConfigCheck({
          name : 'App Pool Identity Type',
          value : appPool.identityType,
          status : 'incorrect',
          details : 'None'
        }))
      }
      return checks;
    }
    let sites = this.api.getSites(),
        analyzedSites = [];
    sites.map( (site) => {
      let analyzedApps = [],
          siteChecks = checkAuth.bind(this, site)().concat( checkSpns.bind(this, site.appPool)() ),
          siteApps = this.api.getSiteApps( site.siteName ),
          totalChecks = [];

      totalChecks = totalChecks.concat( siteChecks );
      if ( siteApps ) {
        siteApps.forEach( (app) => {
          let appChecks = checkAuth.bind(this, app)().concat(checkSpns.bind(this, app.appPool)() );
          let readinessScore = this.simpleReadiness( appChecks );
          totalChecks = totalChecks.concat( appChecks );
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
        readinessScore : this.simpleReadiness( totalChecks ),
        confidence : 0,
        checks : siteChecks,
        analyzedApps : analyzedApps
      })
    })
    let analysis = {
      type : analysisType,
      details : '',
      analyzedSites : analyzedSites,
    }
    return analysis;
  }

}
