const getEnvironmentsCard = require("./adaptiveCards/getEnvironmentsCommand.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { CardFactory, MessageFactory } = require("botbuilder");
const CosmosClient = require('@azure/cosmos').CosmosClient
const config = require('./internal/config')

class GetDeploymentProgressCommandHandler {
  triggerPatterns = "getDeploymentsProgress";
  

  async handleCommandReceived(context, message) {
    // verify the command arguments which are received from the client if needed.
    console.log(`App received message: ${message.text}`);
    var channelId = context.activity.conversation.id;
    const endpoint = config.COSMOS_ENDPOINT;
    const key = config.COSMOS_KEY;
    const databaseId = config.COSMOS_DATABASE;
    const containerId = config.COSMOS_CONTAINER;
    const client = new CosmosClient({ endpoint, key });
    const database = client.database(databaseId);
    const container = database.container(containerId);
    const { resource: item } = await container.item(channelId, channelId).read();

    // check if item is null
    if (item.apiToken == null || item.subscriptionCode == null) {
      var message = "You need to setup the api token first. \n\n";
      message += "Please run the command: setupApiToken (apiToken) (subscriptionCode) \n\n";
      await context.sendActivity(MessageFactory.text(message));
      return;
    }

    var base_url = config.CCV2_BASE_URL;
    var subscriptionId = item.subscriptionCode;
    var bearer_token = item.apiToken;

    var deployment_code = message.text.split(" ")[1];

    if (deployment_code == null || deployment_code == "") {
      // call an api to CCV2 to get all previous deployments
      const axios = require("axios");
      const url = base_url + subscriptionId + "/deployments?subscriptionCode="+subscriptionId+"&top=4&count=true&orderby=desc";
      console.log(url);
      const response = await axios.get(url, {
        headers: {
          Authorization: "Bearer " + bearer_token,
        },
      });

      var response_data = response.data['value']
      // convert response_data list to 4 items
      response_data = response_data.splice(0,4)
      console.log(response_data);
    
      let replyMessage = "The following deployments are available: \n\n";
      for (var i = 0; i < response_data.length; i++) {
        replyMessage += "======================================" + "\n\n";
        replyMessage += "Deployment code: " + response_data[i]['code'] + "\n\n";
        replyMessage += "Deployment status: " + response_data[i]['status'] + "\n\n";
        replyMessage += "Deployment build code: " + response_data[i]['buildCode'] + "\n\n";
        replyMessage += "Deployment environment code: " + response_data[i]['environmentCode'] + "\n\n";
      }

      // render your adaptive card for reply message
      const cardData = {
        title: "Past Deployments Information",
        body: replyMessage,
      };

      const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
      return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));

    }

    else
    {
      let cardData = {};
      try{
        // call an api to CCV2 to get the environments
        const axios = require("axios");
        const url = base_url + subscriptionId + "/deployments/"+deployment_code+"/progress";
        console.log(url);
        const response = await axios.get(url, {
          headers: {
            Authorization: "Bearer " + bearer_token,
          },
        });
        console.log(response.data);
        const response_data = response.data;
        let replyMessage = "Deployment with code " + deployment_code + " has the following progress: \n\n";
        replyMessage += "DeploymentStatus: " + response_data['deploymentStatus'] + "\n\n";
        replyMessage += "Percentage: " + response_data['percentage'] + "%\n\n";

        // render your adaptive card for reply message
        cardData = {
          title: "Deployment Progress Information",
          body: replyMessage,
        };
      }
      catch (error) {
        console.error(error);
        let replyMessage = "Error in getting the deployment progress, please recheck the deployment code";
        cardData = {
          title: "Error in getting the deployment progress",
          body: replyMessage,
        };
      }

    const cardJson = AdaptiveCards.declare(getEnvironmentsCard).render(cardData);
    return MessageFactory.attachment(CardFactory.adaptiveCard(cardJson));
  }
}
}

module.exports = {
  GetDeploymentProgressCommandHandler,
};

