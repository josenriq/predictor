const fetch = require('cross-fetch');
const fs = require('fs');

const API_HOST = 'http://localhost:4000';
const TARGET_FILE = 'src/app/graphql/codegen/possible-types.json';

fetch(`${API_HOST}/graphql`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    variables: {},
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  }),
})
  .then(result => result.json())
  .then(result => {
    const possibleTypes = {};

    result.data.__schema.types.forEach(supertype => {
      if (supertype.possibleTypes) {
        possibleTypes[supertype.name] = supertype.possibleTypes.map(
          subtype => subtype.name,
        );
      }
    });

    fs.writeFile(TARGET_FILE, JSON.stringify(possibleTypes), err => {
      if (err) {
        console.error('Error writing possibleTypes.json', err);
      } else {
        console.log('Possible types successfully extracted!');
      }
    });
  });
