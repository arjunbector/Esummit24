import { connectMongoDB } from "@/lib/mongodb";
import { TeamModel } from "@/models/TeamDetails";
import { UsersDetails } from "@/models/Userdetails";
import { NextResponse } from "next/server";

import UserDetails from "@/components/userDetails";
import { getToken } from "next-auth/jwt";
import { getTokenDetails } from "../../../../../utils/authuser";

export async function POST(req, { params }) {
  try {
    await connectMongoDB();

    const token = await getToken({req})
    const auth = token ? token.accessTokenFromBackend : null
    let userId = await getTokenDetails(auth);

    const teamId = params.teamId;
    const team = await TeamModel.findById({ _id: teamId });
    console.log(team);

    if (!team) {
      return res.status(401).json({
        message: "Invalid TeamId to remove",
      });
    }

    const userToRemove = await UserDetails.findById({ _id: userId });
    if (!userToRemove) {
      return NextResponse.json({ message: "UserID is invalid", status: 200 });
    }

    if (team.teamLeaderId.toString() !== userId) {
      return NextResponse.json({
        message: "User doesn't belong to the team or user isn't a leader",
        status: 200,
      });
    }

    if (
      userToRemove.teamId == null ||
      userToRemove.teamId.toString() !== teamId
    ) {
      return res.status(401).json({
        message: "User to remove and TeamId didnt Match",
      });
    }

    await UsersDetails.findOneAndUpdate(
      { _id: req.body.userId },
      { teamId: null, teamRole: -1 }
    );

    //updating team
    await TeamModel.findOneAndUpdate(
      { _id: req.params.teamId },
      { $pull: { members: req.body.userId } }
    );

    return NextResponse.json({
      message: "Team member removed successfully",
      status: 200,
    });
  } catch (error) {
    console.error("An error occurred:", error);
    return NextResponse.json({ message: "Error occurred ", status: 500 });
  }
}
