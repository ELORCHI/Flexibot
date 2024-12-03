import { EmbedBuilder, User, ColorResolvable } from "discord.js";

const generateEmbed = (
  title: string,
  description: string,
  color: ColorResolvable,
  user: User
): EmbedBuilder => {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({
      text: `Requested by ${user.tag}`,
      iconURL: user.displayAvatarURL(),
    })
    .setTimestamp();
};
export { generateEmbed };
