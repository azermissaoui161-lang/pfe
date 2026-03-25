const { seedUsers } = require('../../scripts/seedUsers');

seedUsers().catch((error) => {
  console.error(error.message);
  process.exit(1);
});