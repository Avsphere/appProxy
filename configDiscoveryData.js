let configDiscoveryData = {
    "serverName":  "PSEUDOPREM-IIS",
    "os":  "Microsoft Windows Server 2016 Datacenter",
    "sites":  [
                  {
                      "siteName":  "kerbAuth",
                      "appPool":  {
                                      "username":  "LOLUVW\\avsp-service",
                                      "spns":  [
                                                   "http/pseudoprem-iis.loluvw.xyz",
                                                   "http/pseudoprem-iis"
                                               ],
                                      "name":  "kerbAuth",
                                      "identityType":  "SpecificUser"
                                  },
                      "applications":  [
                                           {
                                               "appPool":  {
                                                               "username":  "LOLUVW\\avsp-service",
                                                               "spns":  [
                                                                            "http/pseudoprem-iis.loluvw.xyz",
                                                                            "http/pseudoprem-iis"
                                                                        ],
                                                               "name":  "kerbAuth",
                                                               "identityType":  "SpecificUser"
                                                           },
                                               "appName":  "test",
                                               "authentication":  {
                                                                      "windowsAuthentication":  {
                                                                                                    "useAppPoolCredentials":  true,
                                                                                                    "useKernelMode":  true
                                                                                                }
                                                                  }
                                           },
                                           {
                                               "appPool":  {
                                                               "username":  "NA",
                                                               "spns":  [
                                                                            "host/pseudoprem-iis",
                                                                            "host/pseudoprem-iis.loluvw.xyz"
                                                                        ],
                                                               "name":  "whateverTest",
                                                               "identityType":  "ApplicationPoolIdentity"
                                                           },
                                               "appName":  "whatever",
                                               "authentication":  {
                                                                      "basicAuthentication":  {

                                                                                              }
                                                                  }
                                           }
                                       ],
                      "authentication":  {
                                             "windowsAuthentication":  {
                                                                           "useAppPoolCredentials":  true,
                                                                           "useKernelMode":  true
                                                                       }
                                         }
                  },
                  {
                      "siteName":  "nodeDummy",
                      "appPool":  {
                                      "username":  "LOLUVW\\avsp-service",
                                      "spns":  [
                                                   "http/pseudoprem-iis.loluvw.xyz",
                                                   "http/pseudoprem-iis"
                                               ],
                                      "name":  "nodeDummyAppPool",
                                      "identityType":  "SpecificUser"
                                  },
                      "applications":  null,
                      "authentication":  {
                                             "anonymousAuthentication":  {

                                                                         }
                                         }
                  },
                  {
                      "siteName":  "superDummy",
                      "appPool":  {
                                      "username":  "NA",
                                      "spns":  [
                                                   "host/pseudoprem-iis",
                                                   "host/pseudoprem-iis.loluvw.xyz"
                                               ],
                                      "name":  "superDummy",
                                      "identityType":  "ApplicationPoolIdentity"
                                  },
                      "applications":  null,
                      "authentication":  {
                                             "FormsAuthentication":  {

                                                                     }
                                         }
                  }
              ],
    "iisVersion":  "10.0.14393.0"
}
