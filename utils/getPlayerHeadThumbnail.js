import axios from 'axios';

export const getPlayerHeadThumbnail = async (userArrayID) => {
  try {
    const userIds = userArrayID.join(",");
    const response = await axios.get(
      `https://thumbnails.roblox.com/v1/users/avatar-bust?userIds=${userIds}&size=48x48&format=Png&isCircular=false`
    );

    const thumbnails = response.data.data.map((thumbnailData) => {
      if (thumbnailData && thumbnailData.state === "Completed") {
        return {
          targetId: thumbnailData.targetId,
          imageUrl: thumbnailData.imageUrl,
        };
      } else {
        return null;
      }
    });

    return thumbnails;
  } catch (error) {
    console.error("Error fetching thumbnails:", error);
    return [];
  }
};
