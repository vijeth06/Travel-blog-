const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Trip = require('../models/Trip');
const PDFDocument = require('pdfkit');
const { createEvents } = require('ics');

router.use(protect);

// GET /api/export/trip/:id/pdf - Export trip as PDF
router.get('/trip/:id/pdf', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="trip-${trip.title.replace(/\\s+/g, '-')}.pdf"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(24).text(trip.title, { align: 'center' });
    doc.moveDown();

    // Add description
    if (trip.description) {
      doc.fontSize(12).text(trip.description);
      doc.moveDown();
    }

    // Add dates if available
    if (trip.startDate || trip.endDate) {
      doc.fontSize(10).text(`Dates: ${trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'} - ${trip.endDate ? new Date(trip.endDate).toLocaleDateString() : 'N/A'}`);
      doc.moveDown();
    }

    // Add items
    doc.fontSize(16).text('Trip Items:', { underline: true });
    doc.moveDown(0.5);

    trip.items.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}. ${item.type.toUpperCase()}`);
      if (item.note) {
        doc.fontSize(10).text(`   ${item.note}`, { indent: 20 });
      }
      doc.moveDown(0.3);
    });

    // Finalize PDF
    doc.end();

  } catch (err) {
    console.error('Error exporting trip to PDF', err);
    res.status(500).json({ success: false, message: 'Failed to export trip to PDF' });
  }
});

// GET /api/export/trip/:id/ics - Export trip as calendar file
router.get('/trip/:id/ics', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (!trip.startDate || !trip.endDate) {
      return res.status(400).json({ success: false, message: 'Trip must have start and end dates' });
    }

    // Create calendar event
    const startDate = new Date(trip.startDate);
    const endDate = new Date(trip.endDate);

    const event = {
      start: [startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate()],
      end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()],
      title: trip.title,
      description: trip.description || 'Travel trip',
      location: trip.title,
      status: 'CONFIRMED',
      busyStatus: 'BUSY',
    };

    const { error, value } = createEvents([event]);

    if (error) {
      console.error('ICS creation error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create calendar file' });
    }

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="trip-${trip.title.replace(/\\s+/g, '-')}.ics"`);
    res.send(value);

  } catch (err) {
    console.error('Error exporting trip to ICS', err);
    res.status(500).json({ success: false, message: 'Failed to export trip to calendar' });
  }
});

// GET /api/export/trip/:id/json - Export trip as JSON
router.get('/trip/:id/json', async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="trip-${trip.title.replace(/\\s+/g, '-')}.json"`);
    res.json(trip);

  } catch (err) {
    console.error('Error exporting trip to JSON', err);
    res.status(500).json({ success: false, message: 'Failed to export trip to JSON' });
  }
});

module.exports = router;
