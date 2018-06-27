#Author: Avsphere
#Purpose : This script queries relevant IIS config in the context of App Proxy publication requirements
#Current State : Collects known data points, needs a few fixes eg the authentication form find fix, advanced error handling, support for *nix, additional parameter support (run on remote), help function

# This is intended to help if the server is very old - it may not be necessary, but I found it in a solution guide
function Import-WebAdministration {
    [CmdletBinding()]
    param()

    try {
	    Add-PSSnapin WebAdministration -ErrorAction Stop
    } catch {
            try {
		         Import-Module WebAdministration -ErrorAction Stop
		        } catch {
			        Write-Warning "We failed to load the WebAdministration module. This usually resolved by doing one of the following:"
			        Write-Warning "1. Install IIS via Add Roles and Features, Web Server (IIS)"
			        Write-Warning "2. Install .NET Framework 3.5.1"
			        Write-Warning "3. Upgrade to PowerShell 3.0 (or greater)"
			        Write-Warning "4. On Windows 2008 you might need to install PowerShell SnapIn for IIS from http://www.iis.net/downloads/microsoft/powershell#additionalDownloads"
			        throw ($error | Select-Object -First 1)
            }
    }
}





function Get-iisVersion {
    [CmdletBinding()]
    Param()
    $w3wpPath = $Env:WinDir + "\System32\inetsrv\w3wp.exe"
    if( Test-Path $w3wpPath) {
        $productProperty = Get-ItemProperty -Path $w3wpPath
        $iisVersion = $productProperty.VersionInfo.ProductVersion
        return $iisVersion
    }
    else {
        throw "Did not find IIS"
    }


}


function Get-AppPoolConfig {
    [CmdletBinding()]
    Param ( [string]$appPoolName )
    Begin {
        $poolConfig = @{ 'name' = $appPoolName }
        $username = $env:COMPUTERNAME
        $validSpns = Get-ValidSpns -poolIdentity $username
    }
    Process {
        $poolObj = gci -Path 'IIS:\AppPools' | where-object { $_.name -eq $appPoolName }
        if ( $poolObj.processModel.username.length -gt 0 ) {
            $username = $poolObj.processModel.username
            $validSpns = Get-ValidSpns -poolIdentity $username
        }
        $poolUsername = $username
        $poolConfig.Add( 'identityType' , $poolObj.processModel.identityType )
        $poolConfig.Add( 'username' , $username )
        $poolConfig.Add( 'spns', $validSpns)

    }

    End {
        return $poolConfig
    }
}

function Get-Bindings {
    [CmdletBinding()]
    Param (
        [string]$siteName
    )
    Begin {
        $bindingConfig = (Get-WebBinding $siteName).bindingInformation.split(':')
        $relevantData = @{}
    }

    Process {
       $relevantData.address = $bindingConfig[0]
       $relevantData.port = $bindingConfig[1]
       $relevantData.hostName = $bindingConfig[2]
    }

    End {
        return $relevantData
    }
}



### FIX ME - form authentication missing, and this should probably be combined with the Get-SiteAuthenticatio function
function Get-ApplicationAuthentication {
    [CmdletBinding()]
    Param ( [string]$siteName, [string]$appName )

    Begin {
        $authentication = @{}
        $authTypes = Get-WebConfiguration ` -filter "system.webServer/security/authentication/*" ` -PSPath "IIS:\Sites\$siteName\$appName"
        $providers = @{}
    }
    Process {
        foreach ($authType in $authTypes ) {
            $authenticationDetails = @{}
            $authenticationName = $authType.ItemXPath.split('/')[-1]
            if ( $authType.enabled -eq $True ) {
                if ( $authenticationName -eq "windowsAuthentication" ) {
                    $providers.first = $authType.providers.Collection[0].value
                    $providers.second = $authType.providers.Collection[1].value

                    $authenticationDetails.Add( 'useAppPoolCredentials' , $authType.useAppPoolCredentials )
                    $authenticationDetails.Add( 'useKernelMode' , $authType.useKernelMode )
                    $authenticationDetails.Add( 'providers' , $providers )

                }

                $authentication.Add( $authenticationName, $authenticationDetails )
            }
        }
        return $authentication
    }

}

