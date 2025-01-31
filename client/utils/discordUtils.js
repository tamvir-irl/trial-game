export async function appendVoiceChannelName(discordSdk) {
    const app = document.querySelector("#app");
    let activityChannelName = "Unknown";
  
    if (discordSdk.channelId && discordSdk.guildId) {
      const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
      if (channel.name) activityChannelName = channel.name;
    }
  
    const textTag = document.createElement("p");
    textTag.textContent = `Activity Channel: "${activityChannelName}"`;
    app.appendChild(textTag);
  }
  
  export async function appendGuildAvatar(discordSdk, auth) {
    const app = document.querySelector("#app");
  
    const guilds = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${auth.access_token}`, "Content-Type": "application/json" },
    }).then((res) => res.json());
  
    const currentGuild = guilds.find((g) => g.id === discordSdk.guildId);
  
    if (currentGuild) {
      const guildImg = document.createElement("img");
      guildImg.src = `https://cdn.discordapp.com/icons/${currentGuild.id}/${currentGuild.icon}.webp?size=128`;
      guildImg.style = "border-radius: 50%; width: 128px; height: 128px;";
      app.appendChild(guildImg);
    }
  }
  