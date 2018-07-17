param(
    [string]$dirPath,
    [string]$connectorName,
    $onlyJson
)
$Global:metaData = @{ checkConnector = $false; connectorName = ''}
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
function Get-Bindings {
    [CmdletBinding()]
    Param (
        [string]$siteName
    )
    Begin {
        $bindingConfig = Get-WebBinding $siteName
        $bindingInformation = $bindingConfig.bindingInformation.split(':')

        $relevantData = @{}
    }

    Process {
       $relevantData.protocol = $bindingConfig.protocol
       $relevantData.address = $bindingInformation[0]
       $relevantData.port = $bindingInformation[1]
       $relevantData.hostName = $bindingInformation[2]
    }

    End {
        return $relevantData
    }
}


function Get-ValidSpns {
    [CmdletBinding()]
    Param (
        [string]$poolIdentity
    )
    Begin {
        $serverName = $env:COMPUTERNAME.ToLower()
        $FQDN = ( (Get-WmiObject win32_computersystem).DNSHostName + "." + (Get-WmiObject win32_computersystem).Domain ).toLower()
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


function InstallRsat {
    try {
        Write-Warning "A Connector name was supplied, but RSAT-AD-Powershell has not been installed, ATTEMPTING INSTALLATION"
        Install-WindowsFeature -Name "RSAT-AD-PowerShell" -ErrorAction Stop

    } catch {
        throw "Unable to install the RSAT-AD feature $error"
    }

}

function Get-Authentication {
    [CmdletBinding()]
    Param ( [string]$siteName, [string]$appName )

    Begin {
        $authentication = @{}
        $authTypes = Get-WebConfiguration -filter "system.webServer/security/authentication/*" -PSPath "IIS:\Sites\$siteName\"
        if ( $PSBoundParameters.ContainsKey('appName') -eq $true ) { $authTypes = Get-WebConfiguration -filter "system.webServer/security/authentication/*" -PSPath "IIS:\Sites\$siteName\$appName" }
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

                    $authenticationDetails.useAppPoolCredentials = $authType.useAppPoolCredentials
                    $authenticationDetails.useKernelMode = $authType.useKernelMode
                    $authenticationDetails.providers = $providers
                }

                $authentication.Add( $authenticationName, $authenticationDetails )
            }
        }
    }

    End {
        return $authentication
    }
}



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
            $appConfig.authentication = Get-Authentication -siteName $siteName -appName $appConfig.appName
            $appConfig.appPool = Get-AppPoolConfig -appPoolName $_.applicationPool

            if ( $appConfig.authentication.Keys.contains('windowsAuthentication') -and $Global:metaData.checkConnector -eq $true ) {
                $appConfig.delegationSettings = CheckDelegationSettings -spns $appConfig.appPool.spns
            }
            $applicationsConfig.add( $appConfig )
        }
    }
    End {
        return $applicationsConfig
    }
}

function CheckDelegationSettings {
    [CmdletBinding()]
    param(
    $spns
    )

    Begin {

        $delegationSettings = New-Object System.Collections.Generic.List[System.Object]

    }
    Process {
        if ( $spns.length -gt 0 ) {
            $spns | ForEach-Object {
                $delegationResults = ValidateConnectorDelegationConfiguration -appSpn $_ -connectorMachineName $Global:metaData.connectorName
                $delegationSettings.add( $delegationResults );
            }
        }

    }

    End {

        return $delegationSettings

    }


}

function ValidateConnectorDelegationConfiguration {

    [CmdletBinding()]
    param
    (
        [Parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]
	    [string]
        $appSpn,


        [Parameter(Mandatory=$true)]
	    [string]
        $connectorMachineName
    )

    Begin {
        $connectorMachine = Get-ADComputer -Identity $connectorMachineName -Properties * -ErrorAction SilentlyContinue
        $delegationConfig = @{ 'spn' = $appSpn }

    }

    Process {

        if ( $connectorMachine -eq $null ) {
            throw "Connector machine not found"
        }

        $targetSpnInConnector = $connectorMachine.'msDS-AllowedToDelegateTo' | where {$_ -eq $appSpn}

        if ( $targetSpnInConnector -eq $null ) {
            $delegationConfig.targetSpnInConnector = $false

        } else {
            $delegationConfig.targetSpnInConnector = $true
        }

        if ( $connectorMachine.TrustedToAuthForDelegation -eq $false) {
            $delegationConfig.trustedToAuthForDelegation = $false

        } else {
            $delegationConfig.trustedToAuthForDelegation = $true
        }

    }

    End {

        return $delegationConfig

    }

}

