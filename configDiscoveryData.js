let configDiscoveryData = {
    "serverName":  "PSEUDOPREM-IIS",
    "os":  "Microsoft Windows Server 2016 Datacenter",
    "sites":  [
                  {
                      "siteName":  "kerbAuth",
                      "bindings":  {
                                       "port":  "80",
                                       "hostName":  "",
                                       "address":  "*"
                                   },
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
                                                                                                    "useAppPoolCredentials":  false,
                                                                                                    "providers":  {
                                                                                                                      "second":  null,
                                                                                                                      "first":  "Negotiate"
                                                                                                                  },
                                                                                                    "useKernelMode":  true
                                                                                                }
                                                                  }
                                           },
                                           {
                                               "appPool":  {
                                                               "username":  "PSEUDOPREM-IIS",
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

                                                                                              },
                                                                      "windowsAuthentication":  {
                                                                                                    "useAppPoolCredentials":  true,
                                                                                                    "providers":  {
                                                                                                                      "second":  null,
                                                                                                                      "first":  "Negotiate"
                                                                                                                  },
                                                                                                    "useKernelMode":  true
                                                                                                }
                                                                  }
                                           }
                                       ],
                      "authentication":  {
                                             "windowsAuthentication":  {
                                                                           "useAppPoolCredentials":  true,
                                                                           "providers":  {
                                                                                             "second":  null,
                                                                                             "first":  "Negotiate"
                                                                                         },
                                                                           "useKernelMode":  true
                                                                       }
                                         }
                  },
                  {
                      "siteName":  "nodeDummy",
                      "bindings":  {
                                       "port":  "3000",
                                       "hostName":  "",
                                       "address":  "*"
                                   },
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
                      "bindings":  {
                                       "port":  "8080",
                                       "hostName":  "superDummylol",
                                       "address":  "*"
                                   },
                      "appPool":  {
                                      "username":  "PSEUDOPREM-IIS",
                                      "spns":  [
                                                   "host/pseudoprem-iis",
                                                   "host/pseudoprem-iis.loluvw.xyz"
                                               ],
                                      "name":  "superDummy",
                                      "identityType":  "ApplicationPoolIdentity"
                                  },
                      "applications":  null,
                      "authentication":  {
                                             "anonymousAuthentication":  {

                                                                         },
                                             "windowsAuthentication":  {
                                                                           "useAppPoolCredentials":  false,
                                                                           "providers":  {
                                                                                             "second":  null,
                                                                                             "first":  "NTLM"
                                                                                         },
                                                                           "useKernelMode":  true
                                                                       }
                                         }
                  }
              ],
    "iisVersion":  "10.0.14393.0"
}
