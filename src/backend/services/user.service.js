// En producción, esto conectaría con una base de datos real

const users = [
  {
    id: '12345',
    email: 'demo@universidad.edu',
    password: '$2a$10$YourHashedPasswordHere',
    role: 'student',
    name: 'Juan Pérez',
    matricula: '2021-001234',
    carrera: 'Ingeniería en Sistemas',
    semestre: '8vo'
  }
];

const findUserById = async (id) => {
  return users.find(user => user.id === id);
};

const findUserByEmail = async (email) => {
  return users.find(user => user.email === email);
};

const createOrUpdateUser = async (userData) => {
  // En producción, guardar en BD
  const existingUser = users.find(u => u.email === userData.email);
  
  if (existingUser) {
    Object.assign(existingUser, userData);
    return existingUser;
  }
  
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    role: 'user'
  };
  
  users.push(newUser);
  return newUser;
};

const getUserProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  
  const { password, ...profile } = user;
  return profile;
};

const updateUserProfile = async (userId, updates) => {
  const user = await findUserById(userId);
  if (!user) throw new Error('Usuario no encontrado');
  
  Object.assign(user, updates);
  const { password, ...profile } = user;
  return profile;
};

const getUserSettings = async (userId) => {
  // En producción, obtener de BD
  return {
    notifications: true,
    theme: 'light',
    language: 'es',
    twoFactorAuth: true
  };
};

const updateUserSettings = async (userId, settings) => {
  // En producción, guardar en BD
  return settings;
};

const getUserCourses = async (userId) => {
  // En producción, obtener de BD según el usuario
  return [
    { id: 1, name: 'Desarrollo Web', credits: 4 },
    { id: 2, name: 'Base de Datos', credits: 3 },
    { id: 3, name: 'Seguridad Informática', credits: 4 }
  ];
};

module.exports = {
  findUserById,
  findUserByEmail,
  createOrUpdateUser,
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getUserCourses
};