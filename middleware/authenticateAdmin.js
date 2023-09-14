const jwt = require("jsonwebtoken");
const Member = require("../model/memberSchema");

const AuthenticateAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken;

        const verifyToken = jwt.verify(token, process.env.SECRET_KEY);

        const rootMember = await Member.findOne({ _id: verifyToken._id, "tokens.token": token });

        if (!rootMember || rootMember.role!=='0') {
            throw new Error('Member Not Found');
        }

        req.token = token;
        req.rootMember = rootMember;
        req.MemberID = rootMember._id;
        next();
    }
    catch (err) {
        res.status(401).send('Unauthorized: No token provided');
        // console.log(err);
    }
}

module.exports = AuthenticateAdmin;