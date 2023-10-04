const { BotBuilderCloudAdapter } = require("@microsoft/teamsfx");
const ConversationBot = BotBuilderCloudAdapter.ConversationBot;
const { HelpCommandHandler } = require("../helpCommandHandler");
const { GetEnvironmentsCommandHandler } = require("../getEnvironmentsCommandHandler");
const { GetBuildProgressCommandHandler } = require("../getBuildProgressCommandHandler");
const { CreateBuildCommandHandler } = require("../createBuildCommandHandler");
const { GetDeploymentProgressCommandHandler } = require("../getDeploymentProgressCommandHandler");
const { CreateDeploymentCommandHandler } = require("../createDeploymentCommandHandler");
const config = require("./config");

// Create the command bot and register the command handlers for your app.
// You can also use the commandApp.command.registerCommands to register other commands
// if you don't want to register all of them in the constructor
const commandApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: config.botId,
    MicrosoftAppPassword: config.botPassword,
    MicrosoftAppType: "MultiTenant",
  },
  command: {
    enabled: true,
    commands: [new HelpCommandHandler(), new GetEnvironmentsCommandHandler(), new GetBuildProgressCommandHandler(), new CreateBuildCommandHandler(), new GetDeploymentProgressCommandHandler(), new CreateDeploymentCommandHandler()],
  },
});

module.exports = {
  commandApp,
};
