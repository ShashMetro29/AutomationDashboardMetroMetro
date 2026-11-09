const normalizeStatus = (value) => String(value ?? 'UNKNOWN').trim().toUpperCase();

const statusPriority = {
  UNKNOWN: 0,
  UP: 1,
  DEGRADED: 2,
  DOWN: 3,
};

export const getHealthStatusMeta = (status) => {
  const normalized = normalizeStatus(status);

  const statusMap = {
    UP: {
      label: 'Healthy',
      color: 'success',
      backgroundColor: 'rgba(46, 125, 50, 0.12)',
      textColor: '#2e7d32',
    },
    DEGRADED: {
      label: 'Degraded',
      color: 'warning',
      backgroundColor: 'rgba(237, 108, 2, 0.12)',
      textColor: '#ed6c02',
    },
    DOWN: {
      label: 'Down',
      color: 'error',
      backgroundColor: 'rgba(211, 47, 47, 0.12)',
      textColor: '#d32f2f',
    },
    UNKNOWN: {
      label: 'Unknown',
      color: 'default',
      backgroundColor: 'rgba(148, 163, 184, 0.12)',
      textColor: '#475569',
    },
  };

  return statusMap[normalized] || statusMap.UNKNOWN;
};

const getHealthEntryStatus = (entry) => normalizeStatus(entry?.status ?? entry?.health?.status ?? 'UNKNOWN');

const getHealthEntryMessage = (entry) => entry?.message || entry?.health?.message || 'No health details reported.';

export const summarizeHealthStatus = (entries = []) => {
  const healthEntries = Array.isArray(entries) ? entries.filter(Boolean) : [];

  if (healthEntries.length === 0) {
    return {
      status: 'UNKNOWN',
      label: 'Unknown',
      message: 'No health details reported.',
      upCount: 0,
      degradedCount: 0,
      downCount: 0,
      lastCheckedAt: null,
    };
  }

  const safeEntries = healthEntries.map((entry) => ({
    status: getHealthEntryStatus(entry),
    message: getHealthEntryMessage(entry),
    checkedAt: entry?.checkedAt || entry?.health?.checkedAt || null,
  }));

  const worstEntry = safeEntries.reduce((current, candidate) => {
    if (!current) {
      return candidate;
    }

    return statusPriority[candidate.status] > statusPriority[current.status] ? candidate : current;
  }, safeEntries[0]);

  const upCount = safeEntries.filter((entry) => entry.status === 'UP').length;
  const degradedCount = safeEntries.filter((entry) => entry.status === 'DEGRADED').length;
  const downCount = safeEntries.filter((entry) => entry.status === 'DOWN').length;

  const status = worstEntry?.status || 'UNKNOWN';

  return {
    status,
    label: getHealthStatusMeta(status).label,
    message: worstEntry?.message || 'No health details reported.',
    upCount,
    degradedCount,
    downCount,
    lastCheckedAt: safeEntries
      .map((entry) => entry.checkedAt)
      .filter(Boolean)
      .sort()
      .at(-1) || null,
  };
};

export const summarizeApplicationHealth = (application) => {
  const environments = Array.isArray(application?.environments) ? application.environments : [];
  const healthEntries = [];
  const environmentHealthEntries = [];

  environments.forEach((environment) => {
    if (environment?.health) {
      healthEntries.push(environment.health);
      environmentHealthEntries.push(environment.health);
    }

    const components = Array.isArray(environment?.components) ? environment.components : [];
    components.forEach((component) => {
      if (component?.health) {
        healthEntries.push(component.health);
      }
    });
  });

  const summary = summarizeHealthStatus(healthEntries);
  const environmentSummary = summarizeHealthStatus(environmentHealthEntries);

  return {
    ...summary,
    environmentCount: environments.length,
    healthyEnvironmentCount: environmentSummary.upCount,
    degradedEnvironmentCount: environmentSummary.degradedCount,
    downEnvironmentCount: environmentSummary.downCount,
    componentCount: environments.reduce(
      (total, environment) => total + (Array.isArray(environment?.components) ? environment.components.length : 0),
      0,
    ),
  };
};
