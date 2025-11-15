import mongoose from "mongoose";
import followModel from "../models/follow.model.js";
import musicModel from "../models/music.model.js";
import userModel from "../models/user.model.js";
import { getPresignedUrl } from "../services/storage.service.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const formatFullName = (fullName) => {
  if (!fullName || typeof fullName !== "object") {
    return null;
  }

  const parts = [fullName.firstName, fullName.lastName]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  return parts.length ? parts.join(" ") : null;
};

const fetchDisplayNamesForListeners = async (listenerIds) => {
  if (!Array.isArray(listenerIds) || !listenerIds.length) {
    return new Map();
  }

  const uniqueValidIds = Array.from(
    new Set(
      listenerIds
        .filter((id) => id && isValidObjectId(id))
        .map((id) => id.toString())
    )
  );

  if (!uniqueValidIds.length) {
    return new Map();
  }

  try {
    const objectIds = uniqueValidIds.map((id) => new mongoose.Types.ObjectId(id));
    const users = await userModel
      .find({ _id: { $in: objectIds } })
      .select({ fullName: 1 })
      .lean();

    const nameMap = new Map();

    users.forEach((user) => {
      const displayName = formatFullName(user?.fullName);
      if (displayName) {
        nameMap.set(user._id.toString(), displayName);
      }
    });

    return nameMap;
  } catch (err) {
    console.error("Failed to fetch listener display names:", err);
    return new Map();
  }
};

