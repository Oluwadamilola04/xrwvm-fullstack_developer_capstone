const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');

const Reviews = require('./review');
const Dealerships = require('./dealership');

const app = express();
const router = express.Router();
const port = 3030;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const reviewsData = JSON.parse(fs.readFileSync('reviews.json', 'utf8'));
const dealershipsData = JSON.parse(fs.readFileSync('dealerships.json', 'utf8'));
const mongoUrl = process.env.MONGO_URL || 'mongodb://mongodb:27017/dealershipsDB';

mongoose.connect(mongoUrl);

const seedData = async () => {
  try {
    const reviewCount = await Reviews.countDocuments();
    const dealershipCount = await Dealerships.countDocuments();

    if (reviewCount === 0) {
      await Reviews.insertMany(reviewsData.reviews);
    }

    if (dealershipCount === 0) {
      await Dealerships.insertMany(dealershipsData.dealerships);
    }
  } catch (error) {
    console.error('Error seeding documents', error);
  }
};

seedData();

const apiLinks = [
  { method: 'GET', path: '/fetchDealers', description: 'Fetch all dealerships' },
  { method: 'GET', path: '/fetchDealers/Texas', description: 'Fetch dealerships by state' },
  { method: 'GET', path: '/fetchDealer/1', description: 'Fetch one dealership by ID' },
  { method: 'GET', path: '/fetchReviews', description: 'Fetch all reviews' },
  { method: 'GET', path: '/fetchReviews/dealer/1', description: 'Fetch reviews for one dealer' },
  { method: 'POST', path: '/insert_review', description: 'Insert a review with JSON body' },
];

const apiHome = (req, res) => {
  const basePath = req.get('x-forwarded-prefix') || req.baseUrl || '';
  const rows = apiLinks.map((link) => {
    const href = `${basePath}${link.path}`;
    const action = link.method === 'GET'
      ? `<a href="${href}">${href}</a>`
      : `<code>${href}</code>`;

    return `
      <tr>
        <td><span class="method">${link.method}</span></td>
        <td>${action}</td>
        <td>${link.description}</td>
      </tr>
    `;
  }).join('');

  res.send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>DriveLine Express/Mongo API</title>
        <style>
          body {
            margin: 0;
            background: #f4f6f8;
            color: #18202a;
            font-family: "Segoe UI", Arial, sans-serif;
          }
          main {
            max-width: 980px;
            margin: 48px auto;
            padding: 0 20px;
          }
          .hero, table, .note {
            background: white;
            border: 1px solid #dde4ec;
            border-radius: 8px;
            box-shadow: 0 8px 22px rgba(16, 42, 67, 0.06);
          }
          .hero {
            padding: 28px;
            margin-bottom: 18px;
          }
          h1 {
            margin: 0 0 10px;
            font-size: 34px;
          }
          p {
            color: #667085;
            line-height: 1.55;
            margin: 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
          }
          th, td {
            padding: 14px;
            border-bottom: 1px solid #edf1f5;
            text-align: left;
            vertical-align: top;
          }
          th {
            color: #667085;
            font-size: 13px;
            text-transform: uppercase;
          }
          a {
            color: #0f766e;
            font-weight: 700;
          }
          code {
            background: #f1f5f9;
            border-radius: 5px;
            padding: 3px 6px;
          }
          .method {
            display: inline-block;
            min-width: 48px;
            text-align: center;
            border-radius: 999px;
            background: #e6f4f1;
            color: #0f766e;
            font-size: 12px;
            font-weight: 800;
            padding: 5px 8px;
          }
          .note {
            margin-top: 18px;
            padding: 18px;
          }
        </style>
      </head>
      <body>
        <main>
          <section class="hero">
            <h1>DriveLine Express/Mongo API</h1>
            <p>These endpoints are served by Express and backed by MongoDB. Click any GET endpoint to view JSON directly in the browser address bar.</p>
          </section>
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <section class="note">
            <p>Browser-friendly URLs: <code>http://localhost:3030/api/fetchDealers</code> or <code>http://localhost:3000/api/fetchDealers</code>.</p>
          </section>
        </main>
      </body>
    </html>
  `);
};

router.get('/', apiHome);

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'express-mongo-api',
    mongo: mongoose.connection.readyState,
  });
});

router.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

router.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealer reviews' });
  }
});

router.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships' });
  }
});

router.get('/fetchDealers/:state', async (req, res) => {
  try {
    const documents = await Dealerships.find({ state: req.params.state });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealerships by state' });
  }
});

router.get('/fetchDealer/:id', async (req, res) => {
  try {
    const documents = await Dealerships.find({ id: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching dealership' });
  }
});

router.post('/insert_review', async (req, res) => {
  const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  try {
    const documents = await Reviews.find().sort({ id: -1 });
    const newId = documents.length > 0 ? documents[0].id + 1 : 1;

    const review = new Reviews({
      id: newId,
      name: data.name,
      dealership: data.dealership,
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year,
    });

    const savedReview = await review.save();
    res.status(201).json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

app.use('/', router);
app.use('/api', router);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
