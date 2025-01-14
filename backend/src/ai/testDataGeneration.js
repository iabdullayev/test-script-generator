const faker = require('@faker-js/faker'); // If you install it
// or you can also use an LLM if you want AI-based suggestions

function generateTestData(elements) {
  // For example, return an object with random data for each text field
  const data = {};
  elements.forEach(el => {
    if (el.type === 'textField') {
      if (el.caseName.toLowerCase().includes('email')) {
        data[el.caseName] = faker.internet.email();
      } else if (el.caseName.toLowerCase().includes('password')) {
        data[el.caseName] = faker.internet.password();
      } else {
        data[el.caseName] = faker.lorem.words(2);
      }
    }
    // For buttons, we might not generate data
  });
  return data;
}

module.exports = { generateTestData };