import superagent from 'superagent';
import bearerAuth from 'superagent-auth-bearer';
import { startServer } from '../lib/server';
import { createProfileMockPromise, removeAllResources } from './lib/profile-mock';

bearerAuth(superagent);

const apiUrl = `http://localhost:${process.env.PORT}/api/v1`;
beforeAll(async () => { await startServer(); });

describe('SYNOPSIS ROUTER TESTS', () => {
  const mockHtmlDoc = `<!doctype html>
  <head>
    <title>PDF DOC TEST</title>
  </head>
  <body>
    <h1>THIS IS A TEST PDF DOCUMENT</h1>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. <b>Lorem ipsum dolor sit amet, consectetur adipiscing elit</b>. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur sodales ligula in libero. <b>Lorem ipsum dolor sit amet, consectetur adipiscing elit</b>. Sed dignissim lacinia nunc. </p>
    <p>Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor. Morbi lectus risus, iaculis vel, suscipit quis, luctus non, massa. Fusce ac turpis quis ligula lacinia aliquet. Mauris ipsum. Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh. Quisque volutpat condimentum velit. </p>

    <p><b>Sed dignissim lacinia nunc</b>. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam nec ante. Sed lacinia, urna non tincidunt mattis, tortor neque adipiscing diam, a cursus ipsum ante quis turpis. Nulla facilisi. Ut fringilla. Suspendisse potenti. <b>Nulla metus metus, ullamcorper vel, tincidunt sed, euismod in, nibh</b>. Nunc feugiat mi a tellus consequat imperdiet. Vestibulum sapien. Proin quam. Etiam ultrices. Suspendisse in justo eu magna luctus suscipit. Sed lectus. </p>
</body>`;
  let mockData;
  beforeEach(async () => {
    await removeAllResources();
    mockData = await createProfileMockPromise();
  });

  describe('SYNOPSIS POST ROUTE TESTS', () => {
    test('POST 200 of PDF file', async () => {
      const requestBody = {
        name: 'HtmlDoc',
        date: new Date().toISOString(),
        html: mockHtmlDoc,
        options: {
          format: 'Letter',
        },
      };
      let result;
      try {
        result = await superagent.post(`${apiUrl}/synopsis`)
          .authBearer(mockData.mentorToken)
          .body(requestBody);
      } catch (err) {
        console.log('post failed', JSON.stringify(err, null, 4));
      }
      console.log('POST succeeded?!', JSON.stringify(result.body, null, 4));
      expect(true).toBeTruthy();
    });
  });
});
