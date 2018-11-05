// Notes:
// Need to disable certain ESLint rules that are not very helpful
// in Cypress due to the need for the `this` context across tests.

/* eslint-disable prefer-arrow-callback, func-names */

// todo: fix urls
// Cypress will automatically attempt to serve your files if you don’t provide a host.
// The path should be relative to your project’s root folder (where cypress.json is located).
// Having Cypress serve your files is useful in simple projects and example apps,
// but isn’t recommended for real apps. It is always better to run your own server
// and provide the url to Cypress.
const userUrl = 'http://cloud.local.graasp.eu:8080/index.html?appInstanceId=1&userId=1';
const adminUrl = 'http://cloud.local.graasp.eu:8080/index.html?appInstanceId=1&mode=admin';

describe('app', function () {
  context('user mode', function () {
    beforeEach(function () {
      cy.visit(userUrl);
    });

    it('.should() - assert that <title> is correct', function () {
      cy.title().should('include', 'Progress Bar');
    });

    it('cy.get() - query dom elements', function () {
      // progress slider should be visible
      cy.get('#progressSlider').should('be.visible');

      // title should contain the expected text
      cy.get('h3.title').should('contain', 'My Progress');

      // tabs to select view should be hidden
      cy.get('ul.view-select').should('be.hidden');

      // teacher should be hidden
      cy.get('div.teacher-content').should('be.hidden');
    });
  });

  context('admin mode', function () {
    beforeEach(function () {
      cy.visit(adminUrl);
    });

    it('.should() - assert that <title> is correct', function () {
      cy.title().should('include', 'Progress Bar');
    });

    it('cy.get() - query dom elements', function () {
      // progress slider should be hidden
      cy.get('#progressSlider').should('be.hidden');

      // title should contain the expected text
      cy.get('h3.title').should('contain', 'My Progress');

      // tabs to select view should be visible
      cy.get('ul.view-select')
        .should('be.visible');

      // there should be two tabs
      cy.get('ul.view-select')
        .children()
        .should('have.length', 2);

      // teacher view should be selected
      cy.get('li.view-teacher').should('have.class', 'active');

      // teacher content should be visible
      cy.get('div.teacher-content').should('be.visible');
    });
  });
});
