const User = require('./models/User'); // Adjust the path if needed

const testUser = new User({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
});

console.log(testUser); // This should print the user object if the constructor works
