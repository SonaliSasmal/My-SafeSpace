
const Contact = require('../models/Contact');

// ADD EMERGENCY CONTACT
const addContact = async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    const contact = await Contact.create({
      userId: req.userId,
      name,
      phone,
      relationship: relationship || 'Other',
    });

    res.status(201).json({
      success: true,
      message: 'Emergency contact added successfully',
      contact,
    });

  } catch (error) {
    console.error('Add contact error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to add emergency contact',
    });
  }
};


// GET ALL EMERGENCY CONTACTS
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });

  } catch (error) {
    console.error('Get contacts error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts',
    });
  }
};


// UPDATE EMERGENCY CONTACT
const updateContact = async (req, res) => {
  try {
    const { name, phone, relationship } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name and phone number are required',
      });
    }

    const contact = await Contact.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        name,
        phone,
        relationship: relationship || 'Other',
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      contact,
    });

  } catch (error) {
    console.error('Update contact error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to update emergency contact',
    });
  }
};


// DELETE EMERGENCY CONTACT
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully',
    });

  } catch (error) {
    console.error('Delete contact error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to delete emergency contact',
    });
  }
};


module.exports = {
  addContact,
  getContacts,
  updateContact,
  deleteContact,
};
