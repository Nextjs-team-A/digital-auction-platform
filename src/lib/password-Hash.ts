import bcrypt from "bcryptjs";

//hash the password before saving in the database
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

//compare a plain password witha hashed one
export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};