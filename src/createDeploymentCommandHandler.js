const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");

class CreateDeploymentCommandHandler {
  triggerPatterns = "createDeployment";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    var base_url = "https://portalapi.commerce.ondemand.com/v2/subscriptions/";
    var subscriptionId = "e270819c655d47abb06f515433e6b789";
    var bearer_token = "aee08635a9afa0b5be4626d9b41eb26";

    var build_code = message.text.split(" ")[1];
    var databaseUpdateMode = message.text.split(" ")[2].toUpperCase();
    var environmentCode = message.text.split(" ")[3];
    var strategy = message.text.split(" ")[4].toUpperCase();

    // call an api to CCV2 to get the environments
    const axios = require("axios");
    const url = base_url + subscriptionId + "/deployments";
    console.log(url);
    const response = await axios.post(url, {
      "buildCode": build_code,
      "databaseUpdateMode": databaseUpdateMode,
      "environmentCode" : environmentCode,
      "strategy" : strategy
    }, 
    {
      headers: {
        Authorization: "Bearer " + bearer_token,
      }
    });
    console.log(response.data);
    const deployment_code = response.data['code'];
    let replyMessage = "Deployment with build code " + build_code + "\n\n and Database Update Mode " + databaseUpdateMode + "\n\n and Environment Code " + environmentCode + "\n\n and Strategy " + strategy + "\n\n has been created with code " + deployment_code;

    // render your adaptive card for reply message
    const cardData = {
      title: "Deployment is now created",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  CreateDeploymentCommandHandler,
};

