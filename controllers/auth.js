const User = require('../models/User');
const Booking  = require('../models/Booking');

//@desc Register user
//@route POST /api/v1/auth/register
//@access Public
exports.register=async (req,res,next) => {
    try {
        const {name,telephone,email,password,role}=req.body;

        const user=await User.create({
            name,
            telephone,
            email,
            password,
            role
        });

        sendTokenResponse(user,200,res);
    } catch (err) {
        console.log(err);
        res.status(400).json({success:false,error:err.message});
    }
};

//@desc Login user
//@route POST/api/v1/auth/login
//@access Public
exports.login=async (req,res,next) => {
try {
    const {email,password} =req.body;

    if (!email||!password) {
        return res.status(400).json({success:false,msg:'Please provide an email and password'});
    }

    //User Check
    const user=await User.findOne({email}).select(`+password`);
    if (!user) {
        return res.status(400).json({success:false,msg:'Invalid credentuials'});
    }

    //PW Match Check
    const isMatch=await user.matchPassword(password);

    if (!isMatch) {
        return res.status(401).json({success:false,msg:'Invalid credentials'});
    }

    //Create token
    // const token=user.getSignedJwtToken();
    // res.status(200).json({success:true,token});
    sendTokenResponse(user,200,res);
    } catch (err) {
        return res.status(401).json({ 
            success: false, 
            msg: 'Cannot convert email or password to string' 
        });
    }
};

const sendTokenResponse = (user,statusCode,res)=> {
    //Create Token
    const token=user.getSignedJwtToken();

    // console.log('JWT_COOKIE_EXPIRE raw:', process.env.JWT_COOKIE_EXPIRE);
    // console.log('Converted:', Number(process.env.JWT_COOKIE_EXPIRE));

    const options={
        expires:new Date(Date.now()+process.env.JWT_COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    };

    if (process.env.NODE_ENV=='production') {
        options.secure=true;
    } 
    res.status(statusCode).cookie('token',token,options).json({success:true,token})
}

exports.getMe=async(req,res,next)=> {
    const user=await User.findById(req.user.id);
    res.status(200).json({success:true,data:user});
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = async (req, res, next) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    res.status(200).json({
        success: true,
        data: {}
    });
    console.log("yatta!");
};

//@desc Change password
//@route PUT /api/v1/auth/updatepassword
//@access Private
exports.updatepassword=async (req,res,next)=>{

    const user=await User.findById(req.user.id).select('+password');

    if (!user) {
        return res.status(401).json({success:false,msg:'User not found'});
    }
    const {currentpassword,newpassword} = req.body;

    if (!currentpassword||!newpassword) {
        return res.status(401).json({success:false,msg:'Please provide an current password or new password'});
    }

    const isMatch = await user.matchPassword(currentpassword);
    if (!isMatch) {
        return res.status(401).json({success:false,msg:'Current password is incorrect'});
    } else {
        user.password=newpassword;
        await user.save();

        sendTokenResponse(user,200,res);
    }
}


//@desc    Delete user and their bookings
//@route   DELETE /api/v1/users/:id
//@access  Private (Admin)
exports.deleteuser=async (req,res,next)=>{
    try {
        const user=await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({success:false,msg:'User not found'});
        }

        await Booking.deleteMany({user:req.params.id});

        await user.deleteOne();

        return res.status(200).json({success:true,msg:"User deleted",data:user});

    }catch(err){
        return res.status(500).json({success:false,msg:'Cant delete user'});
    }
}