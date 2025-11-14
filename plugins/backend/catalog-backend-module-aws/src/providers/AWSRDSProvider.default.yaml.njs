{% extends 'AwsEntityProvider.base.yaml.njs' %}

{% set entityName = data.DBInstanceIdentifier | truncate(62) %}
{% set entityTitle = data.DBInstanceIdentifier %}
{% set entityType = "rds-instance" %}

{% block additionalMetadata %}
  dbInstanceClass: {{ data.DBInstanceClass | default(null) }}
  dbEngine: "{{ data.Engine }}"
  dbEngineVersion: "{{ data.EngineVersion }}"
  allocatedStorage: {{ data.AllocatedStorage }}
  preferredMaintenanceWindow: {{ data.PreferredMaintenanceWindow }}
  preferredBackupWindow: {{ data.PreferredBackupWindow }}
  backupRetentionPeriod: {{ data.BackupRetentionPeriod }}
  isMultiAz: {{ data.MultiAZ }}
  automaticMinorVersionUpgrade: {{ data.AutoMinorVersionUpgrade }}
  isPubliclyAccessible: {{ data.PubliclyAccessible }}
  storageType: {{ data.StorageType }}
  isPerformanceInsightsEnabled: {{ data.PerformanceInsightsEnabled }}
{% endblock %}
