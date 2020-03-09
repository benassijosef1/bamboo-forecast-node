module.exports = {
  makeHeaders: function(path, authToken, accountId, boolean) {
    let headerObject = {
      "Content-Type": "application/json",
      authority: "api.forecastapp.com",
      path: path,
      scheme: "https",
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      authorization: authToken,
      "forecast-account-id": accountId,
      "forecast-client-version": "1.0.2+3ac3e7d",
      origin: "https://forecastapp.com",
      referer: "https://forecastapp.com/",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    };
    if (boolean != true) {
      headerObject.length = "224";
      return headerObject;
    }
    return headerObject;
  }
};
