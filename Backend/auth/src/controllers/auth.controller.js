import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";
import { wakeUpNotificationService } from "../utils/wakeUpService.js";
import dns from "dns";
// Force Node to use IPv4 instead of IPv6
dns.setDefaultResultOrder("ipv4first");

// Function to check MX records
async function validateEmailDomain(email) {
  try {
    const domain = email.split("@")[1];
    if (!domain) return false;

    const mxRecords = await dns.promises.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (err) {
    return false; // Domain invalid or no MX records
  }
}

export async function register(req, res) {
  wakeUpNotificationService();
  // const {email, password, fullName:{firstName, lastName}, role='listener'} = req.body;
  const { email, password, fullName = {}, role = "listener" } = req.body;
  const { firstName, lastName } = fullName;

  // Validate email domain
  const isValidDomain = await validateEmailDomain(email);
  if (!isValidDomain) {
    return res.status(400).json({ error: "Email domain cannot receive mail" });
  }

  const isUserAlreadyExists = await userModel.findOne({ email });

  if (isUserAlreadyExists) {
    return res.status(400).json({ message: "User Already Exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    email,
    password: hash,
    fullName: {
      firstName,
      lastName,
    },
    role,
  });

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      fullName: user.fullName,
    },
    config.JWT_SECRET,
    { expiresIn: "2d" }
  );

  await publishToQueue("user_created", {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    ...(config.NODE_ENV === "production" && config.COOKIE_DOMAIN
      ? { domain: config.COOKIE_DOMAIN }
      : {}),
  };

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    message: `${user.fullName.firstName} ${user.fullName.lastName}, Account Created Successfully`,
    token,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

export async function login(req, res) {
  wakeUpNotificationService();

  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res
      .status(400)
      .json({ message: "Invalid Credentials || User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res
      .status(400)
      .json({ message: "Invalid Credentials || Incorrect Password" });
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
      fullName: user.fullName,
    },
    config.JWT_SECRET,
    { expiresIn: "2d" }
  );

  await publishToQueue("user_logged_in", {
    id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    ...(config.NODE_ENV === "production" && config.COOKIE_DOMAIN
      ? { domain: config.COOKIE_DOMAIN }
      : {}),
  };

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: `${user.fullName.firstName} ${user.fullName.lastName}, Logged In Successfully`,
    token,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

export async function googleAuthCallback(req, res) {
  wakeUpNotificationService();

  const user = req.user;
  console.log(user);

  const isUserAlreadyExists = await userModel.findOne({
    $or: [{ email: user.emails[0].value }, { googleId: user.id }],
  });

  if (isUserAlreadyExists) {
    const token = jwt.sign(
      {
        id: isUserAlreadyExists._id,
        role: isUserAlreadyExists.role,
        fullName: isUserAlreadyExists.fullName,
      },
      config.JWT_SECRET,
      { expiresIn: "2d" }
    );

    await publishToQueue("user_logged_in", {
      id: isUserAlreadyExists._id, // use DB user id, not raw Google profile
      email: isUserAlreadyExists.email, // always safe from DB
      fullName: isUserAlreadyExists.fullName,
      role: isUserAlreadyExists.role,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: config.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      ...(config.NODE_ENV === "production" && config.COOKIE_DOMAIN
        ? { domain: config.COOKIE_DOMAIN }
        : {}),
    };

    res.cookie("token", token, cookieOptions);

    return res.redirect(`${config.FRONTEND_URL}/artist/dashboard`);
  }

  const newUser = await userModel.create({
    googleId: user.id,
    email: user.emails[0].value,
    fullName: {
      firstName: user.name.givenName,
      lastName: user.name.familyName,
    },
  });

  // Send notification for new Google user registration
  await publishToQueue("user_created", {
    id: newUser._id,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role,
  });

  const token = jwt.sign(
    {
      id: newUser._id,
      role: newUser.role,
      fullName: newUser.fullName,
    },
    config.JWT_SECRET,
    { expiresIn: "2d" }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
    ...(config.NODE_ENV === "production" && config.COOKIE_DOMAIN
      ? { domain: config.COOKIE_DOMAIN }
      : {}),
  };

  res.cookie("token", token, cookieOptions);

  res.redirect(`${config.FRONTEND_URL}`);
}

export async function getCurrentUser(req, res) {
  try {
    // req.user is populated by the authMiddleware
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        profilePicture: user.profilePicture || "",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}

export async function logout(req, res) {
  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    ...(config.NODE_ENV === "production" && config.COOKIE_DOMAIN
      ? { domain: config.COOKIE_DOMAIN }
      : {}),
  };

  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
}

export async function getToken(req, res) {
  // Protected by auth middleware; the cookie is present and valid
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }
    return res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Get public artist profile by artist ID (for artist detail pages)
export async function getPublicArtistProfile(req, res) {
  try {
    const { artistId } = req.params;

    // Find artist user by ID
    const artist = await userModel
      .findById(artistId)
      .select("-password -__v -notifications -privacy -preferences");

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // Verify the user is actually an artist
    if (artist.role !== "artist") {
      return res.status(400).json({ message: "User is not an artist" });
    }

    // Return public artist information
    res.status(200).json({
      message: "Artist profile fetched successfully",
      artist: {
        id: artist._id,
        fullName: artist.fullName,
        displayName: `${artist.fullName.firstName} ${artist.fullName.lastName}`,
        bio: artist.bio || "",
        profilePicture: artist.profilePicture || "",
        role: artist.role,
        createdAt: artist.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching artist profile:", error);
    res.status(500).json({
      message: "Error fetching artist profile",
      error: error.message,
    });
  }
}

// Get public artist profile by artist name (alternative endpoint)
export async function getPublicArtistProfileByName(req, res) {
  try {
    const { artistName } = req.params;
    const decodedName = decodeURIComponent(artistName);

    // Search for artist by name (case-insensitive)
    // Note: This searches for exact full name match
    const nameParts = decodedName.trim().split(/\s+/);

    let query = { role: "artist" };

    if (nameParts.length === 1) {
      // Single name - could be first or last name
      query.$or = [
        { "fullName.firstName": new RegExp(`^${nameParts[0]}$`, "i") },
        { "fullName.lastName": new RegExp(`^${nameParts[0]}$`, "i") },
      ];
    } else {
      // Multiple parts - assume first name(s) and last name
      const firstName = nameParts.slice(0, -1).join(" ");
      const lastName = nameParts[nameParts.length - 1];
      query["fullName.firstName"] = new RegExp(`^${firstName}$`, "i");
      query["fullName.lastName"] = new RegExp(`^${lastName}$`, "i");
    }

    const artist = await userModel
      .findOne(query)
      .select("-password -__v -notifications -privacy -preferences");

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    // Return public artist information
    res.status(200).json({
      message: "Artist profile fetched successfully",
      artist: {
        id: artist._id,
        fullName: artist.fullName,
        displayName: `${artist.fullName.firstName} ${artist.fullName.lastName}`,
        bio: artist.bio || "",
        profilePicture: artist.profilePicture || "",
        role: artist.role,
        createdAt: artist.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching artist profile by name:", error);
    res.status(500).json({
      message: "Error fetching artist profile",
      error: error.message,
    });
  }
}
