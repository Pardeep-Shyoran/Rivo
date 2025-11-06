import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";

export async function register(req, res) {
  // const {email, password, fullName:{firstName, lastName}, role='listener'} = req.body;
  const { email, password, fullName = {}, role = "listener" } = req.body;
  const { firstName, lastName } = fullName;

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
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  };

  res.cookie("token", token, cookieOptions);

  res.status(201).json({
    message: `${user.fullName.firstName} ${user.fullName.lastName}, Account Created Successfully`,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

export async function login(req, res) {
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

  const cookieOptions = {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
  };

  res.cookie("token", token, cookieOptions);

  res.status(200).json({
    message: `${user.fullName.firstName} ${user.fullName.lastName}, Logged In Successfully`,
    user: {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
  });
}

export async function googleAuthCallback(req, res) {
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

    const cookieOptions = {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
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
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
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
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
  };
  
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logged out successfully" });
}