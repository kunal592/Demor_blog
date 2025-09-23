import { prisma } from '../config/database.js';

/**
 * Create a new contact request
 */
export const createContactRequest = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
  }

  try {
    const contactRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        message,
      },
    });
    // Here you could also implement sending an email to the admin
    res.status(201).json({ success: true, message: 'Your request has been submitted successfully.', data: { contactRequest } });
  } catch (error) {
    console.error('Error creating contact request:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

/**
 * Get all contact requests (Admin only)
 */
export const getContactRequests = async (req, res) => {
  try {
    const contactRequests = await prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: { contactRequests } });
  } catch (error) {
    console.error('Error fetching contact requests:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};

/**
 * Update the status of a contact request (Admin only)
 */
export const updateContactRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { isResolved } = req.body;

  if (typeof isResolved !== 'boolean') {
    return res.status(400).json({ success: false, message: 'isResolved must be a boolean' });
  }

  try {
    const updatedRequest = await prisma.contactRequest.update({
      where: { id },
      data: { isResolved },
    });
    res.status(200).json({ success: true, message: 'Contact request updated successfully', data: { contactRequest: updatedRequest } });
  } catch (error) {
    console.error('Error updating contact request:', error);
    res.status(500).json({ success: false, message: 'Something went wrong' });
  }
};
