let playerData = {};
let getDataPromiseResolve;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export const kickPlayer = async (req, res) => {
  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ message: "UserID is required" });
  }

  try {
    playerData[userID] = { status: "kick" };

    // Create a new promise that will be resolved when /get-data is called
    const getDataPromise = new Promise((resolve) => {
      getDataPromiseResolve = resolve;
    });

    // Wait for /get-data to be called
    await getDataPromise;

    res.status(200).json({ message: "Player kicked successfully" });
  } catch (error) {
    console.error('Error handling /kick request:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPlayerData = async (req, res) => {
  res.json(playerData);
  

  if (getDataPromiseResolve) {
    getDataPromiseResolve();
    getDataPromiseResolve = null;
  }
  await delay(100); // Adjust the delay as needed (e.g., 100 milliseconds)
  playerData = {};
};
