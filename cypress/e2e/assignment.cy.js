before(function(){
  cy.fixture('user_info').then(function(userinfo){
    this.userinfo = userinfo
  })
})


describe('E-commerce shopping workflow automation', function() {


  it('Opens the application', function() {
    cy.visit('http://automationpractice.com/index.php')
    
    //assertions for not-logged-in state
    cy.get('a.account span').should('not.exist')

    //going one step further to assert the logged out state in the shopping cart area
    cy.get('.shopping_cart a:not([id])').click()
    
    cy.get('#cart_title').should('be.visible')
                         .and('contain', 'Shopping-cart summary')
    cy.get('#order_step li.second').should('be.visible')
                                   .and('have.class', 'step_todo')
                                   .and('contain', 'Sign in')
  })

  
  it('Logs in', ()=> {
    cy.get('.login').click()

    //assertions for login page
    cy.get('.home + .navigation-pipe + .navigation_page').should('be.visible')
                                                         .and('contain', 'Authentication')
    cy.get('#login_form').should('be.visible')
                         .and('contain', 'Already registered?')

    //login form fillup with assertions in between 
    cy.get('#email').type(username)
    cy.get('#login_form h3').click()
    cy.get('input#email').parent().should('have.class', 'form-ok')
    
    cy.get('input#passwd').type(password)
    //form.submit() method didn't log in so using the submit_button.click() method instead
    cy.get('form#login_form #SubmitLogin').click()

    //Assertions after user is logged in
    cy.get('a.account span').should('contain', 'Test User')
    cy.get("p.info-account").should("be.visible")
                            .and('contain', 'Welcome to your account.');
  })


  it('Searches for a product and adds an item to cart', () => {
    cy.get('input#search_query_top').type("Dress").type('{enter}')
    // cy.get('[name=submit_search]').click()

    //at this point, the user gets logged out automatically after submitting the search query.
    //This becomes a problem later in the logout phase.
    // cy.get('a.account span').should('contain', 'Test User')

    //assertion after search results are loaded
    cy.get('.product-listing').should("be.visible")
                               .and('contain', product_name)
                               .and('contain', 'results have been found.')

    cy.get('.quick-view-mobile').first().click()
    cy.get('#fancybox-loading', {timeout:10000}).should('not.exist')

    //using custom method to search inside the iframe/#document for the product popup scren
    getIframeBody().find('#add_to_cart button').click()

    //assertion to check if product was added to cart
    cy.get('.layer_cart_product h2').should('exist')
                                    .and('be.visible')
                                    .and('contain', 'Product successfully added to your shopping cart')
    
    cy.get('a[title=\'Proceed to checkout\']').click()

    //assertions to check if product was added to cart
    cy.get('.shopping_cart .ajax_cart_quantity').should("contain", '1')
    cy.get('#summary_products_quantity').should('contain', '1 Product')
    cy.get('table#cart_summary tbody tr').should('have.length', 1)

  })


  it('Logs out', () => {
    //this failed every time I executed it in my machine. See line 53 for more info.
    cy.get('.logout').should('exist').click()
    cy.get('.login').should('exist')
  })


  //method to get iframe body
  const getIframeBody = () => {
  return cy.get('iframe[id*=fancybox-frame]')
            .its('0.contentDocument').should('exist')
            .its('body').should('not.be.undefined')
            .then(cy.wrap)
  }
})