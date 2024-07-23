import { getPlayerHeadThumbnail } from './getPlayerHeadThumbnail.js';

export const modifyPlayersData = async (serversObject) => {
  const modifiedServers = {};
  const allUserIds = [];

  for (const serverID in serversObject) {
    const players = serversObject[serverID];
    players.forEach(player => {
      allUserIds.push(player.UserID);
    });
  }

  const playerThumbnails = await getPlayerHeadThumbnail(allUserIds);

  const thumbnailMap = {};
  playerThumbnails.forEach(thumbnail => {
    if (thumbnail && thumbnail.imageUrl) {
      thumbnailMap[thumbnail.targetId] = thumbnail.imageUrl;
    }
  });

  for (const serverID in serversObject) {
    const players = serversObject[serverID];

    modifiedServers[serverID] = players.map(player => {
      return {
        ...player,
        headThumbnail: thumbnailMap[player.UserID] || null,
      };
    });
  }

  return modifiedServers;
};
