const HeadlessChrome = require('simple-headless-chrome')
const Input = require('prompt-input');
const filter = require('lodash/filter')

var input = new Input({
  name: 'code',
  message: 'What is your code?'
});

const browser = new HeadlessChrome({
  headless: false
})

async function navigateWebsite () {
  try {
    await browser.init()
    const mainTab = await browser.newTab({
      privateTab: false
    })
    await mainTab.goTo('https://www.coinbase.com/oauth/authorize/oauth_signin?client_id=2d06b9a69c15e183856ff52c250281f6d93f9abef819921eac0d8647bb2b61f9&meta%5Baccount%5D=all&redirect_uri=https%3A%2F%2Fpro.coinbase.com%2Foauth_redirect&response_type=code&scope=user+balance&state=cce4a8c7-4bd3-4130-8a70-c4165fca6f48')

    console.log("filling in details")
    await mainTab.fill('#email', '<coinbase-email>')
    await mainTab.fill('#password', '<coinbase-pass>')


    await mainTab.wait(2000)

    console.log("singing in")
    await mainTab.click('#signin_button')
    
    const ans = await input.run()

    await mainTab.fill('#token', ans)

    await mainTab.wait(2000)
    await mainTab.click('#step_two_verify')

    await mainTab.waitForSelectorToLoad('[data-pup="161381559"]')

    await mainTab.click('[data-pup="161381559"]')

    await mainTab.goTo('https://pro.coinbase.com/profile/api')

    await mainTab.waitForPageToLoad()

    // get a 2fa code
    // post to the apikeys route

    // await browser.close()
  } catch (err) {
    console.log('ERROR!', err)
  }
}
navigateWebsite()