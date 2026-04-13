import { UserModel } from "../../DB/model/user.model.js"
import { ConflictException } from './../../common/utils/response/error.response.js';

export const signup = async (inputs) => {
    const { fullName, email, password, phone } = inputs;
    const emailExist = await UserModel.findOne({ email })
    if (emailExist) {
        throw ConflictException({message:"Email already exist"})
    }

    const [user] = await UserModel.create([{ fullName, email, password, phone }]);
    return user;
}
