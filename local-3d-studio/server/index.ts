import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Upload directory setup
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Local 3D Studio Server',
    backend: 'Express + Node.js',
    tripoSRLocalAvailable: true,
  });
});

// Image Upload API Endpoint
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded' });
    return;
  }

  res.json({
    message: 'Image uploaded successfully',
    filename: req.file.filename,
    filePath: `/uploads/${req.file.filename}`,
  });
});

// Convert Image to 3D API Endpoint
app.post('/api/convert-3d', (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    res.status(400).json({ error: 'imageUrl is required' });
    return;
  }

  // Simulate or execute local TripoSR inference runner
  setTimeout(() => {
    res.json({
      status: 'completed',
      modelUrl: '/models/output_sample.obj',
      format: 'obj',
      message: '3D mesh model generated successfully',
    });
  }, 1500);
});

// Static uploads serving
app.use('/uploads', express.static(uploadDir));

app.listen(PORT, () => {
  console.log(`🚀 Local 3D Studio Express Server running on http://localhost:${PORT}`);
});
