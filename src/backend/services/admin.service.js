// services/admin.service.js - Servicio de administración
const { findUserById } = require('./user.service');

// Simulación de datos para demostración
let systemLogs = [];
let systemSettings = {
  maintenanceMode: false,
  registrationEnabled: true,
  maxLoginAttempts: 5,
  sessionTimeout: 3600,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  }
};

const getDashboardStats = async () => {
  // En producción, obtener de la base de datos
  return {
    totalUsers: 1234,
    activeUsers: 892,
    newRegistrationsToday: 45,
    newRegistrationsThisWeek: 312,
    activeSessions: 156,
    systemHealth: 'operational',
    lastBackup: new Date().toISOString(),
    diskUsage: '45%',
    cpuUsage: '23%',
    memoryUsage: '67%',
    alerts: 3,
    pendingReports: 2
  };
};

const getAllUsers = async ({ page, limit, search }) => {
  // En producción, consultar base de datos con paginación
  const mockUsers = [
    {
      id: '1',
      email: 'admin@universidad.edu',
      name: 'Admin Principal',
      role: 'admin',
      active: true,
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date()
    },
    {
      id: '12345',
      email: 'demo@universidad.edu',
      name: 'Juan Pérez',
      role: 'student',
      active: true,
      createdAt: new Date('2024-06-20'),
      lastLogin: new Date()
    },
    {
      id: '2',
      email: 'profesor@universidad.edu',
      name: 'María García',
      role: 'teacher',
      active: true,
      createdAt: new Date('2024-03-10'),
      lastLogin: new Date()
    }
  ];

  // Filtrar por búsqueda
  const filteredUsers = search 
    ? mockUsers.filter(user => 
        user.email.includes(search) || 
        user.name.toLowerCase().includes(search.toLowerCase())
      )
    : mockUsers;

  // Paginación
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    users: paginatedUsers.map(({ password, ...user }) => user),
    pagination: {
      page,
      limit,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / limit)
    }
  };
};

const getUserDetails = async (userId) => {
  const user = await findUserById(userId);
  if (!user) return null;

  // Agregar información adicional
  return {
    ...user,
    loginHistory: [
      { date: new Date(), ip: '192.168.1.100', userAgent: 'Chrome/120.0' },
      { date: new Date(Date.now() - 86400000), ip: '192.168.1.100', userAgent: 'Chrome/120.0' }
    ],
    permissions: ['read:profile', 'update:profile', 'read:courses'],
    enrolledCourses: 3,
    completedCourses: 1,
    averageGrade: 4.5
  };
};

const updateUserRole = async (userId, newRole) => {
  const user = await findUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');

  // En producción, actualizar en BD
  user.role = newRole;
  
  // Registrar en log
  logSystemEvent('ROLE_CHANGE', {
    userId,
    oldRole: user.role,
    newRole,
    timestamp: new Date()
  });

  return user;
};

const toggleUserStatus = async (userId, active) => {
  const user = await findUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');

  // En producción, actualizar en BD
  user.active = active;
  
  logSystemEvent('USER_STATUS_CHANGE', {
    userId,
    active,
    timestamp: new Date()
  });

  return user;
};

const getSystemLogs = async ({ type, startDate, endDate, limit }) => {
  // Filtrar logs según criterios
  let filteredLogs = systemLogs;

  if (type !== 'all') {
    filteredLogs = filteredLogs.filter(log => log.type === type);
  }

  if (startDate) {
    filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
  }

  if (endDate) {
    filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
  }

  // Ordenar por fecha descendente y limitar
  return filteredLogs
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
};

const getSecurityAlerts = async () => {
  // En producción, obtener de sistema de monitoreo
  return [
    {
      id: '1',
      type: 'MULTIPLE_LOGIN_ATTEMPTS',
      severity: 'medium',
      message: 'Múltiples intentos de login fallidos desde IP 192.168.1.50',
      timestamp: new Date(),
      resolved: false
    },
    {
      id: '2',
      type: 'UNUSUAL_ACTIVITY',
      severity: 'low',
      message: 'Actividad inusual detectada en cuenta usuario@universidad.edu',
      timestamp: new Date(Date.now() - 3600000),
      resolved: true
    },
    {
      id: '3',
      type: 'SYSTEM_UPDATE',
      severity: 'info',
      message: 'Actualización de seguridad disponible',
      timestamp: new Date(Date.now() - 86400000),
      resolved: false
    }
  ];
};

const generateReport = async ({ type, startDate, endDate }) => {
  // En producción, generar reportes reales
  const reports = {
    users: {
      totalUsers: 1234,
      newUsers: 156,
      activeUsers: 892,
      inactiveUsers: 342,
      usersByRole: {
        student: 1000,
        teacher: 150,
        admin: 10,
        user: 74
      }
    },
    activity: {
      totalLogins: 5678,
      uniqueUsers: 892,
      averageSessionDuration: '45 minutes',
      peakHours: ['9:00 AM', '2:00 PM', '7:00 PM'],
      mostActiveUsers: ['user1@universidad.edu', 'user2@universidad.edu']
    },
    security: {
      failedLoginAttempts: 234,
      blockedIPs: 12,
      suspiciousActivities: 5,
      securityAlerts: 8,
      resolvedIncidents: 6
    },
    performance: {
      averageResponseTime: '234ms',
      uptime: '99.9%',
      errorRate: '0.1%',
      requestsPerSecond: 45,
      peakLoad: '2:00 PM'
    }
  };

  return {
    type,
    startDate,
    endDate,
    generatedAt: new Date(),
    data: reports[type]
  };
};

const checkSystemHealth = async () => {
  // En producción, verificar servicios reales
  return {
    status: 'healthy',
    services: {
      database: { status: 'operational', responseTime: '45ms' },
      cache: { status: 'operational', responseTime: '2ms' },
      storage: { status: 'operational', usage: '45%' },
      email: { status: 'operational', queue: 0 },
      oauth: { status: 'operational', providers: ['google'] }
    },
    performance: {
      cpu: '23%',
      memory: '67%',
      disk: '45%',
      network: 'normal'
    },
    lastChecked: new Date()
  };
};

const updateSystemSettings = async (settings) => {
  // En producción, guardar en BD y aplicar cambios
  Object.assign(systemSettings, settings);
  
  logSystemEvent('SETTINGS_UPDATE', {
    settings,
    timestamp: new Date()
  });

  return systemSettings;
};

// Función auxiliar para registrar eventos
const logSystemEvent = (type, data) => {
  systemLogs.push({
    id: Date.now().toString(),
    type,
    data,
    timestamp: new Date()
  });
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserRole,
  toggleUserStatus,
  getSystemLogs,
  getSecurityAlerts,
  generateReport,
  checkSystemHealth,
  updateSystemSettings
};