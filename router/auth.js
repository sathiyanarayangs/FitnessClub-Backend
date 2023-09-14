const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const authenticateAdmin = require('../middleware/authenticateAdmin');

var defaultuser="";
router.use(cookieParser());
require('../db/conn');

const Member = require('../model/memberSchema');
const Messages = require('../model/messageSchema');
const Trainers = require('../model/trainerSchema');
const Classes = require('../model/classesSchema');

router.get('/', (req, res) => {
    res.send('hello world from auth.js');
});


// Async-await approach
//register route
router.post('/register', async (req, res) => {

    const { name, email, phone, gender, weight, height, age, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !gender || !weight || !height || !age || !password || !confirmPassword) {
        return res.status(422).json({ error: "Please fill all the entries" });
    }

    try {
        const memberExists = await Member.findOne({ email: email });

        if (memberExists) {
            return res.status(422).json({ error: "Email already exists" });
        }
        else if (password !== confirmPassword) {
            return res.status(422).json({ error: "Password not matching" });
        }

        const role = "1";

        const member = new Member({ name, email, phone, gender, weight, height, age, password, confirmPassword, role });


        //password hashing in memberSchema
        await member.save();

        res.status(201).json({ message: "Registration successful" });

    }
    catch (err) {
        console.log(err);
    }
});

//login route
router.post('/signin', async (req, res) => {
    try {
        let token;
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Please fill in all the details" })
        }

        const memberLogin = await Member.findOne({ email: email });

        if (memberLogin) {
            const isMatch = await bcrypt.compare(password, memberLogin.password);

            token = await memberLogin.generateAuthToken();

            res.cookie("jwtoken", token, {
                expires: new Date(Date.now() + 25892000000), //expires within 30 days
                httpOnly: true
            });

            if (!isMatch) {
                return res.status(400).json({ error: "Invalid credentials" });
            }

            defaultuser=memberLogin;

            if (memberLogin.role === "1") {
                // User role (role 1)
                res.json({ message: "User sign-in successful", role: "user" });
            } else if (memberLogin.role === "0") {
                // Admin role (role 0)
                res.json({ message: "Admin sign-in successful", role: "admin" });
            } else {
                // Invalid role
                res.status(400).json({ error: "Invalid role" });
            }
        } else {
            res.status(400).json({ error: "Invalid credentials" });
        }
    } catch (err) {
        console.log(err);
    }
});


//about page

router.get('/about',  (req, res) => {
    res.send(req.rootMember);
});

//get user data for contact us, classes booking and home page 
router.get('/getdata',  (req, res) => {
    res.send(defaultuser);
});

//contact us page
router.post('/contact',  async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        if (!name || !email || !phone || !message) {
            // console.log("Invalid Input");
            return res.json({ message: "Please fill the details" })
        }

        //adding in messages table
        const Message = new Messages({ name, email, phone, message });
        await Message.save();
        // res.status(201).json({ message: "Contact message done" })

        const memberContact = await Member.findOne({ _id: req.MemberID });

        //ading in Users data
        if (memberContact) {
            const memberMessage = await memberContact.addMessage(name, email, phone, message);
            await memberContact.save();
            res.status(201).json({ message: "Message Sent" })
        }

    }
    catch (err) {
        console.log(err);
    }
});

//logout
router.get('/logout', (req, res) => {
    // console.log("Logging Out");
    defaultuser="";
    res.clearCookie('jwtoken', { path: '/' });
    res.status(200).send("User Logout");
});


//get all users

router.get('/getusers',  async (req, res) => {
    try {
        const users = await Member.find({ role: "1" });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

//get all messages
router.get('/getmessages',  async (req, res) => {
    try {
        const messages = await Messages.find();
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});



// register trainers

router.post('/addtrainer', async (req, res) => {
    const { name, email, phone, gender, jobtitle, instalink, fblink, twlink, description, image } = req.body;
    if (!name || !email || !phone || !gender || !jobtitle || !instalink || !fblink || !twlink || !description) {
        return res.status(422).json({ error: "Please fill all the entries" });
    }
    try {
        const trainerExists = await Trainers.findOne({ email: email });
        if (trainerExists) {
            return res.status(422).json({ error: "Email already exists" });
        }
        const trainers = new Trainers({ name, email, phone, gender, jobtitle, instalink, fblink, twlink, description, image });
        await trainers.save();
        res.status(201).json({ message: "Registration successful" });

    }
    catch (err) {
        console.log(err);
    }
});



//get all trainers
router.get('/getTrainers', async (req, res) => {
    try {
        const users = await Trainers.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

//add classes
router.post('/addclasses', async (req, res) => {
    const { title, days, timing, instructorEmail, image, description } = req.body;
    if (!title || !days || !timing || !instructorEmail || !description) {
        return res.status(422).json({ error: "Please fill all the entries" });
    }
    try {
        const trainer = await Trainers.findOne({ email: instructorEmail });
        if (!trainer) {
            return res.status(422).json({ error: "Trainer Email does not exist" });
        }

        const courseID = title.toLowerCase().replace(/\s/g, "");

        const findSame = await Classes.findOne({ courseID: courseID })

        if (findSame) {
            return res.status(422).json({ error: "Course already exists" });
        }

        const trainerclasses = await trainer.addClasses(title, timing, days);
        await trainer.save();

        const classes = new Classes({ courseID, title, days, timing, instructorEmail, instructorName: trainer.name, instructorJobtitle: trainer.jobtitle, image, description });
        await classes.save();

        res.status(201).json({
            trainerMessage: "Course added to trainer",
            registrationMessage: "Registration successful"
        });
    }
    catch (err) {
        console.log(err);
    }
});

//get all classes
router.get('/getClasses', async (req, res) => {
    try {
        const classes = await Classes.find();
        res.json(classes);
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});


//course details
router.post('/getClassData', async (req, res) => {
    try {
        const courseID = req.body.courseID;
        const course = await Classes.findOne({ courseID: courseID });
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json(course);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving course' });
    }
});

//trainer details
router.post('/getTrainerData', async (req, res) => {
    try {
        const trainerEmail = req.body.trainerEmail;
        const trainer = await Trainers.findOne({ email: trainerEmail });
        // if (!trainer) {
        //     return res.status(404).json({ error: 'Trainer not found' });
        // }
        res.json(trainer);
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving trainer' });
    }
});


//buying course
router.post('/buyCourse', async (req, res) => {
    try {
        const classID = req.body.courseID;
        const memberID = req.MemberID;

        // const memberContact = await Member.findOne({ _id: memberID });
        const memberContact = defaultuser;

        if (memberContact!=='') {
            const isCourseAlreadyPresent = memberContact.courses.some(course => course.classID === classID);

            if (isCourseAlreadyPresent) {
                res.status(400).json({ message: "Course is already purchased" });
            } else {
                memberContact.courses.push({ classID });
                await memberContact.save();
                res.status(201).json({ message: "Course added successfully" });
            }
        } else {
            res.status(404).json({ message: "Member not found" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});



module.exports = router;
