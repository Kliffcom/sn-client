import { globals } from '../../../src/globalStyles'
import { pathWithQueryParams } from '../../../src/services/query-string-builder'

describe('Drawer items navigation', () => {
  beforeEach(() => {
    cy.login()
    cy.visit(pathWithQueryParams({ path: '/', newParams: { repoUrl: Cypress.env('repoUrl') } }))
  })

  it('clicking on the search icon on the drawer should navigate to the Saved Queries page', () => {
    cy.get('[data-test="Search"]').as('searchIcon')
    cy.get('@searchIcon').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/saved-queries/')
    })
  })

  it('clicking on the globe icon on the drawer should navigate to the Content page', () => {
    cy.get('[data-test="Content"]').as('contentIcon')
    cy.get('@contentIcon').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/content/explorer/')
    })
  })

  it('clicking on the Users and groups icon on the drawer should navigate to the Users and groups page', () => {
    cy.get('[data-test="Users and groups"]').as('UsersAndGroupsIcon')
    cy.get('@UsersAndGroupsIcon').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/users-and-groups/explorer/')
    })
  })

  it('clicking on the Trash icon on the drawer on the drawer should navigate to the Trash page', () => {
    cy.get('[data-test="Trash"]').as('trashIcon')
    cy.get('@trashIcon').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/trash/explorer/')
    })
  })

  it('clicking on the Content Types icon on the drawer should navigate to the Content Types page', () => {
    cy.get('[data-test="Content Types"]').as('contentTypesIcon')
    cy.get('@contentTypesIcon').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/content-types/explorer/')
    })
  })

  it('clicking on the Localization icon on the drawer should navigate to the Localization page', () => {
    cy.get('[data-test="Localization"]').as('localizationIcon')
    cy.get('@localizationIcon').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/localization/explorer/')
    })
  })

  it('clicking on the Setup icon on the drawer should navigate to the Setup page', () => {
    cy.get('[data-test="Setup"]').as('setupIcon')
    cy.get('@setupIcon').click()
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/setup/')
    })
  })
})
