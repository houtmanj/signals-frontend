const { Builder, By, Key, until } = require('selenium-webdriver');

// Input capabilities
const capabilities = {
  'browserstack.key': 'qkumD6netLtrtzkZmbhz',
  'browserstack.local': true,
  'browserstack.user': 'jjmvandeursen1',
  acceptSslCerts: 'true',
  browser_version: '11.0',
  browserName: 'IE',
  name: 'Bstack-[Node] Sample Test',
  os_version: '7',
  os: 'Windows',
  resolution: '1024x768',
};

const example = async () => {
  const driver = new Builder()
    .usingServer('https://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();

  // const baseUrl = 'https://acc.meldingen.amsterdam.nl';
  const baseUrl = 'http://localhost:3001';

  try {
    await driver.get(`${baseUrl}/incident/beschrijf`);
    await driver.findElement(By.id('nlmaps-geocoder-control-input')).sendKeys('Weesperstraat 113', Key.RETURN);
    await driver.findElement(By.css('textarea')).sendKeys('Teveel fietsen in de stalling');
    await driver.findElement(By.css('[for="datetime-Nu1"]')).click();
    await driver.findElement(By.css('[for="datetime-Nu1"]')).submit();

    await driver.wait(until.urlIs(`${baseUrl}/incident/vulaan`), 500);

    await driver.findElement(By.css('input[type="text"]')).sendKeys('Geen wrak, gewoon erg veel fietsen', Key.RETURN);

    await driver.wait(until.urlIs(`${baseUrl}/incident/telefoon`), 500);

    await driver.findElement(By.css('input[type="text"]')).sendKeys('14020');
    await driver.findElement(By.css('.incident-navigation button[type="submit"]')).submit();

    await driver.wait(until.urlIs(`${baseUrl}/incident/email`), 500);

    await driver.findElement(By.css('input[type="text"]')).sendKeys('info@amsterdam.nl');
    await driver.findElement(By.css('.incident-navigation button[type="submit"]')).submit();

    await driver.wait(until.urlIs(`${baseUrl}/incident/samenvatting`), 500);

    await driver.findElement(By.css('.incident-navigation button[type="submit"]')).submit();

    await driver.wait(until.urlIs(`${baseUrl}/incident/bedankt`), 500);

    await driver.findElement(By.css('.bedankt')).getText().startsWith('Uw melding is bij ons bekend onder nummer:');
  } catch(e) {
    console.log(e.message);
  } finally {
    await driver.quit();
  }
};

return example();
