// controllers/admin.controller.js - Controlador de administración
const adminService = require('../services/admin.service');

const getDashboard = async (req, res, next) => {
  try {
    const dashboardData = await adminService.getDashboardStats();
    res.json({ dashboard: dashboardData });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const users = await adminService.getAllUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });
    
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserDetails(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    const validRoles = ['student', 'teacher', 'admin', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Rol inválido. Roles permitidos: ' + validRoles.join(', ') 
      });
    }
    
    const updatedUser = await adminService.updateUserRole(userId, role);
    
    res.json({ 
      success: true, 
      message: 'Rol actualizado exitosamente',
      user: updatedUser 
    });
  } catch (error) {
    next(error);
  }
};

const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { active } = req.body;
    
    const updatedUser = await adminService.toggleUserStatus(userId, active);
    
    res.json({ 
      success: true, 
      message: `Usuario ${active ? 'activado' : 'desactivado'} exitosamente`,
      user: updatedUser 
    });
  } catch (error) {
    next(error);
  }
};

const getSystemLogs = async (req, res, next) => {
  try {
    const { type = 'all', startDate, endDate, limit = 100 } = req.query;
    
    const logs = await adminService.getSystemLogs({
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: parseInt(limit)
    });
    
    res.json({ logs });
  } catch (error) {
    next(error);
  }
};

const getSecurityAlerts = async (req, res, next) => {
  try {
    const alerts = await adminService.getSecurityAlerts();
    res.json({ alerts });
  } catch (error) {
    next(error);
  }
};

const generateReport = async (req, res, next) => {
  try {
    const { reportType, startDate, endDate } = req.body;
    
    const validReportTypes = ['users', 'activity', 'security', 'performance'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({ 
        error: 'Tipo de reporte inválido' 
      });
    }
    
    const report = await adminService.generateReport({
      type: reportType,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    
    res.json({ 
      success: true,
      report 
    });
  } catch (error) {
    next(error);
  }
};

const getSystemHealth = async (req, res, next) => {
  try {
    const health = await adminService.checkSystemHealth();
    res.json({ health });
  } catch (error) {
    next(error);
  }
};

const updateSystemSettings = async (req, res, next) => {
  try {
    const settings = req.body;
    
    // Validar configuraciones críticas
    const allowedSettings = [
      'maintenanceMode',
      'registrationEnabled',
      'maxLoginAttempts',
      'sessionTimeout',
      'passwordPolicy'
    ];
    
    const filteredSettings = Object.keys(settings)
      .filter(key => allowedSettings.includes(key))
      .reduce((obj, key) => {
        obj[key] = settings[key];
        return obj;
      }, {});
    
    const updatedSettings = await adminService.updateSystemSettings(filteredSettings);
    
    res.json({ 
      success: true,
      message: 'Configuración del sistema actualizada',
      settings: updatedSettings 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  getSystemLogs,
  getSecurityAlerts,
  generateReport,
  getSystemHealth,
  updateSystemSettings
};