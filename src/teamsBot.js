const { TeamsActivityHandler, MessageFactory, TeamsInfo } = require("botbuilder");
const config = require('./internal/config')
const CosmosClient = require('@azure/cosmos').CosmosClient
const ACData = require('adaptivecards-templating');
const TextEncoder = require('util').TextEncoder;

// An empty teams activity handler.
// You can add your customization code here to extend your bot logic if needed.
class TeamsBot extends TeamsActivityHandler {
  constructor() {
    super();
    this.onInstallationUpdateAdd(async (context) => {
      var channelId = context.activity.conversation.id;
      var adminId = context.activity.from.id;
      var admin = await TeamsInfo.getMember(context, adminId);
      var adminName = admin.name;

      const endpoint = config.COSMOS_ENDPOINT;
      const key = config.COSMOS_KEY;
      const databaseId = config.COSMOS_DATABASE;
      const containerId = config.COSMOS_CONTAINER;
      const client = new CosmosClient({ endpoint, key });
      const database = client.database(databaseId);
      const container = database.container(containerId);

      // create a new item
      const newItem = {
        id: channelId,
        adminId: adminId,
        adminName: adminName,
        apiToken: null,
        subscriptionCode: null,
        createAccessUsers: [],
      };

      const { resource: createdItem } = await container.items.upsert(newItem);

      const mention = {
        mentioned: {
          id: adminId,
          name: adminName,
        },
        text: `<at>${ new TextEncoder().encode(adminName)}</at>`,
        type: "mention",
      };

      var message = "DevOps Bot has been installed successfully. \n\n";
      message += `${mention.text} you are the admin of this bot. \n\n`;
      message += "Please use following command to setup CCV2 credentials \n\n";
      message += "setupApiToken <api_token> <subscription_code> \n\n";

      const replyActivity = MessageFactory.text(message);
      replyActivity.entities = [mention];
      await context.sendActivity(replyActivity);
      

    });

  }
}

module.exports.TeamsBot = TeamsBot;
