
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // No exponer detalles en producción
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const status = err.status || 500;
  const message = isDevelopment ? err.message : 'Error interno del servidor';
  
  res.status(status).json({
    error: message,
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = errorHandler;