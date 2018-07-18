var configDiscoveryData = {
    "sites":  [
                  {
                      "bindings":  {
                                       "port":  "80",
                                       "protocol":  "http",
                                       "hostName":  "hrweb",
                                       "address":  "*"
                                   },
                      "delegationSettings":  [
                                                 {
                                                     "spn":  "http/pseudoprem-iis.loluvw.xyz",
                                                     "trustedToAuthForDelegation":  true,
                                                     "targetSpnInConnector":  true
                                                 },
                                                 {
                                                     "spn":  "http/pseudoprem-iis",
                                                     "trustedToAuthForDelegation":  true,
                                                     "targetSpnInConnector":  true
                                                 }
                                             ],
                      "applications":  null,
                      "appPool":  {
                                      "username":  "loluvw.xyz\\avsp-service",
                                      "spns":  [
                                                   "http/pseudoprem-iis.loluvw.xyz",
                                                   "http/pseudoprem-iis"
                                               ],
                                      "name":  "aspMaster",
                                      "identityType":  "SpecificUser",
                                      "identityObjectClass":  "user"
                                  },
                      "siteName":  "HR Web",
                      "authentication":  {
                                             "windowsAuthentication":  {
                                                                           "useAppPoolCredentials":  true,
                                                                           "providers":  {
                                                                                             "second":  "NTLM",
                                                                                             "first":  "Negotiate"
                                                                                         },
                                                                           "useKernelMode":  true
                                                                       }
                                         }
                  },
                  {
                      "bindings":  {
                                       "port":  "80",
                                       "protocol":  "http",
                                       "hostName":  "payrollmaster",
                                       "address":  "*"
                                   },
                      "delegationSettings":  [
                                                 {
                                                     "spn":  "http/pseudoprem-iis.loluvw.xyz",
                                                     "trustedToAuthForDelegation":  true,
                                                     "targetSpnInConnector":  true
                                                 },
                                                 {
                                                     "spn":  "http/pseudoprem-iis",
                                                     "trustedToAuthForDelegation":  true,
                                                     "targetSpnInConnector":  true
                                                 }
                                             ],
                      "applications":  [
                                           {
                                               "appPool":  {
                                                               "username":  "loluvw.xyz\\avsp-service",
                                                               "spns":  [
                                                                            "http/pseudoprem-iis.loluvw.xyz",
                                                                            "http/pseudoprem-iis"
                                                                        ],
                                                               "name":  "aspMaster",
                                                               "identityType":  "SpecificUser",
                                                               "identityObjectClass":  "user"
                                                           },
                                               "appName":  "dummyApp",
                                               "authentication":  {
                                                                      "windowsAuthentication":  {
                                                                                                    "useAppPoolCredentials":  true,
                                                                                                    "providers":  {
                                                                                                                      "second":  "NTLM",
                                                                                                                      "first":  "Negotiate"
                                                                                                                  },
                                                                                                    "useKernelMode":  false
                                                                                                }
                                                                  },
                                               "delegationSettings":  [
                                                                          {
                                                                              "spn":  "http/pseudoprem-iis.loluvw.xyz",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  true
                                                                          },
                                                                          {
                                                                              "spn":  "http/pseudoprem-iis",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  true
                                                                          }
                                                                      ]
                                           },
                                           {
                                               "appPool":  {
                                                               "username":  "loluvw.xyz\\avsp-service",
                                                               "spns":  [
                                                                            "http/pseudoprem-iis.loluvw.xyz",
                                                                            "http/pseudoprem-iis"
                                                                        ],
                                                               "name":  "aspDependent",
                                                               "identityType":  "SpecificUser",
                                                               "identityObjectClass":  "user"
                                                           },
                                               "appName":  "semiDummyApp",
                                               "authentication":  {
                                                                      "windowsAuthentication":  {
                                                                                                    "useAppPoolCredentials":  true,
                                                                                                    "providers":  {
                                                                                                                      "second":  "NTLM",
                                                                                                                      "first":  "Negotiate"
                                                                                                                  },
                                                                                                    "useKernelMode":  false
                                                                                                }
                                                                  },
                                               "delegationSettings":  [
                                                                          {
                                                                              "spn":  "http/pseudoprem-iis.loluvw.xyz",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  true
                                                                          },
                                                                          {
                                                                              "spn":  "http/pseudoprem-iis",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  true
                                                                          }
                                                                      ]
                                           }
                                       ],
                      "appPool":  {
                                      "username":  "loluvw.xyz\\avsp-service",
                                      "spns":  [
                                                   "http/pseudoprem-iis.loluvw.xyz",
                                                   "http/pseudoprem-iis"
                                               ],
                                      "name":  "aspDependent",
                                      "identityType":  "SpecificUser",
                                      "identityObjectClass":  "user"
                                  },
                      "siteName":  "Payroll Manager",
                      "authentication":  {
                                             "windowsAuthentication":  {
                                                                           "useAppPoolCredentials":  true,
                                                                           "providers":  {
                                                                                             "second":  "NTLM",
                                                                                             "first":  "Negotiate"
                                                                                         },
                                                                           "useKernelMode":  false
                                                                       }
                                         }
                  },
                  {
                      "siteName":  "FaceBook 2.0",
                      "bindings":  {
                                       "port":  "80",
                                       "protocol":  "http",
                                       "hostName":  "facebookv2",
                                       "address":  "*"
                                   },
                      "appPool":  {
                                      "username":  "PSEUDOPREM-IIS",
                                      "spns":  [
                                                   "host/pseudoprem-iis",
                                                   "host/pseudoprem-iis.loluvw.xyz"
                                               ],
                                      "name":  "formsExample",
                                      "identityType":  "ApplicationPoolIdentity",
                                      "identityObjectClass":  "computer"
                                  },
                      "applications":  {
                                           "appPool":  {
                                                           "username":  "PSEUDOPREM-IIS",
                                                           "spns":  [
                                                                        "host/pseudoprem-iis",
                                                                        "host/pseudoprem-iis.loluvw.xyz"
                                                                    ],
                                                           "name":  "basicAspDemo",
                                                           "identityType":  "ApplicationPoolIdentity",
                                                           "identityObjectClass":  "computer"
                                                       },
                                           "appName":  "sillyApp",
                                           "authentication":  {
                                                                  "windowsAuthentication":  {
                                                                                                "useAppPoolCredentials":  false,
                                                                                                "providers":  {
                                                                                                                  "second":  "NTLM",
                                                                                                                  "first":  "Negotiate"
                                                                                                              },
                                                                                                "useKernelMode":  true
                                                                                            }
                                                              },
                                           "delegationSettings":  [
                                                                      {
                                                                          "spn":  "host/pseudoprem-iis",
                                                                          "trustedToAuthForDelegation":  true,
                                                                          "targetSpnInConnector":  false
                                                                      },
                                                                      {
                                                                          "spn":  "host/pseudoprem-iis.loluvw.xyz",
                                                                          "trustedToAuthForDelegation":  true,
                                                                          "targetSpnInConnector":  false
                                                                      }
                                                                  ]
                                       },
                      "authentication":  {
                                             "anonymousAuthentication":  {

                                                                         }
                                         }
                  },
                  {
                      "bindings":  {
                                       "port":  "443",
                                       "protocol":  "http",
                                       "hostName":  "savewhales",
                                       "address":  "*"
                                   },
                      "delegationSettings":  null,
                      "applications":  null,
                      "appPool":  {
                                      "username":  "LOLUVW\\bad-service",
                                      "spns":  null,
                                      "name":  "misconfiguredSite",
                                      "identityType":  "SpecificUser",
                                      "identityObjectClass":  null
                                  },
                      "siteName":  "Save Whales",
                      "authentication":  {
                                             "windowsAuthentication":  {
                                                                           "useAppPoolCredentials":  true,
                                                                           "providers":  {
                                                                                             "second":  "NTLM",
                                                                                             "first":  "Negotiate"
                                                                                         },
                                                                           "useKernelMode":  true
                                                                       }
                                         }
                  },
                  {
                      "bindings":  {
                                       "port":  "80",
                                       "protocol":  "http",
                                       "hostName":  "",
                                       "address":  "*"
                                   },
                      "delegationSettings":  [
                                                 {
                                                     "spn":  "host/pseudoprem-iis",
                                                     "trustedToAuthForDelegation":  true,
                                                     "targetSpnInConnector":  false
                                                 },
                                                 {
                                                     "spn":  "host/pseudoprem-iis.loluvw.xyz",
                                                     "trustedToAuthForDelegation":  true,
                                                     "targetSpnInConnector":  false
                                                 }
                                             ],
                      "applications":  [
                                           {
                                               "appPool":  {
                                                               "username":  "PSEUDOPREM-IIS",
                                                               "spns":  [
                                                                            "host/pseudoprem-iis",
                                                                            "host/pseudoprem-iis.loluvw.xyz"
                                                                        ],
                                                               "name":  "badlyMisconfiguredSite",
                                                               "identityType":  "LocalService",
                                                               "identityObjectClass":  "computer"
                                                           },
                                               "appName":  "badApp",
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
                                                                  },
                                               "delegationSettings":  [
                                                                          {
                                                                              "spn":  "host/pseudoprem-iis",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  false
                                                                          },
                                                                          {
                                                                              "spn":  "host/pseudoprem-iis.loluvw.xyz",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  false
                                                                          }
                                                                      ]
                                           },
                                           {
                                               "appPool":  {
                                                               "username":  "PSEUDOPREM-IIS",
                                                               "spns":  [
                                                                            "host/pseudoprem-iis",
                                                                            "host/pseudoprem-iis.loluvw.xyz"
                                                                        ],
                                                               "name":  ".NET v2.0",
                                                               "identityType":  "ApplicationPoolIdentity",
                                                               "identityObjectClass":  "computer"
                                                           },
                                               "appName":  "terribleApp",
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
                                                                  },
                                               "delegationSettings":  [
                                                                          {
                                                                              "spn":  "host/pseudoprem-iis",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  false
                                                                          },
                                                                          {
                                                                              "spn":  "host/pseudoprem-iis.loluvw.xyz",
                                                                              "trustedToAuthForDelegation":  true,
                                                                              "targetSpnInConnector":  false
                                                                          }
                                                                      ]
                                           }
                                       ],
                      "appPool":  {
                                      "username":  "PSEUDOPREM-IIS",
                                      "spns":  [
                                                   "host/pseudoprem-iis",
                                                   "host/pseudoprem-iis.loluvw.xyz"
                                               ],
                                      "name":  "badlyMisconfiguredSite",
                                      "identityType":  "LocalService",
                                      "identityObjectClass":  "computer"
                                  },
                      "siteName":  "Conspiracy Central",
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
    "serverName":  "PSEUDOPREM-IIS",
    "iisVersion":  "10.0.14393.0",
    "os":  "Microsoft Windows Server 2016 Datacenter",
    "checkedConnector":  true,
    "duplicateSpns":  false
}
