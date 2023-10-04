const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");

class CreateBuildCommandHandler {
  triggerPatterns = "createBuild";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    var base_url = "https://portalapi.commerce.ondemand.com/v2/subscriptions/";
    var subscriptionId = "e270819c655d47abb06f515433e6b789";
    var bearer_token = "aee08635a9afa0b5be4626d9b41eb26";

    var name = message.text.split(" ")[1];
    var branch = message.text.split(" ")[2];

    // call an api to CCV2 to get the environments
    const axios = require("axios");
    const url = base_url + subscriptionId + "/builds";
    console.log(url);
    const response = await axios.post(url, {
      name: name,
      branch: branch
    },
     {
      headers: {
        Authorization: "Bearer " + bearer_token,
      }
    });
    console.log(response.data);
    const build_code = response.data['code'];
    let replyMessage = "Build with name " + name + " \n\n and Branch " + branch + "\n\n has been created with code " + build_code;

    // render your adaptive card for reply message
    const cardData = {
      title: "Build is now created",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  CreateBuildCommandHandler,
};

