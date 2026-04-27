import axios from 'axios';

const BASE = 'https://sers-backend-production.up.railway.app/api';
export const login = (username, password, role) =>
  axios.post(`${BASE}/auth/login`, { username, password, role });

export const getStudent = (id) =>
  axios.get(`${BASE}/student/${id}`);

export const getTimetable = (studentId) =>
  axios.get(`${BASE}/student/${studentId}/timetable`);

export const getAvailableElectives = (studentId) =>
  axios.get(`${BASE}/student/${studentId}/electives`);

export const handleSelection = (studentId, courseId, action) =>
  axios.post(`${BASE}/student/selection`, { studentId, courseId, action });

export const getAllCourses = () =>
  axios.get(`${BASE}/courses`);

export const createCourse = (data) =>
  axios.post(`${BASE}/courses`, data);

export const updateCourse = (id, data) =>
  axios.put(`${BASE}/courses/${id}`, data);

export const deleteCourse = (id) =>
  axios.delete(`${BASE}/courses/${id}`);

export const getAdminDashboard = () =>
  axios.get(`${BASE}/admin/dashboard`);

export const getAllStudents = () =>
  axios.get(`${BASE}/admin/students`);

export const getStudentsForCourse = (courseId) =>
  axios.get(`${BASE}/admin/courses/${courseId}/students`);

export const overrideAllocation = (studentId, courseId) =>
  axios.post(`${BASE}/admin/override?studentId=${studentId}&courseId=${courseId}`);

export const removeStudentFromCourse = (studentId, courseId) =>
  axios.delete(`${BASE}/admin/courses/${courseId}/students/${studentId}`);

export const getProfessorCourses = (facultyId) =>
  axios.get(`${BASE}/professor/${facultyId}/courses`);

export const getStudentsForProfessorCourse = (courseId) =>
  axios.get(`${BASE}/professor/course/${courseId}/students`);
