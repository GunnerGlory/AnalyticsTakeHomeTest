const trigram = require('../trigram-service');
const text = 'I wish I may I wish I might';
const kvTrigram = { 
                    'I wish': [ 'I', 'I' ], 
                    'wish I': [ 'may', 'might' ],'I may': [ 'I' ],'may I': [ 'wish'] };
const kvTrigramJson = JSON.stringify(kvTrigram);
const inputObj = {
  fileName:'text.txt',
  trigrams: kvTrigramJson,
  maxSize: 5,
  seedWord: 'I wish',
};

test(`Number of trigrams in the test '${text}' is 4`, done => {
    function callback(data) {
      expect (Object.keys (data).length).toBe(4);
      expect(data['I wish'][0]).toBe('I');
      expect(data['I may'][0]).toBe('I');
      expect(data['wish I'][0]).toBe('may');
      expect(data['wish I'][1]).toBe('might');
      done();
    }
    trigram.createTrigramAnalysis(text, callback);
  });

  test(`New text from trigram is not ''No text generated.'`, done => {
    function callback(data) {
      expect (data).not.toBe('No text generated.');
      done();
    }
    trigram.generateNewText(inputObj, callback);
  });
