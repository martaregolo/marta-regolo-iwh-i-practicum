const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = '';
const hubspotUrl = 'https://api.hubapi.com/crm/v3/objects/2-39465700';

app.get('/', async (req, res) => {
    const propertiesUrl = 'https://api.hubapi.com/crm/v3/properties/2-39465700';
    const headers = {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    };
  
    try {
      // Fetch all records of the custom object
      const response = await axios.get(hubspotUrl, { headers });
      const records = response.data.results;
      const detailedRecords = await Promise.all(
        records.map(async (record) => {
          const recordUrl = `${hubspotUrl}/${record.id}?properties=name&properties=game&properties=role`;
          const detailedResponse = await axios.get(recordUrl, { headers });
          return detailedResponse.data;
        })
      );
      console.log('Detailed records:', detailedRecords);
      res.render('homepage', {
        pageTitle: 'Homepage | Integrating With HubSpot I Practicum',
        records: detailedRecords,
        properties: ['name', 'game', 'role'],
      });
    } catch (error) {
      console.error('Error fetching custom object records:', error.response?.data || error.message);
      res.status(500).send('Error fetching custom object records.');
    }
  });
  
app.get('/update-cobj', (req, res) => {
    res.render('updates', { pageTitle: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
  });
  
  app.post('/update-cobj', async (req, res) => {
    const { name, game, role } = req.body;
    const headers = {
      Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
      'Content-Type': 'application/json',
    };
  
    const data = {
      properties: {
        name: name,
        game: game,
        role: role,
      },
    };
  
    try {
      await axios.post(hubspotUrl, data, { headers });
      res.redirect('/update-cobj');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating custom object record.');
    }
  });
  
// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));