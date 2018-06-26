class ConfigApi {
  constructor( rawData ) {
    this.rawData = rawData
  }

  getSiteNames() {
    return this.rawData.sites.map( (s) => { return s.siteName; })
  }
  getServerName() {
    return this.rawData.serverName;
  }
  getOs() {
    return this.rawData.os;
  }
  getSite( siteName ) {
    let name = siteName.toLowerCase()
    let site = this.rawData.sites.find( (s) => {
      if ( s.siteName.toLowerCase() === name ) {
        return s;
      }
    })
    return site;
  }
  getSites() {
    return this.rawData.sites;
  }
  getSiteApps( siteName ) {
    let site = this.getSite(siteName);
    return site.applications;
  }

  getAuthNames( siteOrApp ) {
    if ( !siteOrApp.hasOwnProperty('authentication') ) { throw new "getAuth cannot find authentication property" }
    return Object.keys(siteOrApp.authentication)
  }





}