function Build-AppProxyConfiguration {
    [CmdletBinding()]
    param( $checkConnector = $false )

    Begin {
        $siteList = New-Object System.Collections.Generic.List[System.Object]
        $masterConfiguration = @{}

        $masterConfiguration.iisVersion = Get-iisVersion;
        $masterConfiguration.serverName = $env:COMPUTERNAME;
        $masterConfiguration.os = (gcim Win32_OperatingSystem).Caption
        $masterConfiguration.duplicateSpns = IsDuplicateSpns
    }

    Process {
        Get-Website | ForEach-Object {
            $siteName = $_.name
            $poolName = $_.ApplicationPool
            $siteConfig = @{'siteName' = $siteName }
            $siteConfig.authentication = Get-Authentication -siteName $siteName
            $siteConfig.appPool = Get-AppPoolConfig -appPoolName $poolName
            $siteConfig.applications = Get-ApplicationsConfig -siteName $siteName
            $siteConfig.bindings = Get-Bindings -siteName $siteName

            if ( $siteConfig.authentication.Keys.contains('windowsAuthentication') -and $Global:metaData.checkConnector -eq $true ) {
                $siteConfig.delegationSettings = CheckDelegationSettings -spns  $siteConfig.appPool.spns
            }
          $siteList.Add( $siteConfig )
      }
    }

    End {
        $masterConfiguration.add( 'sites' , $siteList );
        return $masterConfiguration;
    }



}


function Run-Main {
    [CmdletBinding()]
    Param(
        [string]$dirPath = (Get-Location).Path,
        [string]$connectorName,
        $onlyJson = "false"
    )
    Begin {
        $jsonData = '';
        if ( $PSBoundParameters.ContainsKey('dirPath') -eq $false ) {
            Write-Warning "Parameter dirPath was not supplied, executing in current directory: $dirPath"
        }

        if ( $PSBoundParameters.ContainsKey('connectorName') -eq $false ) {
            Write-Warning "Parameter connectorName was not supplied, therefore cannot check KCD delegation settings"
        }
        else {
           if ( (Get-WindowsFeature RSAT-AD-PowerShell).InstallState -eq "Installed" ) {
                Write-Host "RSAT-AD is installed. Beginning discovery"
                $Global:metaData.checkConnector = $true;
                $Global:metaData.connectorName = $connectorName;

           } else {
                InstallRsat
           }
        }
    }

    Process {
        $configData = Build-AppProxyConfiguration
        $configData.checkedConnector = $Global:metaData.checkConnector
        $jsonData = $configData | ConvertTo-Json -Depth 100

        if ( $onlyJson -eq $true -or $onlyJson.toLower() -eq "true" ) {
            Write-Host $jsonData
        } else {
            $fileContent = 'var configDiscoveryData = ' + $jsonData
            New-Item -Path ($dirPath + '\data\configDiscoveryData.js') -type file -Value $fileContent -Force
        }

    }

}

$runCommand = "Run-Main"

if ( $PSBoundParameters.ContainsKey('dirPath') -eq $true ) {
    $runCommand += " -dirPath $dirPath";
}
if ( $PSBoundParameters.ContainsKey('connectorName') -eq $true ) {
    $runCommand += " -connectorName $connectorName";
}
if ( $PSBoundParameters.ContainsKey('onlyJson') -eq $true ) {
    $runCommand += " -onlyJson $onlyJson";
}

 iex $runCommand

 start chrome .\index.html
