const express = require('express');
const router = express.Router();
const { Group, Airline, Bank } = require('../config/database');

// Serve group image from DB
router.get('/groups/:id', async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id, {
      attributes: ['imageData', 'imageMimeType']
    });

    if (!group || !group.imageData) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', group.imageMimeType || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400'); // cache 24h
    res.send(group.imageData);
  } catch (error) {
    res.status(500).send('Error loading image');
  }
});

// Serve airline logo from DB
router.get('/airlines/:id', async (req, res) => {
  try {
    const airline = await Airline.findByPk(req.params.id, {
      attributes: ['logoData', 'logoMimeType']
    });

    if (!airline || !airline.logoData) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', airline.logoMimeType || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(airline.logoData);
  } catch (error) {
    res.status(500).send('Error loading image');
  }
});

// Serve bank image from DB
router.get('/banks/:id', async (req, res) => {
  try {
    const bank = await Bank.findByPk(req.params.id, {
      attributes: ['imageData', 'imageMimeType']
    });

    if (!bank || !bank.imageData) {
      return res.status(404).send('Image not found');
    }

    res.set('Content-Type', bank.imageMimeType || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(bank.imageData);
  } catch (error) {
    res.status(500).send('Error loading image');
  }
});

module.exports = router;
