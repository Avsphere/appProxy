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
      let authTypes = this.api.getAuthNames( siteOrApp ),
          appPool = siteOrApp.appPool,
          checks = [];

      if ( authTypes.length > 1 ) {
        checks.push( new ConfigCheck({
          name : 'Mutliple enabled auths',
          value : authTypes.toString().replace(/,/g, ', '),
          status : 'warning',
          details : 'If for some reason two authentications are enabled if one is anonymous it would default to it'
        }))
      }
      if ( authTypes.includes('windowsAuthentication') ) {
        checks.push( new ConfigCheck({
          name : 'Authentication',
          value : 'windowsAuthentication',
          status : 'correct',
          details : 'None'
        }))
        let useAppPoolCredentials = siteOrApp.authentication.windowsAuthentication.useAppPoolCredentials,
            useKernelMode = siteOrApp.authentication.windowsAuthentication.useKernelMode;
        if ( useAppPoolCredentials && appPool.identityType === 'SpecificUser' ) {
          checks.push( new ConfigCheck({
            name : 'useAppPoolCredentials',
            value : useAppPoolCredentials,
            status : 'correct',
            details : 'None'
          }))
        } else if ( useKernelMode && appPool.identityType === 'ApplicationPoolIdentity' ) {
            checks.push( new ConfigCheck({
              name : 'useKernelMode',
              value : useKernelMode,
              status : 'correct',
              details : 'If trying to configure KCD this should be true so that the application pool identity can recieve tickets on behalf of the application'
            }))
        } else if ( !useAppPoolCredentials && appPool.identityType === 'SpecificUser' ) {
            checks.push( new ConfigCheck({
              name : 'useAppPoolCredentials',
              value : useAppPoolCredentials,
              status : 'incorrect',
              details : 'If trying to configure KCD this should be true so that the application pool identity can recieve tickets on behalf of the application'
            }))
          } else if ( !useKernelMode && appPool.identityType === 'ApplicationPoolIdentity' ) {
              checks.push( new ConfigCheck({
                name : 'useKernelMode',
                value : useKernelMode,
                status : 'incorrect',
                details : 'If trying to configure KCD this should be true so that the application pool identity can recieve tickets on behalf of the application'
              }))
            }
      } else {
        checks.push( new ConfigCheck({
          name : 'Authentication may require additional configuration',
          value : authTypes.toString().replace(/,/g, ', '),
          status : 'warning',
          details : 'This form of authentication is valid but requires additional configuration'
        }))
      }
      return checks;
    }
    function checkSpnsandPool( siteOrApp ){
      let appPool = siteOrApp.appPool,
          spns = appPool.spns,
          checks = [],
          runAdditionalChecks = false,
          checkValue = appPool.username;

      if ( appPool.identityType === 'ApplicationPoolIdentity') {
        checkValue = appPool.identityType;
        checks.push( new ConfigCheck({
          name : 'Identity Type is ApplicationPoolIdentity',
          value : checkValue,
          status : 'warning',
          details : 'None'
        }))
      } else if ( appPool.identityType === 'SpecificUser' ) {
        checks.push( new ConfigCheck({
          name : 'Identity Type is SpecificUser',
          value : checkValue,
          status : 'correct',
          details : 'None'
        }))
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

      return checks;
    }

    let sites = this.api.getSites(),
        analyzedSites = [];
    sites.map( (site) => {
      let analyzedApps = [],
          siteChecks = checkAuth.bind(this, site)().concat( checkSpnsandPool.bind(this, site)() ),
          siteApps = this.api.getSiteApps( site.siteName ),
          totalChecks = [];

      totalChecks = totalChecks.concat( siteChecks );
      if ( siteApps ) {
        siteApps.forEach( (app) => {
          let appChecks = checkAuth.bind(this, app)().concat(checkSpnsandPool.bind(this, app)() );
          let readinessScore = this.simpleReadiness( appChecks );
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
