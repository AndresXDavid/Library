import jwt from "jsonwebtoken";

export const createToken = (user: any) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

export const getUserFromToken = (req: any) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch {
    return null;
  }
};

export const requireRole = (role: string, user: any) => {
  if (!user) throw new Error("No autenticado");
  if (user.role !== role) throw new Error("Sin permisos");
};
