
const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
} = require('../controllers/contactController');

// All routes below require authentication
router.use(authMiddleware);

// Get all contacts
router.get('/', getContacts);

// Add a contact
router.post('/', addContact);

// Update a contact
router.put('/:id', updateContact);

// Delete a contact
router.delete('/:id', deleteContact);

module.exports = router;
