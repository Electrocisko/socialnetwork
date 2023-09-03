const Follow = require("../models/follow.js");

const followUserIds = async (identityUserId) => {
  try {
    let following = await Follow.find({ user: identityUserId }).select({
      followed: 1,
      _id: 0,
    });

    let followers = await Follow.find({ followed: identityUserId }).select({
      user: 1,
      _id: 0,
    });

    let followingList = [];
    following.forEach((element) => {
      followingList.push(element.followed);
    });

    let followersList = [];
    followers.forEach((element) => {
      followersList.push(element.user);
    });
    return {
      followersList,
      followingList,
    };
  } catch (error) {
    return {status: "error"};
  }
};

const followThisUser = async (identityUserId, profileUserId) => {
  try {
    let following = await Follow.findOne({ user: identityUserId, followed: profileUserId }).select("-__v ");
    let follower = await Follow.findOne({ user: profileUserId , followed: identityUserId}).select("-__v ");
    
    return {
      following,
      follower
    }
  } catch (error) {
    return {status: "error"}
  }
};

module.exports = {
  followUserIds,
  followThisUser,
};
