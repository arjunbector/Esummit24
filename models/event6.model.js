import mongoose, { mongo } from "mongoose";
import UsersDetails from "@/components/userDetails";

const event4Schema = mongoose.Schema(
    {
        user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: UsersDetails,
        }
    }
)

const Event5 =  mongoose.model("Event5", event5Schema);
export default Event5;