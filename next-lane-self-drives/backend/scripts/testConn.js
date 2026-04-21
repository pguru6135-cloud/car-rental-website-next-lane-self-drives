const mongoose = require('mongoose');

const uri = 'mongodb+srv://Guru:guruprasad@cluster0.eopw1lt.mongodb.net/nextlane_fresh?retryWrites=true&w=majority';

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected with mongodb+srv successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  });
