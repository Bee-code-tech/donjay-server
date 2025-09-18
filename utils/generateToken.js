import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  

  console.log("Token Set:", token);

  return token
};

export default generateTokenAndSetCookie;
