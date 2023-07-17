import serverAuth from "@/libs/serverAuth";
import prisma from "@/libs/prismadb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method != "POST" && req.method != "DELETE") {
    return res.status(405).end();
  }

  try {
    const { userId } = req.query;

    const { currentUser } = await serverAuth(req, res);

    if (!userId || typeof userId != "string") {
      throw new Error("Invalid ID");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new Error("Invalid ID");
    }

    let updatedFollowings = [...(user.followingIds || [])];

    if (req.method === "POST") {
      updatedFollowings.push(userId);
    }

    if (req.method === "DELETE") {
      updatedFollowings = updatedFollowings.filter(
        (followingId) => followingId != userId
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        followingIds: updatedFollowings,
      },
    });

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).end();
  }
}