##### FIX ME ####
#This returns the sites authentication methods.
#Form authentication isnt actually listed as an option, my way to check was if there was no authentications found then it should be forms
function Get-SiteAuthentication {
    [CmdletBinding()]
    Param ( [string]$siteName )

    Begin {
        $siteAuthentication = @{}
        $authTypes = (Get-WebConfigurationProperty -pspath 'MACHINE/WEBROOT/APPHOST' -location $siteName -filter "/system.WebServer/security/authentication/*" -Name '.')
        $providers = @{}
    }

    Process {
        foreach ($authType in $authTypes ) {
            $authenticationDetails = @{}
            $authenticationName = $authType.ItemXPath.split('/')[-1]
            if ( $authType.enabled -eq $True ) {
                if ( $authenticationName -eq "windowsAuthentication" ) {
                    $providers.first = $authType.providers.Collection[0].value
                    $providers.second = $authType.providers.Collection[1].value


                    $authenticationDetails.Add( 'useAppPoolCredentials' , $authType.useAppPoolCredentials )
                    $authenticationDetails.Add( 'useKernelMode' , $authType.useKernelMode )
                    $authenticationDetails.Add( 'providers' , $providers )
                }

                $siteAuthentication.Add( $authenticationName, $authenticationDetails )
            }
        }

        if ( $siteAuthentication.Count -eq 0 ) {
            #forms does not show normally
            $formsAuth = (Get-WebConfiguration system.web/authentication ( 'IIS:\sites\' + $siteName )  ).Mode

            if ( $formsAuth -eq 'Forms' ) {
                $siteAuthentication.Add( 'FormsAuthentication', $authenticationDetails )
            }
        }
    }

    End {
        return $siteAuthentication
    }
}

#Should I check that the ports the application is binded to are in the SPN?
#Is there other possibilites for valid SPNs? Would it be better to return all SPNs then validate on the analysis side?
function Get-ValidSpns {
    [CmdletBinding()]
    Param (
        [string]$poolIdentity
    )
    Begin {
        $serverName = $env:COMPUTERNAME.ToLower()
        $FQDN = ( (Get-WmiObject win32_computersystem).DNSHostName+"."+(Get-WmiObject win32_computersystem).Domain ).toLower()
        $spnConfig = New-Object System.Collections.Generic.List[System.Object]
    }
    Process {

        setspn -l $poolIdentity | foreach {
            $spnItem = $_.toLower()
            if ( $spnItem.Contains('host/') -or $spnItem.Contains('http/') -and (-Not $spnItem.Contains('restricted') ) ) {
                if ( $spnItem.contains($FQDN) -or $spnItem.contains($serverName) ) {
                    $spnConfig.add($spnItem.Trim())
                }
            }
        }


    }

    End {
        return $spnConfig
    }

}

#this function is sloppy in that it was not tested in a real use case since I am having trouble creating a dupe
function IsDuplicateSpns {
    [CmdletBinding()]
    Param ()
    Begin {
        $dupes = setspn -x
        $resultLine = $dupes[-2]
    }
    Process {
        if ( $resultLine.contains('0') ) {
            return $false
        } else {
            return $true
        }

    }
}

## simply abstracting away this convery process
function Get-SiteConfigurationJSON {
    return Build-AppProxyConfiguration | ConvertTo-Json -Depth 100
}

#This takes the json file and creates a js script with one global variable set to the JSON data
function InjectConfigIntoJS {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True)]
        [string]$dirPath,

        [Parameter(Mandatory=$True)]
        [string]$configData
    )

    $fileContent = 'let configDiscoveryData = ' + $configData

    New-Item -Path ($dirPath + '\configDiscoveryData.js') -type file -Value $fileContent -Force

    #returns a tag but is unnecessary since it is already in th html file
    return '<script type="application/javascript" src="./configDiscoveryData.js"><\script>';

}

# This is the second highest level as it builds a site configuration object
function Get-ApplicationsConfig {
    [CmdletBinding()]
    Param (
        [string]$siteName
    )
    Begin {
        $applicationsConfig = New-Object System.Collections.Generic.List[System.Object]

    }
    Process {
        Get-WebApplication -Site $siteName | ForEach-Object {
            $appConfig = @{}
            $appConfig.appName = $_.path.split('/')[1]
            $appConfig.authentication = Get-ApplicationAuthentication -siteName $siteName -appName $appConfig.appName
            $appConfig.appPool = Get-AppPoolConfig -appPoolName $_.applicationPool
            $applicationsConfig.add( $appConfig )
        }
    }
    End {
        return $applicationsConfig
    }
}

#Top level module function - returns as psObject
function Build-AppProxyConfiguration {
    [CmdletBinding()]
    param()
    Begin {
        $iisVersion = Get-iisVersion
        $siteList = New-Object System.Collections.Generic.List[System.Object]
        $masterConfiguration = @{}
    }

    Process {

        Get-Website | ForEach-Object {
        $siteName = $_.name
        $poolName = $_.ApplicationPool
        $siteConfig = @{'siteName' = $siteName }

        $siteConfig.authentication = Get-SiteAuthentication -siteName $siteName
        $siteConfig.appPool = Get-AppPoolConfig -appPoolName $poolName
        $siteConfig.applications = Get-ApplicationsConfig -siteName $siteName
        $siteConfig.bindings = Get-Bindings -siteName $siteName

        $siteList.Add( $siteConfig )
        }
    }

    End {
        $masterConfiguration.serverName = $env:COMPUTERNAME;
        $masterConfiguration.iisVersion = $iisVersion
        $masterConfiguration.os = (gcim Win32_OperatingSystem).Caption
        $masterConfiguration.add( 'sites' , $siteList );
        $masterConfiguration.duplicateSpns = IsDuplicateSpns
        return $masterConfiguration
    }

}



#master function -- this should be run to execute in entirety
#Assumes directory exists
function Do-ConfigDiscovery {
    [CmdletBinding()]
    Param(
        [Parameter(Mandatory=$True)]
        [string]$dirPath
    )

    $jsonData = Get-SiteConfigurationJSON

    InjectConfigIntoJS -dirPath $dirPath -configData $jsonData


    return 0;
}



#Do-ConfigDiscovery -dirPath C:\Users\avsp\AppData\Roaming\AppProxy
