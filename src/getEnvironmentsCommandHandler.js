const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");

class GetEnvironmentsCommandHandler {
  triggerPatterns = "getEnvironments";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    var base_url = "https://portalapi.commerce.ondemand.com/v2/subscriptions/";
    var subscriptionId = "e270819c655d47abb06f515433e6b789";
    var bearer_token = "aee08635a9afa0b5be4626d9b41eb26";

    // call an api to CCV2 to get the environments
    const axios = require("axios");
    const url = base_url + subscriptionId + "/environments";
    console.log(url);
    const response = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + bearer_token,
      },
    });
    console.log(response.data);
    const environments = response.data['value'];
    let replyMessage = "";
    for (const environment of environments) {
      replyMessage += " ===================== \n\n Environment: " + environment['name'] + "\n\n Status: " + environment['status'] + " \n\n DeploymentStatus: " + environment['deploymentStatus'] + "\n\n";
    }

    // render your adaptive card for reply message
    const cardData = {
      title: "CCV2 Environments Information",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  GetEnvironmentsCommandHandler,
};

