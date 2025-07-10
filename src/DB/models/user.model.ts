import { Schema ,model, Document} from 'mongoose'
import bcrypt from"bcrypt";

const UserSchema = new Schema({
    userName:{
        type:String,
        required:true,
        min:3,
        max:20
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    gender:{
        type:String,
        enum:["male","female"]
    },
    phone:{
        type:String
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user"
    },
    forgetCode:String,
},{timestamps: true})

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

export const User = model("User",UserSchema);
