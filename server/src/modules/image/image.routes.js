const express = require('express');
const prisma = require('../../config/prisma');
const asyncHandler = require('../../middleware/asyncHandler');

const router = express.Router();

// Generic BLOB image server. Each entity keeps its bytes + mime type in the DB.
// NOTE (Phase 3 fast-follow): migrate these to Supabase Storage + signed URLs so
// large binaries don't travel through the app/DB on every request.
function serveImage(model, dataField, mimeField) {
  return asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const record = await prisma[model].findUnique({
      where: { id },
      select: { [dataField]: true, [mimeField]: true },
    });
    if (!record || !record[dataField]) return res.status(404).send('Image not found');

    res.set('Content-Type', record[mimeField] || 'image/png');
    res.set('Cache-Control', 'public, max-age=86400'); // 24h
    res.send(Buffer.from(record[dataField]));
  });
}

router.get('/groups/:id', serveImage('group', 'imageData', 'imageMimeType'));
router.get('/airlines/:id', serveImage('airline', 'logoData', 'logoMimeType'));
router.get('/banks/:id', serveImage('bank', 'imageData', 'imageMimeType'));

module.exports = router;