export async function followArtist(req, res) {
  const listenerId = req.user?.id;
  const { artistId } = req.params;
  const { artistName: bodyArtistName } = req.body || {};
  let listenerFullName = formatFullName(req.user?.fullName);

  if (!listenerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!isValidObjectId(artistId)) {
    return res.status(400).json({ message: "Invalid artist id" });
  }

  if (listenerId === artistId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  try {
    let artistName = bodyArtistName?.trim() || null;

    if (!artistName) {
      const latestMusic = await musicModel
        .findOne({ artistId })
        .sort({ createdAt: -1 })
        .select({ artist: 1 })
        .lean();
      artistName = latestMusic?.artist || null;
    }

    if (!listenerFullName) {
      try {
        const listenerRecord = await userModel
          .findById(listenerId)
          .select({ fullName: 1 })
          .lean();
        listenerFullName = formatFullName(listenerRecord?.fullName);
      } catch (err) {
        console.warn("Failed to load listener name for follow record", listenerId, err?.message);
      }
    }

    const updateFields = { artistName };

    if (listenerFullName) {
      updateFields.listenerName = listenerFullName;
    }

    await followModel.updateOne(
      { listenerId, artistId },
      {
        $setOnInsert: {
          listenerId,
          artistId,
        },
        $set: updateFields,
      },
      { upsert: true }
    );

    const totalFollowers = await followModel.countDocuments({ artistId });

    return res.status(200).json({
      success: true,
      followers: totalFollowers,
    });
  } catch (err) {
    console.error("Error following artist:", err);
    return res
      .status(500)
      .json({ message: "Failed to follow artist", error: err.message });
  }
}

export async function unfollowArtist(req, res) {
  const listenerId = req.user?.id;
  const { artistId } = req.params;

  if (!listenerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!isValidObjectId(artistId)) {
    return res.status(400).json({ message: "Invalid artist id" });
  }

  try {
    await followModel.deleteOne({ listenerId, artistId });

    const totalFollowers = await followModel.countDocuments({ artistId });

    return res.status(200).json({ success: true, followers: totalFollowers });
  } catch (err) {
    console.error("Error unfollowing artist:", err);
    return res
      .status(500)
      .json({ message: "Failed to unfollow artist", error: err.message });
  }
}

export async function isFollowingArtist(req, res) {
  const listenerId = req.user?.id;
  const { artistId } = req.params;

  if (!listenerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!isValidObjectId(artistId)) {
    return res.status(400).json({ message: "Invalid artist id" });
  }

  try {
    const existing = await followModel
      .findOne({ listenerId, artistId })
      .lean();

    return res.status(200).json({ isFollowing: Boolean(existing) });
  } catch (err) {
    console.error("Error checking follow state:", err);
    return res
      .status(500)
      .json({ message: "Failed to check follow state", error: err.message });
  }
}

export async function getFollowersCount(req, res) {
  const { artistId } = req.params;

  if (!isValidObjectId(artistId)) {
    return res.status(400).json({ message: "Invalid artist id" });
  }

  try {
    const totalFollowers = await followModel.countDocuments({ artistId });

    return res.status(200).json({ count: totalFollowers });
  } catch (err) {
    console.error("Error fetching followers count:", err);
    return res
      .status(500)
      .json({
        message: "Failed to fetch followers count",
        error: err.message,
      });
  }
}

export async function getArtistFollowers(req, res) {
  const artistId = req.user?.id;

  if (!artistId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!isValidObjectId(artistId)) {
    return res.status(400).json({ message: "Invalid artist id" });
  }

  try {
    const followers = await followModel
      .find({ artistId })
      .sort({ createdAt: -1 })
      .lean();

    const missingNameIds = followers
      .filter((follower) => !follower.listenerName && follower.listenerId)
      .map((follower) => follower.listenerId.toString());

    const fallbackNameMap = await fetchDisplayNamesForListeners(missingNameIds);

    const bulkNameUpdates = [];

    const formatted = followers.map((follower) => {
      const listenerIdString = follower.listenerId?.toString() || null;
      let listenerName = follower.listenerName?.trim() || null;

      if (!listenerName && listenerIdString) {
        const fallbackName = fallbackNameMap.get(listenerIdString) || null;
        if (fallbackName) {
          listenerName = fallbackName;
          bulkNameUpdates.push({
            updateOne: {
              filter: { _id: follower._id },
              update: { $set: { listenerName: fallbackName } },
            },
          });
        }
      }

      return {
        id: follower._id?.toString() || null,
        listenerId: listenerIdString,
        listenerName,
        followedAt: follower.createdAt || null,
      };
    });

    if (bulkNameUpdates.length) {
      followModel
        .bulkWrite(bulkNameUpdates, { ordered: false })
        .catch((err) => {
          console.warn("Failed to backfill listener names:", err?.message);
        });
    }

    return res.status(200).json({
      count: formatted.length,
      followers: formatted,
    });
  } catch (err) {
    console.error("Error fetching artist followers:", err);
    return res
      .status(500)
      .json({
        message: "Failed to fetch artist followers",
        error: err.message,
      });
  }
}

export async function getMyFollowedArtists(req, res) {
  const listenerId = req.user?.id;

  if (!listenerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const follows = await followModel
      .find({ listenerId })
      .sort({ createdAt: -1 })
      .lean();

    if (!follows.length) {
      return res.status(200).json({ artists: [] });
    }

    const artistObjectIds = follows
      .map((follow) => follow.artistId)
      .filter((id) => id && isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id.toString()));

    const artistStats = await musicModel
      .aggregate([
        { $match: { artistId: { $in: artistObjectIds } } },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$artistId",
            artistName: { $first: "$artist" },
            latestTrack: { $first: "$$ROOT" },
            trackCount: { $sum: 1 },
          },
        },
      ])
      .exec();

    const statsMap = new Map(
      artistStats.map((stat) => [stat._id.toString(), stat])
    );

    const enriched = await Promise.all(
      follows.map(async (follow) => {
        const key = follow.artistId?.toString();
        const stat = key ? statsMap.get(key) : null;
        const latestTrack = stat?.latestTrack || null;
        let coverImageUrl = null;

        if (latestTrack?.coverImageKey) {
          try {
            coverImageUrl = await getPresignedUrl(latestTrack.coverImageKey);
          } catch (err) {
            console.warn(
              "Failed to generate cover image URL for artist",
              key,
              err?.message
            );
          }
        }

        return {
          artistId: key,
          artistName: stat?.artistName || follow.artistName || null,
          followedAt: follow.createdAt,
          trackCount: stat?.trackCount || 0,
          latestTrack: latestTrack
            ? {
                id: latestTrack._id,
                title: latestTrack.title,
                createdAt: latestTrack.createdAt,
                coverImageUrl,
              }
            : null,
        };
      })
    );

    return res.status(200).json({ artists: enriched });
  } catch (err) {
    console.error("Error fetching followed artists:", err);
    return res
      .status(500)
      .json({ message: "Failed to fetch followed artists", error: err.message });
  }
}
