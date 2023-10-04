const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");

class GetBuildProgressCommandHandler {
  triggerPatterns = "getBuildProgress";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    var base_url = "https://portalapi.commerce.ondemand.com/v2/subscriptions/";
    var subscriptionId = "e270819c655d47abb06f515433e6b789";
    var bearer_token = "aee08635a9afa0b5be4626d9b41eb26";

    var build_code = message.text.split(" ")[1];

    // call an api to CCV2 to get the environments
    const axios = require("axios");
    const url = base_url + subscriptionId + "/builds/"+build_code+"/progress";
    console.log(url);
    const response = await axios.get(url, {
      headers: {
        Authorization: "Bearer " + bearer_token,
      },
    });
    console.log(response.data);
    const response_data = response.data;
    let replyMessage = "Build with code " + build_code + " has the following progress: \n\n";
    replyMessage += "errorMessage: " + response_data['errorMessage'] + "\n\n";
    replyMessage += "Percentage: " + response_data['percentage'] + "%\n\n";

    // render your adaptive card for reply message
    const cardData = {
      title: "Build Progress Information",
      body: replyMessage,
    };

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}

module.exports = {
  GetBuildProgressCommandHandler,
};

