import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  expiresIn: {
    type: Date,
    required: true,
  },
},
{
  timestamps: true,
    strict: true,
  }
);

tokenSchema.index("expiresIn", { expireAfterSeconds: 0 });

const TokenModel = mongoose.models.Token || mongoose.model("Token", tokenSchema);
export default TokenModel;