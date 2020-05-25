const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, cb) => {
  const corsOptions = { origin: whitelist.includes(req.header('Origin')) };

  console.log('corsOptions', corsOptions);

  cb(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);