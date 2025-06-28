// controllers/user.controller.js - Controlador de usuario
const userService = require('../services/user.service');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.user.id);
    res.json({ user: profile });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateUserProfile(req.user.id, req.body);
    res.json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};

const getSettings = async (req, res, next) => {
  try {
    const settings = await userService.getUserSettings(req.user.id);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const updated = await userService.updateUserSettings(req.user.id, req.body);
    res.json({ success: true, settings: updated });
  } catch (error) {
    next(error);
  }
};

const getCourses = async (req, res, next) => {
  try {
    const courses = await userService.getUserCourses(req.user.id);
    res.json({ courses });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  getCourses
};